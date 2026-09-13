export const CATEGORY_IDS = ["local", "national", "international"] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

const GIVING_RATE = 0.1;

export function clampIncome(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(1e9, Math.max(0, parsed)) : 0;
}

export function givingAmount(income: number): number {
  return Math.round(clampIncome(income) * GIVING_RATE * 100) / 100;
}

export function allocateCents(totalAmount: number, shares: Record<string, number>): Record<string, number> {
  const ids = Object.keys(shares);
  if (!ids.length) return {};
  const totalCents = Math.round(totalAmount * 100);
  const raw = ids.map((id) => (totalCents * shares[id]) / 100);
  const cents = raw.map(Math.floor);
  let leftover = totalCents - cents.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - cents[index] }))
    .sort((a, b) => b.fraction - a.fraction);
  for (let i = 0; i < leftover; i++) cents[order[i].index]++;
  return Object.fromEntries(ids.map((id, index) => [id, cents[index] / 100]));
}

export function allocationSummary(
  income: number,
  categoryShares: Record<string, number>,
  charityShares: Record<string, Record<string, number>>,
): {
  giving: number;
  categories: Record<string, number>;
  charities: Record<string, Record<string, number>>;
  reserved: number;
} {
  const giving = givingAmount(income);
  const categories = allocateCents(giving, categoryShares);
  const charities: Record<string, Record<string, number>> = {};
  let reserved = 0;
  for (const categoryId of CATEGORY_IDS) {
    const shares = charityShares[categoryId] || {};
    if (Object.keys(shares).length) charities[categoryId] = allocateCents(categories[categoryId], shares);
    else reserved += categories[categoryId] || 0;
  }
  return { giving, categories, charities, reserved: Math.round(reserved * 100) / 100 };
}
