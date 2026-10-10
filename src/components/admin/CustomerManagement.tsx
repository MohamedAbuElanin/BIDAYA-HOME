import React, { useState, useEffect } from 'react';
import { Search, Users, Phone, MapPin, ShoppingBag, Eye, X, MessageCircle } from 'lucide-react';
import { Customer, Order } from '../../types';
import { dataStore } from '../../services/dataStore';

export const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setCustomers(dataStore.getCustomers());
    return dataStore.subscribe(() => {
      setCustomers(dataStore.getCustomers());
    });
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.governorate.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCustomerOrders = (phone: string): Order[] => {
    return dataStore.getOrders().filter((o) => o.customer.phone.trim() === phone.trim());
  };

  const handleCustomerWhatsApp = (phone: string, name: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      cleanPhone = `20${cleanPhone.substring(1)}`;
    }
    const text = `مرحباً ${name}، نتواصل معك من متجر بداية هوم 🌸`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
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
              placeholder="بحث باسم العميل أو رقم الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.88rem', width: '100%' }}
            />
          </div>
        </div>

        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#64748B' }}>
          إجمالي العملاء: {customers.length} عميل
        </div>
      </div>

      {/* Customers Table */}
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
                <th style={{ padding: '12px 16px' }}>اسم العميل</th>
                <th style={{ padding: '12px 16px' }}>رقم الهاتف</th>
                <th style={{ padding: '12px 16px' }}>المحافظة والمنطقة</th>
                <th style={{ padding: '12px 16px' }}>عدد الطلبات</th>
                <th style={{ padding: '12px 16px' }}>إجمالي المشتريات</th>
                <th style={{ padding: '12px 16px' }}>آخر طلب</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    لا يوجد عملاء مطابقين للبحث.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1E293B' }}>
                      {cust.name}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }} dir="ltr">
                      {cust.phone}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>
                      {cust.governorate} {cust.area ? `— ${cust.area}` : ''}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                      {cust.orders_count} {cust.orders_count === 1 ? 'طلب' : 'طلبات'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--primary-800)' }}>
                      {cust.total_spent.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#94A3B8' }}>
                      {new Date(cust.last_order_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                        >
                          <Eye size={14} />
                          <span>سجل الطلبات</span>
                        </button>
                        <button
                          onClick={() => handleCustomerWhatsApp(cust.phone, cust.name)}
                          className="btn btn-whatsapp btn-sm"
                          style={{ padding: '6px 8px' }}
                          title="محادثة واتساب"
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

      {/* Customer Order History Modal */}
      {selectedCustomer && (
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
              maxWidth: '680px',
              maxHeight: '88vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
                  سجل طلبات العميل: {selectedCustomer.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  هاتف: <span dir="ltr">{selectedCustomer.phone}</span> | المحافظة: {selectedCustomer.governorate}
                </span>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="btn btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Orders list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getCustomerOrders(selectedCustomer.phone).map((ord) => (
                <div key={ord.id} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary-800)', fontFamily: 'monospace' }}>
                      #{ord.order_number}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      {new Date(ord.created_at).toLocaleString('ar-EG')}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>
                    {ord.items.map((i) => `${i.product_name} (${i.quantity}×)`).join(' + ')}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                    <span style={{ fontWeight: 700, color: '#1E293B' }}>
                      الإجمالي: {ord.total_amount.toLocaleString('ar-EG')} ج.م
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
                      {dataStore.getStatusArabicName(ord.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
