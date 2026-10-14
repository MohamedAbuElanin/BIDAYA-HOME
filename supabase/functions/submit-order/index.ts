// Public checkout endpoint. It deliberately accepts IDs and quantities only for
// merchandise; all prices, delivery fees, amounts, status, and order numbers
// are derived from trusted database data below.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { money, validateCheckoutInput } from './validation.js';

const json = (body: unknown, status = 200, origin?: string) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', ...(origin ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true', Vary: 'Origin' } : {}), },
});

Deno.serve(async (request) => {
  const configuredOrigin = Deno.env.get('CHECKOUT_ALLOWED_ORIGIN');
  const requestOrigin = request.headers.get('origin') || undefined;
  const origin = configuredOrigin && requestOrigin === configuredOrigin ? configuredOrigin : undefined;
  if (requestOrigin && !origin) return json({ error: 'Origin is not allowed.' }, 403);
  if (request.method === 'OPTIONS') return new Response(null, { headers: { ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}), 'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type, x-idempotency-key', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, origin);

  try {
    const idempotencyKey = request.headers.get('x-idempotency-key') || '';
    const payload = await request.json();
    const { customer, quantities } = validateCheckoutInput(payload, idempotencyKey);
    const url = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceRoleKey) return json({ error: 'Checkout service is not configured.' }, 503, origin);
    const db = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: existing, error: existingError } = await db.from('orders').select('*').eq('idempotency_key', idempotencyKey).maybeSingle();
    if (existingError) throw existingError;
    if (existing) return json({ order: existing, replayed: true }, 200, origin);

    const productIds = [...quantities.keys()];
    const { data: products, error: productError } = await db.from('products')
      .select('id,name_ar,name_en,sku,price,pricing_mode,images,primary_image_index,is_available,is_archived,stock_status')
      .in('id', productIds);
    if (productError) throw productError;
    if (!products || products.length !== productIds.length) return json({ error: 'One or more products no longer exist.' }, 409, origin);

    const byId = new Map(products.map((product) => [product.id, product]));
    const items = productIds.map((productId) => {
      const product = byId.get(productId);
      const quantity = quantities.get(productId)!;
      if (!product || product.is_archived || !product.is_available || product.stock_status === 'out_of_stock' || product.pricing_mode === 'on_request') {
        throw new Error('One or more products are unavailable.');
      }
      const unitPrice = money(product.price);
      return { product_id: product.id, product_name: product.name_ar, product_sku: product.sku, product_image: product.images?.[product.primary_image_index] || product.images?.[0] || '', unit_price: unitPrice, pricing_mode: product.pricing_mode, quantity, total_price: money(unitPrice * quantity) };
    });

    const { data: setting, error: settingError } = await db.from('site_settings').select('enable_ordering').limit(1).maybeSingle();
    if (settingError) throw settingError;
    if (!setting?.enable_ordering) return json({ error: 'Ordering is currently unavailable.' }, 503, origin);
    const { data: zone, error: zoneError } = await db.from('delivery_zones').select('delivery_fee,text_ar,is_active').eq('governorate', customer.governorate.trim()).maybeSingle();
    if (zoneError) throw zoneError;
    if (!zone?.is_active) return json({ error: 'Delivery is unavailable for the selected governorate.' }, 422, origin);
    const { data: area, error: areaError } = await db.from('delivery_zone_areas').select('area_ar').eq('governorate', customer.governorate.trim()).eq('area_ar', customer.area.trim()).maybeSingle();
    if (areaError) throw areaError;
    if (!area) return json({ error: 'The selected area is unavailable for the selected governorate.' }, 422, origin);

    const totalAmount = money(items.reduce((sum, item) => sum + item.total_price, 0));
    const depositAmount = money(totalAmount * 0.5);
    const remainingAmount = money(totalAmount - depositAmount);
    const { data: orderNumber, error: numberError } = await db.rpc('next_order_number');
    if (numberError) throw numberError;
    const order = {
      order_number: orderNumber, idempotency_key: idempotencyKey, customer_info: { ...customer, name: customer.name.trim(), phone: customer.phone.trim() }, items,
      total_amount: totalAmount, deposit_percentage: 50, deposit_amount: depositAmount, deposit_payment_method: payload.deposit_payment_method || null,
      remaining_percentage: 50, remaining_amount: remainingAmount, remaining_payment_method: payload.remaining_payment_method || null,
      // A null source fee remains null and is accompanied by the explicit
      // source label; it is never coerced to zero or included in merchandise total.
      delivery_fee: zone.delivery_fee === null ? null : money(zone.delivery_fee), delivery_fee_text: zone.text_ar, status: 'new', whatsapp_sent: false,
      visitor_id: typeof payload.visitor_id === 'string' ? payload.visitor_id.slice(0, 200) : null,
      device_type: ['mobile', 'tablet', 'desktop'].includes(payload.device_type) ? payload.device_type : null,
      traffic_source: ['facebook', 'instagram', 'google', 'direct', 'other'].includes(payload.traffic_source) ? payload.traffic_source : null,
      status_history: [{ status: 'new', timestamp: new Date().toISOString(), note: 'Order persisted by checkout service.' }],
    };
    const { data: inserted, error: insertError } = await db.from('orders').insert(order).select('*').single();
    if (insertError?.code === '23505') {
      const { data: replayed, error: replayError } = await db.from('orders').select('*').eq('idempotency_key', idempotencyKey).single();
      if (!replayError && replayed) return json({ order: replayed, replayed: true }, 200, origin);
    }
    if (insertError) throw insertError;
    return json({ order: inserted, replayed: false }, 201, origin);
  } catch (error) {
    // Do not log payloads: they contain customer PII. Error messages are kept generic.
    console.error('checkout request rejected', error instanceof Error ? error.message : 'unknown error');
    return json({ error: error instanceof Error && error.message.startsWith('Invalid') ? error.message : 'Unable to create order. Please retry.' }, 400, origin);
  }
});
