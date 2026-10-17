import React, { useState, useEffect } from 'react';
import { UserCog, Plus, ShieldCheck, Mail, Calendar, X } from 'lucide-react';
import { AdminUser, AdminRole } from '../../types';
import { dataStore } from '../../services/dataStore';

interface UsersManagementProps {
  currentUser: AdminUser;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('order_manager');
  const [operationError, setOperationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setUsers(dataStore.getAdminUsers());
    const loadUsers = () => {
      void dataStore.refreshAdminUsersFromDatabase().then(() => {
        setUsers(dataStore.getAdminUsers());
        setOperationError('');
      }).catch((error: unknown) => {
        setOperationError(error instanceof Error ? error.message : 'تعذر تحميل حسابات الإدارة.');
      });
    };
    loadUsers();
    return dataStore.subscribe(() => {
      setUsers(dataStore.getAdminUsers());
    });
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    setOperationError('');
    setIsSubmitting(true);
    try {
      await dataStore.inviteAdminUser({
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole
      });
      setUsers(dataStore.getAdminUsers());
      setIsModalOpen(false);
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'تعذر إرسال دعوة المستخدم الإداري.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleArabicName = (role: AdminRole) => {
    switch (role) {
      case 'super_admin': return '👑 Super Admin (مدير عام كامل الصلاحيات)';
      case 'admin': return '⚡ Admin (مدير منتجات وطلبات وتحليلات)';
      case 'catalog_manager': return '🏷️ Catalog Manager (مدير المنتجات والأقسام)';
      case 'order_manager': return '📦 Order Manager (مدير الطلبات والعملاء)';
      default: return role;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {operationError && (
        <div role="alert" style={{ padding: '12px 16px', borderRadius: '8px', color: '#991B1B', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
          {operationError}
        </div>
      )}
      {/* Header */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
            فريق الإدارة والمستخدمين ({users.length})
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
            التحكم في أدوار وصلاحيات الوصول للوحة التحكم
          </p>
        </div>

        {currentUser.role === 'super_admin' && (
          <button
            onClick={() => {
              setFormName('');
              setFormEmail('');
              setFormRole('order_manager');
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
            style={{ fontWeight: 700 }}
          >
            <Plus size={18} />
            <span>إضافة مستخدم جديد</span>
          </button>
        )}
      </div>

      {/* Users List */}
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
                <th style={{ padding: '12px 16px' }}>اسم المستخدم</th>
                <th style={{ padding: '12px 16px' }}>البريد الإلكتروني</th>
                <th style={{ padding: '12px 16px' }}>الدور والصلاحية</th>
                <th style={{ padding: '12px 16px' }}>آخر تسجيل دخول</th>
                <th style={{ padding: '12px 16px' }}>تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1E293B' }}>
                    {user.name}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569', direction: 'ltr', textAlign: 'right' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: user.role === 'super_admin' ? '#FEF3C7' : '#EFF6FF',
                        color: user.role === 'super_admin' ? '#92400E' : '#1E40AF'
                      }}
                    >
                      {getRoleArabicName(user.role)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#64748B' }}>
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString('ar-EG') : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#94A3B8' }}>
                    {new Date(user.created_at).toLocaleDateString('ar-EG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix Reference */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: '14px', fontFamily: 'Cairo, sans-serif' }}>
          مصفوفة الصلاحيات حسب الأدوار:
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.85rem' }}>
          <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontWeight: 800, color: '#92400E', marginBottom: '6px' }}>👑 Super Admin</div>
            <ul style={{ listStyle: 'disc', paddingRight: '16px', color: '#475569', lineHeight: '1.6' }}>
              <li>إدارة كاملة للمنتجات والأقسام</li>
              <li>إدارة وتحديث حالات الطلبات</li>
              <li>التحكم في إعدادات المتجر وقوالب الواتساب</li>
              <li>إدارة المستخدمين وسجل العمليات</li>
            </ul>
          </div>

          <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontWeight: 800, color: '#1E40AF', marginBottom: '6px' }}>⚡ Admin عام</div>
            <ul style={{ listStyle: 'disc', paddingRight: '16px', color: '#475569', lineHeight: '1.6' }}>
              <li>إدارة المنتجات والأقسام والماركات</li>
              <li>إدارة الطلبات والعملاء</li>
              <li>عرض التحليلات والإحصائيات</li>
            </ul>
          </div>

          <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontWeight: 800, color: '#047857', marginBottom: '6px' }}>📦 Order Manager</div>
            <ul style={{ listStyle: 'disc', paddingRight: '16px', color: '#475569', lineHeight: '1.6' }}>
              <li>إدارة وتأكيد وشحن الطلبات</li>
              <li>محادثة العملاء وتحديث الحالات</li>
              <li>عرض دليل العملاء وسجل الشراء</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
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
              maxWidth: '500px',
              padding: '24px',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
                إضافة مستخدم إداري جديد
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {operationError && (
                <div role="alert" style={{ padding: '10px 12px', color: '#991B1B', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px' }}>
                  {operationError}
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  اسم المستخدم <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد سمير"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  البريد الإلكتروني <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@bidayahome.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', direction: 'ltr', textAlign: 'right' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  الدور والصلاحية
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as AdminRole)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                >
                  <option value="super_admin">Super Admin (مدير عام كامل)</option>
                  <option value="admin">Admin (مدير نظام عام)</option>
                  <option value="catalog_manager">Catalog Manager (مدير الكتالوج)</option>
                  <option value="order_manager">Order Manager (مدير الطلبات)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  إلغاء
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '8px 24px', fontWeight: 800 }}>
                  {isSubmitting ? 'جارٍ إرسال الدعوة...' : 'إرسال دعوة المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
