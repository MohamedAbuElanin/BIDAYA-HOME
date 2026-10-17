import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  MessageCircle,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  X,
  ExternalLink,
  Phone,
  MapPin,
  Calendar,
  Send
} from 'lucide-react';
import { Order, OrderStatus, AdminUser } from '../../types';
import { dataStore } from '../../services/dataStore';
import { getWhatsAppChatUrl, formatPaymentMethodName } from '../../services/whatsapp';
import { getDeliveryFeeByGov } from '../../data/egyptianGovernorates';

interface OrderManagementProps {
  currentUser: AdminUser;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ currentUser }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [databaseLoadError, setDatabaseLoadError] = useState('');
  
  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('new');
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdateError, setStatusUpdateError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const unsubscribe = dataStore.subscribe(refresh);
    dataStore.refreshOrdersFromDatabase().then(() => {
      setDatabaseLoadError('');
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'تعذر تحميل الطلبات من قاعدة البيانات.';
      console.error('Failed to load orders from the database:', error);
      setDatabaseLoadError(message);
      refresh();
    });
    return unsubscribe;
  }, []);

  const refresh = () => {
    setOrders(dataStore.getOrders());
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdatingStatus(true);
    setStatusUpdateError('');
    try {
      const updated = await dataStore.updateOrderStatus(
        selectedOrder.id,
        newStatus,
        statusNote,
        currentUser
      );
      setSelectedOrder(updated);
      setStatusNote('');
    } catch (error) {
      setStatusUpdateError(error instanceof Error ? error.message : 'تعذر تحديث حالة الطلب.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDirectCustomerWhatsApp = (order: Order) => {
    let cleanPhone = order.customer.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      cleanPhone = `20${cleanPhone.substring(1)}`;
    }
    const text = `مرحباً ${order.customer.name}، نتواصل معك من فريق مبيعات بداية هوم بخصوص طلبك رقم #${order.order_number} 🌸`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.order_number.toLowerCase().includes(q);
      const matchName = order.customer.name.toLowerCase().includes(q);
      const matchPhone = order.customer.phone.includes(q);
      const matchGov = order.customer.governorate.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchPhone && !matchGov) return false;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, { label: string; bg: string; color: string; icon: any }> = {
      new: { label: 'جديد', bg: '#EFF6FF', color: '#1D4ED8', icon: AlertCircle },
      contacted: { label: 'تم التواصل', bg: '#F5F3FF', color: '#6D28D9', icon: MessageCircle },
      confirmed: { label: 'مؤكد', bg: '#F0F9FF', color: '#0369A1', icon: CheckCircle },
      preparing: { label: 'جاري التجهيز', bg: '#FFFBEB', color: '#B45309', icon: Clock },
      shipped: { label: 'تم الشحن', bg: '#EEF2FF', color: '#4338CA', icon: Truck },
      delivered: { label: 'تم التسليم', bg: '#ECFDF5', color: '#047857', icon: CheckCircle },
      cancelled: { label: 'ملغي', bg: '#FEF2F2', color: '#B91C1C', icon: XCircle }
    };
    const s = map[status] || map.new;
    const Icon = s.icon;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          fontWeight: 700,
          backgroundColor: s.bg,
          color: s.color
        }}
      >
        <Icon size={13} />
        <span>{s.label}</span>
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {databaseLoadError && (
        <div role="alert" style={{ padding: '12px 16px', borderRadius: '8px', color: '#991B1B', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
          {databaseLoadError}
        </div>
      )}
      {/* Top Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: 'var(--radius-md)',
              padding: '6px 12px',
              minWidth: '260px'
            }}
          >
            <Search size={16} color="#94A3B8" style={{ marginLeft: '8px' }} />
            <input
              type="text"
              placeholder="بحث برقم الطلب، اسم العميل، أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.88rem', width: '100%' }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          >
            <option value="all">كافة الحالات ({orders.length})</option>
            <option value="new">طلبات جديدة</option>
            <option value="contacted">تم التواصل</option>
            <option value="confirmed">مؤكدة</option>
            <option value="preparing">جاري التجهيز</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">تم التسليم</option>
            <option value="cancelled">ملغية</option>
          </select>
        </div>

        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#64748B' }}>
          إجمالي النتائج: {filteredOrders.length} طلب
        </div>
      </div>

      {/* Orders Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-xs)',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '12px 16px' }}>رقم الطلب</th>
                <th style={{ padding: '12px 16px' }}>بيانات العميل</th>
                <th style={{ padding: '12px 16px' }}>المحافظة والمنطقة</th>
                <th style={{ padding: '12px 16px' }}>المنتجات المطلوبة</th>
                <th style={{ padding: '12px 16px' }}>الإجمالي</th>
                <th style={{ padding: '12px 16px' }}>حالة الطلب</th>
                <th style={{ padding: '12px 16px' }}>تاريخ الإنشاء</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    لا توجد طلبات مطابقة للبحث أو الحالة المختارة.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--primary-800)', fontFamily: 'monospace' }}>
                      {order.order_number}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#1E293B' }}>{order.customer.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }} dir="ltr">{order.customer.phone}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      <div>{order.customer.governorate}</div>
                      {order.customer.area && <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{order.customer.area}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>
                        {order.items.reduce((s, i) => s + i.quantity, 0)} قطعة
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {order.items.map((i) => i.product_name).join(', ')}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 900, color: '#1E293B' }}>
                      {order.total_amount.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {getStatusBadge(order.status)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#94A3B8' }}>
                      {new Date(order.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                        >
                          <Eye size={14} />
                          <span>تفاصيل</span>
                        </button>

                        <button
                          onClick={() => handleDirectCustomerWhatsApp(order)}
                          className="btn btn-whatsapp btn-sm"
                          style={{ padding: '6px 8px' }}
                          title="تواصل مباشر عبر واتساب"
                        >
                          <MessageCircle size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal Drawer */}
      {selectedOrder && (
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
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '760px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
                    تفاصيل الطلب: #{selectedOrder.order_number}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                  تم الإنشاء في: {new Date(selectedOrder.created_at).toLocaleString('ar-EG')}
                </div>
              </div>

              <button onClick={() => setSelectedOrder(null)} className="btn btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Customer Info Box */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B' }}>
                  بيانات العميل والتوصيل
                </h4>
                <button
                  onClick={() => handleDirectCustomerWhatsApp(selectedOrder)}
                  className="btn btn-whatsapp btn-sm"
                >
                  <MessageCircle size={15} />
                  <span>محادثة العميل على واتساب</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>الاسم:</span>
                  <strong>{selectedOrder.customer.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>الهاتف الأساسي:</span>
                  <strong dir="ltr">{selectedOrder.customer.phone}</strong>
                </div>
                {selectedOrder.customer.alternate_phone && (
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>هاتف آخر:</span>
                    <strong dir="ltr">{selectedOrder.customer.alternate_phone}</strong>
                  </div>
                )}
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>المحافظة والمنطقة:</span>
                  <strong>{selectedOrder.customer.governorate} — {selectedOrder.customer.area || 'غير محدد'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>العنوان بالتفصيل:</span>
                  <span>{selectedOrder.customer.address}</span>
                </div>
              </div>

              {selectedOrder.customer.notes && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748B' }}>ملاحظات العميل: </span>
                  <span style={{ color: '#B45309' }}>{selectedOrder.customer.notes}</span>
                </div>
              )}
            </div>

            {/* Payment Preference Details */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginBottom: '10px' }}>
                بيانات الدفع (نظام 50% / 50%)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>مقدم تأكيد الطلب (50%):</span>
                  <strong style={{ color: '#B45309' }}>
                    {(selectedOrder.deposit_amount ?? Math.round(selectedOrder.total_amount * 0.5)).toLocaleString('ar-EG')} ج.م
                    {selectedOrder.deposit_payment_method && ` (${formatPaymentMethodName(selectedOrder.deposit_payment_method)})`}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>المتبقي عند الاستلام (50%):</span>
                  <strong style={{ color: '#047857' }}>
                    {(selectedOrder.remaining_amount ?? (selectedOrder.total_amount - (selectedOrder.deposit_amount ?? Math.round(selectedOrder.total_amount * 0.5)))).toLocaleString('ar-EG')} ج.م
                    {selectedOrder.remaining_payment_method && ` (${formatPaymentMethodName(selectedOrder.remaining_payment_method)})`}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>سعر التوصيل:</span>
                  <strong style={{ color: '#0369A1' }}>
                    {selectedOrder.delivery_fee_text || (selectedOrder.delivery_fee !== null && selectedOrder.delivery_fee !== undefined ? `${selectedOrder.delivery_fee} ج.م` : getDeliveryFeeByGov(selectedOrder.customer.governorate).textAr)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginBottom: '12px' }}>
                المنتجات المطلوبة ({selectedOrder.items.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={item.product_image} alt="" style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.product_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>كود: {item.product_sku} | الكمية: {item.quantity}</div>
                      </div>
                    </div>

                    <div style={{ fontWeight: 800, color: 'var(--primary-900)' }}>
                      {item.pricing_mode === 'on_request' ? 'طلب سعر' : `${item.total_price.toLocaleString('ar-EG')} ج.م`}
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--primary-50)', borderRadius: '8px', border: '1px solid var(--primary-200)', marginTop: '6px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary-900)' }}>إجمالي الطلب:</span>
                  <span style={{ fontWeight: 900, color: 'var(--primary-900)', fontSize: '1.15rem' }}>
                    {selectedOrder.total_amount.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus} style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginBottom: '10px' }}>
                تحديث حالة الطلب
              </h4>
              {statusUpdateError && (
                <div role="alert" style={{ marginBottom: '10px', padding: '10px 12px', color: '#991B1B', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px' }}>
                  {statusUpdateError}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px', alignItems: 'center' }}>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                >
                  <option value="new">جديد</option>
                  <option value="contacted">تم التواصل</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="preparing">جاري التجهيز</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التسليم</option>
                  <option value="cancelled">ملغي</option>
                </select>

                <input
                  type="text"
                  placeholder="ملاحظة التحديث (مثال: تم الاتصال والاتفاق على التوصيل غداً)..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '0.85rem' }}
                />

                <button type="submit" disabled={isUpdatingStatus} className="btn btn-primary btn-sm" style={{ padding: '8px 16px', fontWeight: 700 }}>
                  {isUpdatingStatus ? 'جارٍ التحديث...' : 'تحديث الحالة'}
                </button>
              </div>
            </form>

            {/* Status History Timeline */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748B', marginBottom: '8px' }}>
                سجل تتبع الحالة (Timeline):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedOrder.status_history.map((hist, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#475569' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-600)' }}></span>
                    <span style={{ fontWeight: 700 }}>{dataStore.getStatusArabicName(hist.status)}</span>
                    <span style={{ color: '#94A3B8' }}>— {new Date(hist.timestamp).toLocaleString('ar-EG')}</span>
                    {hist.note && <span>({hist.note})</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
