import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCardNumber, formatExpiry, validateDemoCard } from './payment-demo.js';

test('demo card fields format naturally and reject real or expired cards', () => {
  assert.equal(formatCardNumber('4242-4242 4242 4242'), '4242 4242 4242 4242');
  assert.equal(formatExpiry('1234'), '12 / 34');
  const now = new Date('2026-09-13T00:00:00Z');
  const card = { name: 'Demo Supporter', number: '4242 4242 4242 4242', expiry: '12 / 28', cvc: '123' };
  assert.equal(validateDemoCard(card, now), null);
  assert.equal(validateDemoCard({ ...card, number: '4111 1111 1111 1111' }, now).field, 'card-number');
  assert.equal(validateDemoCard({ ...card, expiry: '08 / 26' }, now).field, 'card-expiry');
  assert.equal(validateDemoCard({ ...card, cvc: '12' }, now).field, 'card-cvc');
});
