import type { CartItem, CustomerInfo, DepositPaymentMethod, Order, RemainingPaymentMethod } from '../types';
import { getSupabaseClient } from '../lib/supabase';

type CheckoutResponse = { order: Omit<Order, 'customer'> & { customer_info: CustomerInfo }; replayed: boolean };

const getFunctionErrorMessage = async (error: { message: string; context?: unknown }): Promise<string> => {
  if (error.context instanceof Response) {
    const response = error.context;
    const body = await response.clone().json().catch(() => null);
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      return `${body.error} (HTTP ${response.status})`;
    }
    if (response.status === 404) return 'Checkout function is not deployed (HTTP 404).';
    if (response.status === 403) return 'Checkout origin is not allowed (HTTP 403).';
    return `Checkout request failed (HTTP ${response.status}).`;
  }
  return error.message;
};

const toOrder = (row: CheckoutResponse['order']): Order => ({
  ...row,
  customer: row.customer_info,
});

export async function submitCheckout(input: {
  customer: CustomerInfo;
  items: CartItem[];
  depositPaymentMethod: DepositPaymentMethod;
  remainingPaymentMethod: RemainingPaymentMethod;
  visitorId?: string;
  deviceType?: string;
  trafficSource?: string;
  idempotencyKey?: string;
}): Promise<{ order: Order; replayed: boolean }> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Secure checkout is not configured. Please contact the store.');
  const idempotencyKey = input.idempotencyKey || crypto.randomUUID();
  const { data, error } = await client.functions.invoke<CheckoutResponse>('submit-order', {
    headers: { 'x-idempotency-key': idempotencyKey },
    body: {
      customer: input.customer,
      // Prices, discounts, totals, and delivery fees are intentionally absent.
      items: input.items.map(({ product, quantity }) => ({ product_id: product.id, quantity })),
      deposit_payment_method: input.depositPaymentMethod,
      remaining_payment_method: input.remainingPaymentMethod,
      visitor_id: input.visitorId,
      device_type: input.deviceType,
      traffic_source: input.trafficSource,
    },
  });
  if (error) throw new Error(await getFunctionErrorMessage(error));
  if (!data?.order) throw new Error('Checkout could not be completed. Please retry.');
  return { order: toOrder(data.order), replayed: data.replayed };
}
