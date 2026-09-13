// UI-only test-card helpers. Never send or persist these fields.
export const TEST_VISA = '4242 4242 4242 4242';

export function formatCardNumber(value) {
  return String(value).replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

export function formatExpiry(value) {
  const digits = String(value).replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
}

export function validateDemoCard({ name, number, expiry, cvc }, now = new Date()) {
  if (!String(name).trim()) return { field: 'card-name', message: 'Enter a cardholder name for the demo.' };
  if (String(number).replace(/\D/g, '') !== '4242424242424242') return { field: 'card-number', message: 'Use the test Visa number shown below. Do not enter a real card.' };
  const match = String(expiry).match(/^\s*(\d{2})\s*\/\s*(\d{2})\s*$/);
  if (!match) return { field: 'card-expiry', message: 'Enter the expiry as MM / YY.' };
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12 || year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return { field: 'card-expiry', message: 'Enter a valid future expiry date.' };
  if (!/^\d{3}$/.test(String(cvc))) return { field: 'card-cvc', message: 'Enter a three-digit demo CVV.' };
  return null;
}
