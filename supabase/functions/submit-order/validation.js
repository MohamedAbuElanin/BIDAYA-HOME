export const MAX_ITEM_QUANTITY = 100;

const PAYMENT_METHODS = new Set(['instapay', 'wallet', 'bank_transfer']);
const REMAINING_PAYMENT_METHODS = new Set(['cash', ...PAYMENT_METHODS]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateCheckoutInput(value, idempotencyKey) {
  if (!UUID.test(idempotencyKey || '')) throw new Error('A valid idempotency key is required.');
  if (!value || typeof value !== 'object') throw new Error('Invalid checkout payload.');
  const customer = value.customer;
  if (!customer || typeof customer !== 'object') throw new Error('Customer details are required.');
  for (const field of ['name', 'phone', 'governorate', 'area', 'address']) {
    if (typeof customer[field] !== 'string' || !customer[field].trim() || customer[field].trim().length > 500) {
      throw new Error(`Invalid customer ${field}.`);
    }
  }
  if (!Array.isArray(value.items) || value.items.length === 0 || value.items.length > 50) {
    throw new Error('Order must contain between 1 and 50 items.');
  }
  const quantities = new Map();
  for (const item of value.items) {
    if (!item || typeof item.product_id !== 'string' || item.product_id.length > 120 ||
      !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_ITEM_QUANTITY) {
      throw new Error('Invalid order item.');
    }
    quantities.set(item.product_id, (quantities.get(item.product_id) || 0) + item.quantity);
  }
  if ([...quantities.values()].some((quantity) => quantity > MAX_ITEM_QUANTITY)) {
    throw new Error('Invalid combined item quantity.');
  }
  if (value.deposit_payment_method && !PAYMENT_METHODS.has(value.deposit_payment_method)) throw new Error('Invalid deposit payment method.');
  if (value.remaining_payment_method && !REMAINING_PAYMENT_METHODS.has(value.remaining_payment_method)) throw new Error('Invalid remaining payment method.');
  return { customer, quantities };
}

export function money(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
