import { AllocationModel } from "./allocation.model";
import { NonprofitModel } from "../nonprofit/nonprofit.model";
import { CATEGORY_IDS, allocationSummary, clampIncome, type CategoryId } from "./allocation";

const THEMES = ["peach", "purple", "blue", "green", "yellow"];
const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN ?? "http://localhost:4000";

export interface CharityDto {
  id: string;
  category: CategoryId;
  name: string;
  initials: string;
  theme: string;
  logoUrl: string;
  description: string;
  cause: string;
  goal: number;
  raised: number;
  youtubeUrl: string;
  status: "published";
  updatedAt: string;
}

function toCategory(value: string | null | undefined): CategoryId | null {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "local" || normalized === "national" || normalized === "international") return normalized;
  return null;
}

function initialsFrom(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const letters = (parts.length >= 2 ? parts.map((p) => p[0]) : name.slice(0, 2).split("")).join("");
  return letters.replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase() || "NP";
}

function publicUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${PUBLIC_ORIGIN}${path}`;
  return path;
}

export function toCharityDto(doc: {
  _id: { toString(): string };
  org_name?: string | null;
  logo_url?: string | null;
  description?: string | null;
  funding_need_statement?: string | null;
  target_amount?: number | null;
  amount_raised?: number;
  video_url?: string | null;
  category?: string | null;
  updated_at?: Date;
}): CharityDto | null {
  const category = toCategory(doc.category ?? null);
  const name = (doc.org_name ?? "").trim();
  if (!category || !name) return null;
  const id = doc._id.toString();
  const theme = THEMES[id.charCodeAt(id.length - 1) % THEMES.length];
  return {
    id,
    category,
    name,
    initials: initialsFrom(name),
    theme,
    logoUrl: publicUrl(doc.logo_url),
    description: doc.description ?? "",
    cause: doc.funding_need_statement ?? "",
    goal: Number(doc.target_amount ?? 0),
    raised: Number(doc.amount_raised ?? 0),
    youtubeUrl: doc.video_url ?? "",
    status: "published",
    updatedAt: (doc.updated_at ?? new Date()).toISOString(),
  };
}

export async function listPublishedCharities(): Promise<CharityDto[]> {
  const rows = await NonprofitModel.find({ org_name: { $ne: null } }).sort({ org_name: 1 });
  return rows.map(toCharityDto).filter((item): item is CharityDto => item !== null);
}

class GivingValidationError extends Error {}

interface SavedCategory {
  charities: { id: string; amount: number }[];
}

function charityAmountsFromSnapshot(snapshot: { categories?: SavedCategory[] } | null | undefined): Map<string, number> {
  const amounts = new Map<string, number>();
  for (const category of snapshot?.categories ?? []) {
    for (const charity of category.charities ?? []) {
      amounts.set(charity.id, (amounts.get(charity.id) ?? 0) + charity.amount);
    }
  }
  return amounts;
}

// A resubmitted plan replaces the prior one rather than stacking on top of
// it — reverse the previous submission's amounts before applying the new
// ones, so amount_raised reflects only the currently-active simulated plan.
async function applyRaisedDeltas(
  oldSnapshot: { categories?: SavedCategory[] } | null | undefined,
  newSnapshot: { categories?: SavedCategory[] },
): Promise<void> {
  const oldAmounts = charityAmountsFromSnapshot(oldSnapshot);
  const newAmounts = charityAmountsFromSnapshot(newSnapshot);
  const ids = new Set([...oldAmounts.keys(), ...newAmounts.keys()]);
  await Promise.all(
    Array.from(ids).map((id) => {
      const delta = (newAmounts.get(id) ?? 0) - (oldAmounts.get(id) ?? 0);
      return delta !== 0 ? NonprofitModel.updateOne({ _id: id }, { $inc: { amount_raised: delta } }) : null;
    }),
  );
}

function shortText(value: unknown, max: number, label: string, required = false): string {
  if (typeof value !== "string") throw new GivingValidationError(`${label} must be text`);
  const text = value.trim();
  if (required && !text) throw new GivingValidationError(`${label} is required`);
  if (text.length > max) throw new GivingValidationError(`${label} is too long`);
  return text;
}

export async function saveAllocation(input: Record<string, unknown>): Promise<unknown> {
  const clientId = shortText(input.clientId, 80, "clientId", true);
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(clientId)) throw new GivingValidationError("Invalid clientId");
  const income = clampIncome(input.income);
  const frequency = input.frequency;
  if (frequency !== "one_time" && frequency !== "monthly") throw new GivingValidationError("Choose a one-time or monthly plan");
  const paymentMethod = input.paymentMethod;
  if (!["visa_4242", "visa_1881", "apple_pay_demo"].includes(String(paymentMethod))) {
    throw new GivingValidationError("Choose a demo payment method");
  }
  const categoryShares = input.categoryShares as Record<string, number> | undefined;
  if (
    !categoryShares ||
    CATEGORY_IDS.some((id) => !Number.isInteger(categoryShares[id]) || categoryShares[id] < 1) ||
    CATEGORY_IDS.reduce((sum, id) => sum + Number(categoryShares[id]), 0) !== 100
  ) {
    throw new GivingValidationError("Reach percentages must total 100%, with at least 1% each");
  }
  const published = new Map((await listPublishedCharities()).map((charity) => [charity.id, charity]));
  const charityShares: Record<string, Record<string, number>> = {};
  for (const categoryId of CATEGORY_IDS) {
    const shares = (input.charityShares as Record<string, Record<string, number>> | undefined)?.[categoryId] ?? {};
    if (!shares || typeof shares !== "object" || Array.isArray(shares)) throw new GivingValidationError("Invalid nonprofit shares");
    const entries = Object.entries(shares);
    if (entries.length) {
      const total = entries.reduce((sum, [id, share]) => {
        const charity = published.get(id);
        if (!charity || charity.category !== categoryId || !Number.isInteger(share) || share < 0 || share > 100) {
          throw new GivingValidationError("Allocation includes an invalid or unpublished nonprofit");
        }
        return sum + share;
      }, 0);
      if (total !== 100) throw new GivingValidationError("Nonprofit shares within a level must total 100%");
    }
    charityShares[categoryId] = Object.fromEntries(entries);
  }
  const summary = allocationSummary(income, categoryShares, charityShares);
  const savedAt = new Date().toISOString();
  const snapshot = {
    clientId,
    savedAt,
    income,
    frequency,
    paymentMethod,
    categoryShares,
    charityShares,
    giving: summary.giving,
    reserved: summary.reserved,
    categories: CATEGORY_IDS.map((id) => ({
      id,
      percent: categoryShares[id],
      amount: summary.categories[id],
      charities: Object.entries(summary.charities[id] || {}).map(([charityId, amount]) => ({
        id: charityId,
        name: published.get(charityId)!.name,
        percent: charityShares[id][charityId],
        amount,
      })),
    })),
  };
  const existing = await AllocationModel.findOne({ client_id: clientId });
  await applyRaisedDeltas(existing?.snapshot as { categories?: SavedCategory[] } | undefined, snapshot);
  await AllocationModel.findOneAndUpdate({ client_id: clientId }, { snapshot }, { upsert: true, new: true });
  return snapshot;
}

export async function getAllocation(clientId: string): Promise<unknown | null> {
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(clientId)) return null;
  const row = await AllocationModel.findOne({ client_id: clientId });
  return row ? row.snapshot : null;
}

export { GivingValidationError };
