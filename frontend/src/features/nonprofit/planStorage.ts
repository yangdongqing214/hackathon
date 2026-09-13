const PLAN_STORAGE_KEY = "giving-allocation-demo-v2";
const CATEGORY_IDS = ["local", "national", "international"] as const;
type CategoryId = (typeof CATEGORY_IDS)[number];

function isCategoryId(value: string): value is CategoryId {
  return CATEGORY_IDS.includes(value as CategoryId);
}

function equalShares(ids: string[]): Record<string, number> {
  if (!ids.length) return {};
  const base = Math.floor(100 / ids.length);
  let remainder = 100 - base * ids.length;
  return Object.fromEntries(ids.map((id) => [id, base + (remainder-- > 0 ? 1 : 0)]));
}

export function addNonprofitToPlan(org: { id: string; category: string | null }): { ok: boolean; message: string } {
  const category = (org.category ?? "").trim().toLowerCase();
  if (!isCategoryId(category)) {
    return { ok: false, message: "This organization needs a Local, National, or International category first." };
  }

  let state: Record<string, unknown>;
  try {
    const stored = JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY) || "null");
    state = stored && typeof stored === "object" ? stored : {};
  } catch {
    state = {};
  }

  const storedShares = (state.charityShares as Record<string, Record<string, number>> | undefined) ?? {};
  const charityShares: Record<CategoryId, Record<string, number>> = {
    local: storedShares.local ?? {},
    national: storedShares.national ?? {},
    international: storedShares.international ?? {},
  };
  const current = charityShares[category];
  if (org.id in current) return { ok: true, message: "Already in your plan." };

  charityShares[category] = equalShares([...Object.keys(current), org.id]);
  const { pickerCategory: _ignored, ...rest } = state;
  localStorage.setItem(
    PLAN_STORAGE_KEY,
    JSON.stringify({
      user: null,
      clientId: crypto.randomUUID().replaceAll("-", ""),
      saved: null,
      income: 1000,
      frequency: "one_time",
      paymentMethod: "visa_4242",
      categoryShares: { local: 30, national: 30, international: 40 },
      filter: "all",
      ...rest,
      charityShares,
      pickerCategory: category,
    }),
  );
  return { ok: true, message: "Added to your giving plan." };
}
