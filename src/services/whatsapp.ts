import { Order, SiteSettings } from '../types';
import { dataStore } from './dataStore';
import { getDeliveryFeeByGov } from '../data/egyptianGovernorates';

export const formatPaymentMethodName = (method?: string): string => {
  switch (method) {
    case 'instapay':
      return 'InstaPay';
    case 'wallet':
      return 'محفظة إلكترونية';
    case 'bank_transfer':
      return 'تحويل بنكي';
    case 'cash':
      return 'Cash';
    default:
      return method || 'غير محدد';
  }
};

const formatPrice = (val: number): string => {
  if (isNaN(val)) return '0';
  return Number.isInteger(val) ? val.toLocaleString('ar-EG') : Number(val.toFixed(2)).toLocaleString('ar-EG');
};

export const formatWhatsAppMessage = (order: Order, _settings?: SiteSettings): string => {
  // Build product items text
  const productsText = order.items
    .map((item, index) => {
      const priceStr =
        item.pricing_mode === 'on_request'
          ? 'اطلب السعر'
          : `${formatPrice(item.unit_price)} ج.م`;
      const itemTotalStr =
        item.pricing_mode === 'on_request'
          ? 'اطلب السعر'
          : `${formatPrice(item.total_price)} ج.م`;

      return `🔹 ${index + 1}. ${item.product_name}\n   - الكمية: ${item.quantity}\n   - السعر: ${priceStr}\n   - الإجمالي: ${itemTotalStr}\n   - الكود: ${item.product_sku}`;
    })
    .join('\n\n');

  const depositAmount = order.deposit_amount ?? Math.round(order.total_amount * 0.5);
  const remainingAmount = order.remaining_amount ?? (order.total_amount - depositAmount);

  const depositMethodText = formatPaymentMethodName(order.deposit_payment_method);
  const remainingMethodText = formatPaymentMethodName(order.remaining_payment_method);

  const deliveryFeeInfo = getDeliveryFeeByGov(order.customer.governorate);
  const deliveryFeeText = order.delivery_fee_text || (order.delivery_fee !== null && order.delivery_fee !== undefined ? `${order.delivery_fee} ج.م` : deliveryFeeInfo.textAr);

  const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const customerLines: string[] = [
    `الاسم: ${order.customer.name}`,
    `رقم الهاتف / WhatsApp: ${order.customer.phone}`
  ];

  if (order.customer.alternate_phone && order.customer.alternate_phone.trim()) {
    customerLines.push(`رقم هاتف آخر: ${order.customer.alternate_phone.trim()}`);
  }

  customerLines.push(`المحافظة: ${order.customer.governorate}`);
  customerLines.push(`المنطقة / المركز: ${order.customer.area || 'غير محدد'}`);
  customerLines.push(`العنوان بالتفصيل: ${order.customer.address}`);

  if (order.customer.notes && order.customer.notes.trim()) {
    customerLines.push(`ملاحظات التوصيل:\n${order.customer.notes.trim()}`);
  }

  const messageLines = [
    '🛍️ *طلب جديد - Bidaya Home*',
    '',
    '*بيانات العميل:*',
    ...customerLines,
    '',
    '*تفاصيل الطلب:*',
    `رقم الطلب: #${order.order_number}`,
    `عدد المنتجات: ${totalItemsCount}`,
    'المنتجات:',
    productsText,
    `إجمالي الطلب: ${formatPrice(order.total_amount)} ج.م`,
    '',
    '*تفاصيل الدفع:*',
    `المقدم 50%: ${formatPrice(depositAmount)} ج.م`,
    `طريقة دفع المقدم: ${depositMethodText}`,
    `المتبقي 50%: ${formatPrice(remainingAmount)} ج.م`,
    `طريقة دفع المتبقي: ${remainingMethodText}`,
    `سعر التوصيل: ${deliveryFeeText}`
  ];

  return messageLines.join('\n');
};

export const OFFICIAL_WHATSAPP_NUMBER = '201509990745';
export const OFFICIAL_SUPPORT_PHONE = '01509990745';

/**
 * Normalizes any phone input into a valid Egyptian WhatsApp format (e.g. 201509990745).
 * Automatically guards against old deprecated numbers.
 */
export const normalizeWhatsAppNumber = (phone?: string): string => {
  if (!phone) return OFFICIAL_WHATSAPP_NUMBER;

  // Clean phone number (remove +, spaces, dashes, brackets, etc.)
  let cleanPhone = phone.replace(/\D/g, '');

  // Safety filter: If the number matches or contains the old incorrect number (14878411)
  if (cleanPhone.includes('14878411') || cleanPhone.includes('1014878411')) {
    return OFFICIAL_WHATSAPP_NUMBER;
  }

  // Egyptian numbers formatting:
  // If starts with 01 (11 digits, e.g. 01509990745) -> prepend 20 without the leading 0 -> 201509990745
  if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
    cleanPhone = `20${cleanPhone.substring(1)}`;
  } else if (!cleanPhone.startsWith('20') && cleanPhone.length === 10 && cleanPhone.startsWith('1')) {
    // Missing country code (e.g. 1509990745)
    cleanPhone = `20${cleanPhone}`;
  }

  // Validate final length: Egyptian mobile with international code 20 is 12 digits (20 + 10 digits)
  if (cleanPhone.length !== 12 || !cleanPhone.startsWith('201')) {
    // If invalid or fallback needed
    return cleanPhone.length >= 10 ? cleanPhone : OFFICIAL_WHATSAPP_NUMBER;
  }

  return cleanPhone;
};

export const getWhatsAppChatUrl = (order: Order, customPhone?: string): string => {
  const settings = dataStore.getSettings();
  const rawPhone = customPhone || settings.whatsapp_number || OFFICIAL_WHATSAPP_NUMBER;
  const cleanPhone = normalizeWhatsAppNumber(rawPhone);

  const message = formatWhatsAppMessage(order, settings);
  const encodedText = encodeURIComponent(message);

  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
};

export const getDirectWhatsAppInquiryUrl = (productTitle?: string, sku?: string): string => {
  const settings = dataStore.getSettings();
  const rawPhone = settings.whatsapp_number || OFFICIAL_WHATSAPP_NUMBER;
  const cleanPhone = normalizeWhatsAppNumber(rawPhone);

  let text = 'السلام عليكم، أود الاستفسار عن منتجات بداية هوم 🌸';
  if (productTitle) {
    text = `السلام عليكم، أود الاستفسار بخصوص منتج:\n📦 *${productTitle}*\n🔢 كود: ${sku || ''}\nمن موقع بداية هوم.`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};
