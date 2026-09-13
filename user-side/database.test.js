import test from 'node:test';
import assert from 'node:assert/strict';

process.env.DEMO_DB_PATH = ':memory:';
const { listCharities, upsertCharity, saveAllocation, getAllocation } = await import('./database.js');

test('published nonprofit updates feed the user directory and saved plans persist', () => {
  assert.equal(listCharities().length, 6);
  const record = { category: 'local', name: 'Example Pantry', initials: 'EP', theme: 'green', logoUrl: '', description: 'Demo pantry', cause: 'More meals', goal: 10000, raised: 2000, youtubeUrl: '', status: 'published' };
  upsertCharity('example_pantry', record);
  assert.ok(listCharities().some(item => item.id === 'example_pantry' && item.raised === 2000));
  upsertCharity('example_pantry', { ...record, status: 'draft' });
  assert.ok(!listCharities().some(item => item.id === 'example_pantry'));

  const input = { clientId: 'testclient1234', income: 1000, frequency: 'monthly', paymentMethod: 'visa_1881', categoryShares: { local: 30, national: 30, international: 40 }, charityShares: { local: { harbour: 50, warmth: 50 }, national: { care: 100 }, international: { water: 100 } } };
  const saved = saveAllocation(input);
  assert.equal(saved.giving, 100);
  assert.equal(saved.frequency, 'monthly');
  assert.equal(saved.paymentMethod, 'visa_1881');
  assert.deepEqual(saved.categories.map(item => item.amount), [30, 30, 40]);
  assert.deepEqual(saved.categories[0].charities.map(item => item.amount), [15, 15]);
  assert.deepEqual(getAllocation(input.clientId), saved);
  const walletPlan = saveAllocation({ ...input, paymentMethod: 'apple_pay_demo', cardNumber: '4242424242424242', cvc: '123' });
  assert.equal(walletPlan.paymentMethod, 'apple_pay_demo');
  assert.ok(!JSON.stringify(walletPlan).includes('4242424242424242'));
  assert.ok(!JSON.stringify(walletPlan).includes('"cvc"'));
  assert.throws(() => saveAllocation({ ...input, categoryShares: { local: 99, national: 1, international: 0 } }));
});
