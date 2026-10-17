import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUpRight
} from 'lucide-react';
import { dataStore } from '../../services/dataStore';
import { Order, Product, AnalyticsEvent, OrderStatus } from '../../types';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateTab }) => {
  const [products, setProducts] = useState<Product[]>(() => dataStore.getProducts());
  const [orders, setOrders] = useState<Order[]>(() => dataStore.getOrders());
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => dataStore.getAnalyticsEvents());
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    void Promise.all([
      dataStore.refreshProductsFromDatabase(),
      dataStore.refreshOrdersFromDatabase(),
      dataStore.refreshAnalyticsFromDatabase()
    ]).then(() => {
      setProducts(dataStore.getProducts());
      setOrders(dataStore.getOrders());
      setEvents(dataStore.getAnalyticsEvents());
      setLoadError('');
    }).catch((error: unknown) => {
      setLoadError(error instanceof Error ? error.message : 'تعذر تحميل بيانات لوحة المؤشرات.');
    });

    return dataStore.subscribe(() => {
      setProducts(dataStore.getProducts());
      setOrders(dataStore.getOrders());
      setEvents(dataStore.getAnalyticsEvents());
    });
  }, []);

  // Metrics Calculation
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_available && !p.is_archived).length;
  const totalOrders = orders.length;
  const newOrders = orders.filter(o => o.status === 'new').length;
  const confirmedOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'delivered').length;
  
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const totalViews = events.filter(event => event.event_name === 'PRODUCT_VIEW').length;

  // Visitors & Devices from events / sessions
  const uniqueVisitors = new Set(events.map(e => e.visitor_id)).size;
  const visitorsForEvent = (eventName: AnalyticsEvent['event_name']) =>
    new Set(events.filter(event => event.event_name === eventName).map(event => event.visitor_id)).size;
  const uniqueProductViewers = visitorsForEvent('PRODUCT_VIEW');
  const uniqueCartVisitors = visitorsForEvent('ADD_TO_CART');
  const uniqueCheckoutVisitors = visitorsForEvent('BEGIN_CHECKOUT');
  const uniqueOrderVisitors = visitorsForEvent('ORDER_CREATED');
  const mobileCount = events.filter(e => e.device_type === 'mobile').length;
  const desktopCount = events.filter(e => e.device_type === 'desktop').length;
  const tabletCount = events.filter(e => e.device_type === 'tablet').length;
  const totalDevices = Math.max(1, mobileCount + desktopCount + tabletCount);

  // Traffic Sources
  const fbCount = events.filter(e => e.traffic_source === 'facebook').length;
  const igCount = events.filter(e => e.traffic_source === 'instagram').length;
  const googleCount = events.filter(e => e.traffic_source === 'google').length;
  const directCount = events.filter(e => e.traffic_source === 'direct').length;
  const totalTraffic = Math.max(1, fbCount + igCount + googleCount + directCount);

  // Top Viewed Products
  const productEventCounts = (eventName: AnalyticsEvent['event_name']) => {
    const counts = new Map<string, number>();
    for (const event of events) {
      const productId = event.event_name === eventName ? event.metadata?.product_id : null;
      if (typeof productId === 'string') counts.set(productId, (counts.get(productId) || 0) + 1);
    }
    return counts;
  };
  const productViewCounts = productEventCounts('PRODUCT_VIEW');
  const productCartCounts = productEventCounts('ADD_TO_CART');
  const topViewedProducts = [...products]
    .sort((a, b) => (productViewCounts.get(b.id) || 0) - (productViewCounts.get(a.id) || 0))
    .slice(0, 5);
  const topRequestedProducts = [...products]
    .sort((a, b) => (productCartCounts.get(b.id) || 0) - (productCartCounts.get(a.id) || 0))
    .slice(0, 5);

  const getStatusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, { label: string; bg: string; color: string }> = {
      new: { label: 'جديد', bg: '#EFF6FF', color: '#1D4ED8' },
      contacted: { label: 'تم التواصل', bg: '#F5F3FF', color: '#6D28D9' },
      confirmed: { label: 'مؤكد', bg: '#F0F9FF', color: '#0369A1' },
      preparing: { label: 'جاري التجهيز', bg: '#FFFBEB', color: '#B45309' },
      shipped: { label: 'تم الشحن', bg: '#EEF2FF', color: '#4338CA' },
      delivered: { label: 'تم التسليم', bg: '#ECFDF5', color: '#047857' },
      cancelled: { label: 'ملغي', bg: '#FEF2F2', color: '#B91C1C' }
    };
    const s = map[status] || map.new;
    return (
      <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, backgroundColor: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {loadError && (
        <div role="alert" style={{ padding: '12px 16px', borderRadius: '8px', color: '#991B1B', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
          {loadError}
        </div>
      )}
      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Total Orders */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>إجمالي الطلبات</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1E293B', marginTop: '4px', fontFamily: 'Cairo, sans-serif' }}>
                {totalOrders}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{newOrders} طلبات جديدة بحاجة للمتابعة 🔥</span>
          </div>
        </div>

        {/* Total Volume */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>قيمة الطلبات التقديرية</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1E293B', marginTop: '4px', fontFamily: 'Cairo, sans-serif' }}>
                {totalRevenue.toLocaleString('ar-EG')} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>ج.م</span>
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '12px' }}>
            {confirmedOrders} طلب مؤكد ومشحون
          </div>
        </div>

        {/* Products */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>المنتجات في الكتالوج</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1E293B', marginTop: '4px', fontFamily: 'Cairo, sans-serif' }}>
                {totalProducts}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FDF2F8', color: '#DB2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '12px' }}>
            {activeProducts} منتج متوفر بالمخزن وجاهز للطلب
          </div>
        </div>

        {/* Visitors & Views */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>الزوار الفريدين</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1E293B', marginTop: '4px', fontFamily: 'Cairo, sans-serif' }}>
                {uniqueVisitors}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '12px' }}>
            {totalViews} مشاهدة للمنتجات
          </div>
        </div>
      </div>

      {/* Conversion Funnel Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
            مسار تحويل الطلبات (Conversion Funnel)
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>من الزيارة حتى تسجيل الطلب في قاعدة البيانات</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>1. الزوار</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{uniqueVisitors}</div>
            <div style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>100%</div>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>2. تصفح المنتجات</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{uniqueProductViewers}</div>
            <div style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>{Math.round((uniqueProductViewers / Math.max(1, uniqueVisitors)) * 100)}%</div>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>3. الإضافة للسلة</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{uniqueCartVisitors}</div>
            <div style={{ fontSize: '0.7rem', color: '#3B82F6', fontWeight: 700 }}>{Math.round((uniqueCartVisitors / Math.max(1, uniqueVisitors)) * 100)}%</div>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>4. بدء إتمام الطلب</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{uniqueCheckoutVisitors}</div>
            <div style={{ fontSize: '0.7rem', color: '#8B5CF6', fontWeight: 700 }}>{Math.round((uniqueCheckoutVisitors / Math.max(1, uniqueVisitors)) * 100)}%</div>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#ECFDF5', borderRadius: '8px', border: '1px solid #BBF7D0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>5. تسجيل الطلب</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#065F46', marginTop: '2px' }}>{uniqueOrderVisitors}</div>
            <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800 }}>{((uniqueOrderVisitors / Math.max(1, uniqueVisitors)) * 100).toFixed(1)}% تحويل</div>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid: Traffic Sources & Device Share */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Traffic Sources */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: '16px', fontFamily: 'Cairo, sans-serif' }}>
            مصادر الزيارات (Traffic Sources)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>فيسبوك (Facebook Ads / Organic)</span>
                <span style={{ fontWeight: 700 }}>{Math.round((fbCount / totalTraffic) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(fbCount / totalTraffic) * 100}%`, height: '100%', backgroundColor: '#1877F2' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>انستغرام (Instagram Reels / Profile)</span>
                <span style={{ fontWeight: 700 }}>{Math.round((igCount / totalTraffic) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(igCount / totalTraffic) * 100}%`, height: '100%', backgroundColor: '#E1306C' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>محرك بحث جوجل (Google Search)</span>
                <span style={{ fontWeight: 700 }}>{Math.round((googleCount / totalTraffic) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(googleCount / totalTraffic) * 100}%`, height: '100%', backgroundColor: '#0F9D58' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>زيارات مباشرة وواتساب (Direct)</span>
                <span style={{ fontWeight: 700 }}>{Math.round((directCount / totalTraffic) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(directCount / totalTraffic) * 100}%`, height: '100%', backgroundColor: '#64748B' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Device Breakdown */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: '16px', fontFamily: 'Cairo, sans-serif' }}>
            أنواع الأجهزة المستخدمة
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '16px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <Smartphone size={24} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1E293B' }}>{Math.round((mobileCount / totalDevices) * 100)}%</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>هواتف ذكية</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <Monitor size={24} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1E293B' }}>{Math.round((desktopCount / totalDevices) * 100)}%</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>كمبيوتر ولابتوب</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <Tablet size={24} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1E293B' }}>{Math.round((tabletCount / totalDevices) * 100)}%</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>تابلت وأجهزة لوحية</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Rankings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Top Viewed */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: '14px', fontFamily: 'Cairo, sans-serif' }}>
            المنتجات الأكثر مشاهدة وتصفحاً 👁️
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topViewedProducts.map((p, idx) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < topViewedProducts.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                    {p.name_ar}
                  </span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-700)', flexShrink: 0 }}>
                  {productViewCounts.get(p.id) || 0} مشاهدة
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Requested */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: '14px', fontFamily: 'Cairo, sans-serif' }}>
            المنتجات الأكثر طلباً في السلات 🛒
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topRequestedProducts.map((p, idx) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < topRequestedProducts.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                    {p.name_ar}
                  </span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-600)', flexShrink: 0 }}>
                  {productCartCounts.get(p.id) || 0} إضافة
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
            أحدث طلبات الشراء
          </h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="btn btn-outline btn-sm"
          >
            <span>عرض كافة الطلبات ({orders.length})</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '10px 14px' }}>رقم الطلب</th>
                <th style={{ padding: '10px 14px' }}>العميل</th>
                <th style={{ padding: '10px 14px' }}>المحافظة</th>
                <th style={{ padding: '10px 14px' }}>عدد القطع</th>
                <th style={{ padding: '10px 14px' }}>الإجمالي</th>
                <th style={{ padding: '10px 14px' }}>الحالة</th>
                <th style={{ padding: '10px 14px' }}>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--primary-800)' }}>
                    {order.order_number}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{order.customer.name}</td>
                  <td style={{ padding: '12px 14px', color: '#64748B' }}>{order.customer.governorate}</td>
                  <td style={{ padding: '12px 14px' }}>{order.items.reduce((s, i) => s + i.quantity, 0)} قطعة</td>
                  <td style={{ padding: '12px 14px', fontWeight: 800 }}>{order.total_amount.toLocaleString('ar-EG')} ج.م</td>
                  <td style={{ padding: '12px 14px' }}>{getStatusBadge(order.status)}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#94A3B8' }}>
                    {new Date(order.created_at).toLocaleDateString('ar-EG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
