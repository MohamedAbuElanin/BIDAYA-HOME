import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MessageCircle,
  CheckCircle,
  Truck,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Banknote,
  Wallet,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { EGYPTIAN_GOVERNORATES, getDeliveryFeeByGov } from '../../data/egyptianGovernorates';
import { submitCheckout } from '../../services/checkout';
import { getWhatsAppChatUrl, getWhatsAppCheckoutDraftUrl, formatWhatsAppMessage, formatPaymentMethodName } from '../../services/whatsapp';
import { analytics } from '../../services/analytics';
import { Order, CustomerInfo, DepositPaymentMethod, RemainingPaymentMethod } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { captureAppException } from '../../lib/posthog';

export const CheckoutModal: React.FC = () => {
  const { lang, t, tx } = useLanguage();
  const { items, totalAmount, isCheckoutOpen, closeCheckout, clearCart } = useCart();
  
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    phone: '',
    alternate_phone: '',
    governorate: '',
    area: '',
    address: '',
    notes: ''
  });

  const [depositMethod, setDepositMethod] = useState<DepositPaymentMethod | ''>('');
  const [remainingMethod, setRemainingMethod] = useState<RemainingPaymentMethod | ''>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  // Retained across retries after a lost response; cleared only after a
  // confirmed persisted order so a click/retry cannot create a second order.
  const idempotencyKeyRef = useRef<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionDiagnostic, setSubmissionDiagnostic] = useState<string | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  // Selected governorate data & Delivery fee
  const currentGov = EGYPTIAN_GOVERNORATES.find(g => g.name_ar === formData.governorate);
  const deliveryFeeInfo = getDeliveryFeeByGov(formData.governorate);
  const deliveryFeeDisplay = lang === 'ar' ? deliveryFeeInfo.textAr : deliveryFeeInfo.textEn;

  // Dynamic 50% / 50% payment calculation
  const depositAmount = Math.round(totalAmount * 0.5);
  const remainingAmount = totalAmount - depositAmount;

  const depositOptions: { value: DepositPaymentMethod; label: string; icon: React.ReactNode }[] = [
    { value: 'instapay', label: tx(t.checkout.methodInstapay), icon: <CreditCard size={16} /> },
    { value: 'wallet', label: tx(t.checkout.methodWallet), icon: <Wallet size={16} /> },
    { value: 'bank_transfer', label: tx(t.checkout.methodBankTransfer), icon: <Building2 size={16} /> }
  ];

  const remainingOptions: { value: RemainingPaymentMethod; label: string; icon: React.ReactNode }[] = [
    { value: 'cash', label: tx(t.checkout.methodCash), icon: <Banknote size={16} /> },
    { value: 'instapay', label: tx(t.checkout.methodInstapay), icon: <CreditCard size={16} /> },
    { value: 'wallet', label: tx(t.checkout.methodWallet), icon: <Wallet size={16} /> },
    { value: 'bank_transfer', label: tx(t.checkout.methodBankTransfer), icon: <Building2 size={16} /> }
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Name
    if (!formData.name.trim()) {
      newErrors.name = tx(t.checkout.missingName);
    }

    // 2. Main Phone
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = tx(t.checkout.missingPhone);
    } else if (!cleanPhone.startsWith('01') || cleanPhone.length !== 11) {
      newErrors.phone = tx(t.checkout.invalidPhone);
    }

    // 3. Alternate Phone (Optional)
    if (formData.alternate_phone && formData.alternate_phone.trim()) {
      const cleanAlt = formData.alternate_phone.replace(/\D/g, '');
      if (!cleanAlt.startsWith('01') || cleanAlt.length !== 11) {
        newErrors.alternate_phone = tx(t.checkout.invalidAlternatePhone);
      }
    }

    // 4. Governorate
    if (!formData.governorate) {
      newErrors.governorate = tx(t.checkout.missingGovernorate);
    }

    // 5. Area / Center
    if (!formData.area) {
      newErrors.area = tx(t.checkout.missingArea);
    }

    // 6. Address
    if (!formData.address.trim()) {
      newErrors.address = tx(t.checkout.missingAddress);
    }

    // 7. Payment methods (both required)
    if (!depositMethod) {
      newErrors.depositMethod = tx(t.checkout.missingDepositMethod);
    }
    if (!remainingMethod) {
      newErrors.remainingMethod = tx(t.checkout.missingRemainingMethod);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;

    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionDiagnostic(null);
    let whatsappWindow: Window | null = null;

    // Stage 1: Record submit intent before any persistence.
    // This fires even if createOrder() later throws.
    analytics.track('ORDER_SUBMIT_ATTEMPT', {
      items_count: items.length,
      total_estimate: totalAmount,
    });

    try {
      // Open during the user's click gesture so browsers do not block the
      // WhatsApp tab while the server-side order request is in flight.
      whatsappWindow = window.open('about:blank', '_blank');
      if (whatsappWindow) whatsappWindow.opener = null;

      // The Edge Function is the authority for prices, delivery, balances,
      // persistence and idempotency. WhatsApp is not opened before it returns.
      const { order } = await submitCheckout({
        customer: {
          ...formData,
          alternate_phone: formData.alternate_phone?.trim() || undefined,
          notes: formData.notes?.trim() || undefined
        },
        items,
        depositPaymentMethod: depositMethod as DepositPaymentMethod,
        remainingPaymentMethod: remainingMethod as RemainingPaymentMethod,
        visitorId: analytics.getVisitorId(),
        deviceType: analytics.getDeviceType(),
        trafficSource: analytics.getTrafficSource(),
        idempotencyKey: idempotencyKeyRef.current || (idempotencyKeyRef.current = crypto.randomUUID())
      });

      // Stage 2: ORDER_CREATED — the Edge Function returned the persisted order.
      analytics.setLocation(formData.governorate);
      analytics.track('ORDER_CREATED', {
        order_id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        governorate: formData.governorate,
        items_count: items.length,
        delivery_fee: deliveryFeeInfo.fee,
        deposit_amount: depositAmount,
        remaining_amount: remainingAmount
      });

      setCreatedOrder(order);
      idempotencyKeyRef.current = null;
      clearCart();

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      // Stage 3: Attempt to open WhatsApp.
      //          A pre-opened tab can still be closed by the user or the browser.
      //          We record the attempt via WHATSAPP_CLICK; actual delivery confirmation
      //          must be verified manually or via WhatsApp Business API.
      const whatsappUrl = getWhatsAppChatUrl(order);
      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.location.href = whatsappUrl;
      }

      // Stage 3 event — window_opened reflects whether the browser allowed the popup,
      // NOT whether the user sent a WhatsApp message. Message delivery cannot be confirmed
      // from the browser.
      analytics.track('WHATSAPP_CLICK', {
        source: 'checkout_submission',
        order_number: order.order_number,
        window_opened: whatsappWindow !== null && !whatsappWindow.closed,
      });
    } catch (err) {
      console.error('Order submission failed:', err);
      const diagnostic = err instanceof Error ? err.message : String(err);
      setSubmissionDiagnostic(diagnostic);
      const draftUrl = getWhatsAppCheckoutDraftUrl(
        formData,
        items,
        depositMethod as DepositPaymentMethod,
        remainingMethod as RemainingPaymentMethod,
      );
      if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
      setSubmissionError(tx(t.checkout.submitFailed));
      captureAppException(err, {
        stage: 'checkout_submission',
        items_count: items.length,
        total_estimate: totalAmount,
        deposit_method: depositMethod,
        remaining_method: remainingMethod,
        governorate: formData.governorate,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyMessage = () => {
    if (!createdOrder) return;
    const msg = formatWhatsAppMessage(createdOrder);
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={closeCheckout}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Truck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {createdOrder ? tx(t.checkout.successTitle) : tx(t.checkout.formTitle)}
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                {createdOrder ? `${tx(t.checkout.orderNumber)}: ${createdOrder.order_number}` : tx(t.checkout.cashInspection)}
              </span>
            </div>
          </div>

          <button
            onClick={closeCheckout}
            className="btn btn-ghost"
            style={{ padding: '8px', borderRadius: '50%' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {createdOrder ? (
            /* SUCCESS CELEBRATION VIEW */
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 0 0 8px #D1FAE5'
                }}
              >
                <CheckCircle size={40} />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                {tx(t.checkout.thankYou)}
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '480px', lineHeight: '1.6' }}>
                {tx(t.checkout.orderSent)} <strong style={{ color: 'var(--primary-800)' }}>#{createdOrder.order_number}</strong>. {tx(t.checkout.whatsappOpened)}
              </p>

              {/* Order & Payment Summary Box */}
              <div
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  border: '1px solid var(--border-default)',
                  marginBottom: '20px',
                  textAlign: lang === 'ar' ? 'right' : 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{tx(t.checkout.customer)}</span>
                  <span style={{ fontWeight: 700 }}>{createdOrder.customer.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{tx(t.checkout.phone)}:</span>
                  <span style={{ fontWeight: 700 }} dir="ltr">{createdOrder.customer.phone}</span>
                </div>
                {createdOrder.customer.alternate_phone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{tx(t.checkout.alternatePhone)}:</span>
                    <span style={{ fontWeight: 700 }} dir="ltr">{createdOrder.customer.alternate_phone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{tx(t.checkout.deliveryAddress)}</span>
                  <span style={{ fontWeight: 600 }}>{createdOrder.customer.governorate} — {createdOrder.customer.area} — {createdOrder.customer.address}</span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-default)', margin: '12px 0 8px 0' }} />

                {/* Payment Breakdown in Success View */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>مقدم لتأكيد الطلب (50%):</span>
                  <span style={{ fontWeight: 700, color: '#B45309' }}>
                    {(createdOrder.deposit_amount ?? Math.round(createdOrder.total_amount * 0.5)).toLocaleString('ar-EG')} {tx(t.general.currency)}
                    {createdOrder.deposit_payment_method && ` (${formatPaymentMethodName(createdOrder.deposit_payment_method)})`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>المبلغ المتبقي عند الاستلام (50%):</span>
                  <span style={{ fontWeight: 700, color: '#047857' }}>
                    {(createdOrder.remaining_amount ?? (createdOrder.total_amount - (createdOrder.deposit_amount ?? Math.round(createdOrder.total_amount * 0.5)))).toLocaleString('ar-EG')} {tx(t.general.currency)}
                    {createdOrder.remaining_payment_method && ` (${formatPaymentMethodName(createdOrder.remaining_payment_method)})`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{tx(t.checkout.deliveryFee)}</span>
                  <span style={{ fontWeight: 700, color: '#0369A1' }}>
                    {createdOrder.delivery_fee_text || (createdOrder.delivery_fee !== null && createdOrder.delivery_fee !== undefined ? `${createdOrder.delivery_fee} ${tx(t.general.currency)}` : tx(t.checkout.deliveryFeeToBeDetermined))}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-default)', fontSize: '1.05rem' }}>
                  <span style={{ fontWeight: 800 }}>{tx(t.checkout.orderTotal)}</span>
                  <span style={{ fontWeight: 900, color: 'var(--primary-800)' }}>
                    {createdOrder.total_amount.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')} {tx(t.general.currency)}
                  </span>
                </div>
              </div>

              {/* Inspection Notice */}
              <div
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#F0FDF4',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #BBF7D0',
                  marginBottom: '20px',
                  fontSize: '0.82rem',
                  color: '#166534',
                  textAlign: 'right',
                  lineHeight: '1.6'
                }}
              >
                {tx(t.checkout.cashInspection)}
              </div>

              {/* Re-open WhatsApp & Copy Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <a
                  href={getWhatsAppChatUrl(createdOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-lg"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  <MessageCircle size={22} />
                  <span>{tx(t.checkout.reopenWhatsapp)}</span>
                  <ExternalLink size={18} />
                </a>

                <button
                  onClick={handleCopyMessage}
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                >
                  {copied ? <Check size={18} color="#16A34A" /> : <Copy size={18} />}
                  <span>{copied ? tx(t.checkout.copiedMessage) : tx(t.checkout.copyOrder)}</span>
                </button>

                <button
                  onClick={closeCheckout}
                  className="btn btn-ghost"
                  style={{ marginTop: '8px' }}
                >
                  {tx(t.checkout.continueShopping)}
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <form onSubmit={handleSubmitOrder}>
              {/* Order Items Micro Preview */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid var(--border-default)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={18} color="var(--primary-700)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {tx(t.checkout.itemsCount)} {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-800)', fontFamily: 'Cairo, sans-serif' }}>
                    {totalAmount.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary-700)', fontWeight: 700 }}>{tx(t.general.currency)}</span>
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Name */}
                <div>
                  <label htmlFor="name" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                    {tx(t.checkout.name)} <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input id="name" name="name"
                    type="text"
                    placeholder={tx(t.checkout.nameExample)}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${errors.name ? '#DC2626' : 'var(--border-default)'}`,
                      fontSize: '0.92rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                  {errors.name && <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                </div>

                {/* 2. Primary Phone */}
                <div>
                  <label htmlFor="phone" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                    {tx(t.checkout.phoneOrder)} <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder={tx(t.checkout.phoneExample)}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    dir="ltr"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${errors.phone ? '#DC2626' : 'var(--border-default)'}`,
                      fontSize: '0.95rem',
                      outline: 'none',
                      textAlign: lang === 'ar' ? 'right' : 'left',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                  {errors.phone && <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
                </div>

                {/* 3. Alternate Phone (Optional) */}
                <div>
                  <label htmlFor="alternate_phone" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                    {tx(t.checkout.alternatePhone)} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>({lang === 'ar' ? 'اختياري' : 'optional'})</span>
                  </label>
                  <input id="alternate_phone" name="alternate_phone"
                    type="tel"
                    placeholder={tx(t.checkout.alternatePhonePlaceholder)}
                    value={formData.alternate_phone || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, alternate_phone: e.target.value });
                      if (errors.alternate_phone) setErrors(prev => ({ ...prev, alternate_phone: '' }));
                    }}
                    dir="ltr"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${errors.alternate_phone ? '#DC2626' : 'var(--border-default)'}`,
                      fontSize: '0.95rem',
                      outline: 'none',
                      textAlign: lang === 'ar' ? 'right' : 'left',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                  {errors.alternate_phone && (
                    <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                      {errors.alternate_phone}
                    </span>
                  )}
                </div>

                {/* 4. Governorate & Area Dependent Select Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* Governorate */}
                  <div>
                    <label htmlFor="governorate" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                      {tx(t.checkout.governorate)} <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select
                      id="governorate"
                      name="governorate"
                      value={formData.governorate}
                      onChange={(e) => {
                        const newGov = e.target.value;
                        setFormData(prev => ({ ...prev, governorate: newGov, area: '' }));
                        if (errors.governorate) setErrors(prev => ({ ...prev, governorate: '' }));
                        if (errors.area) setErrors(prev => ({ ...prev, area: '' }));
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${errors.governorate ? '#DC2626' : 'var(--border-default)'}`,
                        fontSize: '0.9rem',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">{tx(t.checkout.selectGov)}</option>
                      {EGYPTIAN_GOVERNORATES.map((gov) => (
                        <option key={gov.id} value={gov.name_ar}>
                          {lang === 'en' ? gov.name_en : gov.name_ar}
                        </option>
                      ))}
                    </select>
                    {formData.governorate && (
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '0.78rem',
                          color: '#0369A1',
                          backgroundColor: '#F0F9FF',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: '1px solid #BAE6FD'
                        }}
                      >
                        <Truck size={14} />
                        <span>
                          {tx(t.checkout.deliveryFee)} <strong>{deliveryFeeDisplay}</strong>
                        </span>
                      </div>
                    )}
                    {errors.governorate && <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.governorate}</span>}
                  </div>

                  {/* Area / Center (Dependent Select) */}
                  <div>
                    <label htmlFor="area" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                      {tx(t.checkout.area)} <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select
                      id="area"
                      name="area"
                      disabled={!formData.governorate}
                      value={formData.area}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, area: e.target.value }));
                        if (errors.area) setErrors(prev => ({ ...prev, area: '' }));
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${errors.area ? '#DC2626' : 'var(--border-default)'}`,
                        fontSize: '0.9rem',
                        outline: 'none',
                        backgroundColor: !formData.governorate ? '#F1F5F9' : '#FFFFFF',
                        color: !formData.governorate ? '#94A3B8' : 'var(--text-main)',
                        cursor: !formData.governorate ? 'not-allowed' : 'pointer',
                        opacity: !formData.governorate ? 0.75 : 1
                      }}
                    >
                      {!formData.governorate ? (
                        <option value="">{tx(t.checkout.selectGovFirst)}</option>
                      ) : (
                        <>
                          <option value="">{tx(t.checkout.selectArea)}</option>
                          {currentGov?.cities.map((city, idx) => (
                            <option key={idx} value={city}>
                              {city}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    {errors.area && <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.area}</span>}
                  </div>
                </div>

                {/* 5. Detailed Address */}
                <div>
                  <label htmlFor="address" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                    {tx(t.checkout.address)} <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <textarea id="address" name="address"
                    rows={2}
                    placeholder={tx(t.checkout.addressExample)}
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${errors.address ? '#DC2626' : 'var(--border-default)'}`,
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'none',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                  {errors.address && <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.address}</span>}
                </div>

                {/* 6. Notes */}
                <div>
                  <label htmlFor="notes" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    {tx(t.checkout.optionalDeliveryNotes)}
                  </label>
                  <input id="notes" name="notes"
                    type="text"
                    placeholder={tx(t.checkout.notesExample)}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

                {/* ── 7. PAYMENT SECTION (50% / 50%) ── */}
                <div
                  style={{
                    marginTop: '8px',
                    padding: '16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                      {tx(t.checkout.paymentSectionTitle)}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                      {tx(t.checkout.paymentSectionNotice)}
                    </p>
                  </div>

                  {/* Part A: 50% Deposit */}
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#B45309' }}>
                        1. {tx(t.checkout.depositTitle)} <span style={{ color: '#DC2626' }}>*</span>
                      </span>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#B45309' }}>
                        {tx(t.checkout.depositRequiredAmount)} {depositAmount.toLocaleString('ar-EG')} {tx(t.general.currency)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {depositOptions.map((opt) => {
                        const isSelected = depositMethod === opt.value;
                        return (
                          <label
                            key={opt.value}
                            onClick={() => {
                              setDepositMethod(opt.value);
                              if (errors.depositMethod) setErrors(prev => ({ ...prev, depositMethod: '' }));
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-md)',
                              border: `1.5px solid ${isSelected ? 'var(--primary-700)' : 'var(--border-default)'}`,
                              backgroundColor: isSelected ? 'var(--primary-50)' : '#FFFFFF',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="radio"
                              name="deposit_method"
                              checked={isSelected}
                              onChange={() => {
                                setDepositMethod(opt.value);
                                if (errors.depositMethod) setErrors(prev => ({ ...prev, depositMethod: '' }));
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            <div style={{ color: isSelected ? 'var(--primary-800)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                              {opt.icon}
                            </div>
                            <span style={{ fontSize: '0.86rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--primary-900)' : 'var(--text-main)' }}>
                              {opt.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.depositMethod && (
                      <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                        {errors.depositMethod}
                      </span>
                    )}
                  </div>

                  {/* Part B: 50% Remaining */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#047857' }}>
                        2. {tx(t.checkout.remainingTitle)} <span style={{ color: '#DC2626' }}>*</span>
                      </span>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#047857' }}>
                        {tx(t.checkout.remainingRequiredAmount)} {remainingAmount.toLocaleString('ar-EG')} {tx(t.general.currency)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {remainingOptions.map((opt) => {
                        const isSelected = remainingMethod === opt.value;
                        return (
                          <label
                            key={opt.value}
                            onClick={() => {
                              setRemainingMethod(opt.value);
                              if (errors.remainingMethod) setErrors(prev => ({ ...prev, remainingMethod: '' }));
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-md)',
                              border: `1.5px solid ${isSelected ? 'var(--primary-700)' : 'var(--border-default)'}`,
                              backgroundColor: isSelected ? 'var(--primary-50)' : '#FFFFFF',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="radio"
                              name="remaining_method"
                              checked={isSelected}
                              onChange={() => {
                                setRemainingMethod(opt.value);
                                if (errors.remainingMethod) setErrors(prev => ({ ...prev, remainingMethod: '' }));
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            <div style={{ color: isSelected ? 'var(--primary-800)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                              {opt.icon}
                            </div>
                            <span style={{ fontSize: '0.86rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--primary-900)' : 'var(--text-main)' }}>
                              {opt.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.remainingMethod && (
                      <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                        {errors.remainingMethod}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── PAYMENT & ORDER SUMMARY BOX ── */}
                <div
                  style={{
                    backgroundColor: '#F1F5F9',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {tx(t.checkout.paymentSummaryTitle)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{tx(t.checkout.orderTotal)}</span>
                    <strong>{totalAmount.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')} {tx(t.general.currency)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{tx(t.checkout.depositTitle)}:</span>
                    <span style={{ fontWeight: 700, color: '#B45309' }}>
                      {depositAmount.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')} {tx(t.general.currency)}
                      {depositMethod ? ` (${depositOptions.find(o => o.value === depositMethod)?.label})` : ` — ${lang === 'ar' ? 'لم يُحدد' : 'Not specified'}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{tx(t.checkout.remainingTitle)}:</span>
                    <span style={{ fontWeight: 700, color: '#047857' }}>
                      {remainingAmount.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')} {tx(t.general.currency)}
                      {remainingMethod ? ` (${remainingOptions.find(o => o.value === remainingMethod)?.label})` : ` — ${lang === 'ar' ? 'لم يُحدد' : 'Not specified'}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{tx(t.checkout.deliveryFee)}</span>
                    <span style={{ fontWeight: 700, color: '#0369A1' }}>
                      {formData.governorate ? deliveryFeeDisplay : tx(t.checkout.deliveryFeeToBeDetermined)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantees Box with New Inspection Text */}
              <div
                style={{
                  marginTop: '18px',
                  padding: '12px 14px',
                  backgroundColor: '#F0FDF4',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #BBF7D0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '0.82rem',
                  color: '#166534',
                  lineHeight: '1.5'
                }}
              >
                <ShieldCheck size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>{tx(t.checkout.inspectTitle)}</strong> {tx(t.checkout.inspectDesc)}
                </span>
              </div>

              {/* Submit CTA */}
              <div style={{ marginTop: '22px' }}>
                {submissionError && (
                  <div role="alert" style={{ color: '#B91C1C', marginBottom: '12px', fontSize: '0.9rem' }}>
                    <p style={{ margin: '0 0 6px' }}>{submissionError}</p>
                    {submissionDiagnostic && (
                      <p dir="ltr" style={{ margin: '0 0 10px', fontSize: '0.78rem', overflowWrap: 'anywhere' }}>
                        {submissionDiagnostic}
                      </p>
                    )}
                    <a
                      href={getWhatsAppCheckoutDraftUrl(formData, items, depositMethod as DepositPaymentMethod, remainingMethod as RemainingPaymentMethod)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                      style={{ width: '100%', textDecoration: 'none' }}
                    >
                      <MessageCircle size={18} />
                      <span>{tx(t.checkout.sendDraftWhatsapp)}</span>
                    </a>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-whatsapp btn-lg"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: '1.05rem' }}
                >
                  <MessageCircle size={22} />
                  <span>{isSubmitting ? tx(t.checkout.submitting) : tx(t.checkout.submitOrder)}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
