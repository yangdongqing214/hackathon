export const CATEGORY_IDS = ['local', 'national', 'international'];
export const MIN_CATEGORY_PERCENT = 1;
export const GIVING_RATE = 0.10;

export function clampIncome(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function givingAmount(income) {
  return Math.round(clampIncome(income) * GIVING_RATE * 100) / 100;
}

// 整数百分比保证每次操作后恰好合计 100%，避免浮点累计误差。
export function changeCategoryPercent(current, targetId, requested) {
  if (!CATEGORY_IDS.includes(targetId)) return { ...current };
  const next = { ...current };
  const target = Math.max(MIN_CATEGORY_PERCENT, Math.min(98, Math.round(Number(requested) || 0)));
  const otherIds = CATEGORY_IDS.filter(id => id !== targetId);
  const remainder = 100 - target;
  const available = remainder - otherIds.length * MIN_CATEGORY_PERCENT;
  const currentWeights = otherIds.map(id => Math.max(0, (Number(current[id]) || 0) - MIN_CATEGORY_PERCENT));
  const sumWeights = currentWeights.reduce((sum, value) => sum + value, 0);
  const firstExtra = sumWeights > 0 ? Math.round(available * currentWeights[0] / sumWeights) : Math.floor(available / 2);
  next[targetId] = target;
  next[otherIds[0]] = MIN_CATEGORY_PERCENT + firstExtra;
  next[otherIds[1]] = MIN_CATEGORY_PERCENT + available - firstExtra;
  return next;
}

export function equalShares(ids) {
  if (!ids.length) return {};
  const base = Math.floor(100 / ids.length);
  let remainder = 100 - base * ids.length;
  return Object.fromEntries(ids.map(id => [id, base + (remainder-- > 0 ? 1 : 0)]));
}

export function changeCharityShare(current, targetId, requested) {
  const ids = Object.keys(current);
  if (!ids.includes(targetId) || ids.length < 2) return { ...current };
  const target = Math.max(0, Math.min(100, Math.round(Number(requested) || 0)));
  const others = ids.filter(id => id !== targetId);
  const remaining = 100 - target;
  const weights = others.map(id => Math.max(0, Number(current[id]) || 0));
  const weightTotal = weights.reduce((sum, value) => sum + value, 0);
  const raw = others.map((_, index) => weightTotal > 0 ? remaining * weights[index] / weightTotal : remaining / others.length);
  const floor = raw.map(Math.floor);
  let extra = remaining - floor.reduce((sum, value) => sum + value, 0);
  const order = raw.map((value, index) => ({ index, fraction: value - floor[index] })).sort((a, b) => b.fraction - a.fraction);
  for (let i = 0; i < extra; i++) floor[order[i].index]++;
  return { ...Object.fromEntries(others.map((id, index) => [id, floor[index]])), [targetId]: target };
}

export function allocateCents(totalAmount, shares) {
  const ids = Object.keys(shares);
  if (!ids.length) return {};
  const totalCents = Math.round(totalAmount * 100);
  const raw = ids.map(id => totalCents * shares[id] / 100);
  const cents = raw.map(Math.floor);
  let leftover = totalCents - cents.reduce((sum, value) => sum + value, 0);
  const order = raw.map((value, index) => ({ index, fraction: value - cents[index] })).sort((a, b) => b.fraction - a.fraction);
  for (let i = 0; i < leftover; i++) cents[order[i].index]++;
  return Object.fromEntries(ids.map((id, index) => [id, cents[index] / 100]));
}

export function allocationSummary(income, categoryShares, charityShares) {
  const giving = givingAmount(income);
  const categories = allocateCents(giving, categoryShares);
  const charities = {};
  let reserved = 0;
  for (const categoryId of CATEGORY_IDS) {
    const shares = charityShares[categoryId] || {};
    if (Object.keys(shares).length) charities[categoryId] = allocateCents(categories[categoryId], shares);
    else reserved += categories[categoryId] || 0;
  }
  return { giving, categories, charities, reserved: Math.round(reserved * 100) / 100 };
}
