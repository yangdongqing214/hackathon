import test from 'node:test';
import assert from 'node:assert/strict';
import { changeCategoryPercent, changeCharityShare, equalShares, allocationSummary } from './allocation.js';

test('category adjustments preserve 100% and the 1% minimum', () => {
  const result = changeCategoryPercent({ local: 30, national: 30, international: 40 }, 'local', 99);
  assert.equal(result.local, 98);
  assert.equal(result.national + result.international, 2);
  assert.ok(result.national >= 1 && result.international >= 1);
});

test('multiple charities share the category amount without losing cents', () => {
  const shares = equalShares(['a', 'b', 'c']);
  assert.equal(Object.values(shares).reduce((sum, value) => sum + value, 0), 100);
  const updated = changeCharityShare(shares, 'a', 70);
  assert.equal(Object.values(updated).reduce((sum, value) => sum + value, 0), 100);
  const result = allocationSummary(1000.01, { local: 30, national: 30, international: 40 }, { local: updated, national: {}, international: {} });
  assert.equal(result.giving, 100);
  assert.equal(Object.values(result.categories).reduce((sum, value) => sum + value, 0), result.giving);
  assert.equal(Object.values(result.charities.local).reduce((sum, value) => sum + value, 0), result.categories.local);
  assert.equal(result.reserved, result.categories.national + result.categories.international);
});
