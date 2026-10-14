import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCheckoutInput, money } from '../supabase/functions/submit-order/validation.js';
import { readDeliverySource } from '../scripts/generate-delivery-zone-seed.mjs';

const key = 'b1d2c3d4-1111-4111-8111-111111111111';
const request = { customer: { name: 'أحمد', phone: '01000000000', governorate: 'القاهرة', area: 'مدينة نصر', address: '1 شارع النيل' }, items: [{ product_id: 'prod-1', quantity: 2 }], deposit_payment_method: 'wallet', remaining_payment_method: 'cash' };
test('accepts a bounded valid checkout request', () => assert.equal(validateCheckoutInput(request, key).quantities.get('prod-1'), 2));
test('rejects missing idempotency keys', () => assert.throws(() => validateCheckoutInput(request, '')));
test('rejects forged browser price fields by ignoring them', () => assert.equal(validateCheckoutInput({ ...request, items: [{ ...request.items[0], unit_price: 0 }] }, key).quantities.get('prod-1'), 2));
test('rejects invalid quantities and payment methods', () => {
  assert.throws(() => validateCheckoutInput({ ...request, items: [{ product_id: 'prod-1', quantity: 0 }] }, key));
  assert.throws(() => validateCheckoutInput({ ...request, deposit_payment_method: 'cash' }, key));
});
test('rounds monetary values deterministically', () => assert.equal(money(0.1 + 0.2), 0.3));
test('null delivery fees remain unknown rather than becoming zero', () => {
  const zones = readDeliverySource().zones;
  const unknown = zones.find((zone) => zone.id === 'north_sinai');
  assert.equal(unknown.delivery_fee, null);
  assert.equal(unknown.text_ar, 'لم يحدد بعد');
  assert.notEqual(unknown.delivery_fee, 0);
});
