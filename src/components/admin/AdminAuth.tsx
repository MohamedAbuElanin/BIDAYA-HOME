import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowLeft, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { AdminUser, AdminRole } from '../../types';
import { dataStore } from '../../services/dataStore';

interface AdminAuthProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToStore: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [email, setEmail] = useState('admin@bidayahome.com');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('super_admin');
  const [error, setError] = useState('');

  const adminUsers = dataStore.getAdminUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    // Match or create admin user session
    const existing = adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    const user: AdminUser = existing || {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: selectedRole,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    user.last_login_at = new Date().toISOString();
    dataStore.logActivity(user, 'تسجيل دخول للنظام', 'auth', user.id, user.name, `تم الدخول بنجاح بصلاحية ${user.role}`);

    onLoginSuccess(user);
  };

  const handleQuickRoleSelect = (role: AdminRole, userEmail: string, userName: string) => {
    setEmail(userEmail);
    setSelectedRole(role);
    const user: AdminUser = {
      id: `usr-${role}`,
      name: userName,
      email: userEmail,
      role: role,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    dataStore.logActivity(user, 'تسجيل دخول سريع للنظام', 'auth', user.id, user.name, `تم الدخول بصلاحية ${role}`);
    onLoginSuccess(user);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative'
      }}
    >
      {/* Background Accent */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(41, 119, 73, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          backgroundColor: '#1E293B',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 1,
          color: '#F8FAFC'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 20px rgba(41, 119, 73, 0.4)'
            }}
          >
            <ShieldCheck size={32} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px', fontFamily: 'Cairo, sans-serif' }}>
            لوحة تحكم بداية هوم
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            إدارة المنتجات، الطلبات، التحليلات، وإعدادات المتجر
          </p>
        </div>

        {/* Quick Demo Logins Selection */}
        <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#0F172A', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '8px', fontWeight: 700 }}>
            تسجيل دخول تجريبي سريع حسب الدور:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickRoleSelect('super_admin', 'admin@bidayahome.com', 'المدير العام')}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid rgba(56, 149, 93, 0.4)',
                backgroundColor: 'rgba(56, 149, 93, 0.15)',
                color: '#4ADE80',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              👑 Super Admin
            </button>

            <button
              type="button"
              onClick={() => handleQuickRoleSelect('order_manager', 'orders@bidayahome.com', 'مسؤول المبيعات')}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid rgba(14, 165, 233, 0.4)',
                backgroundColor: 'rgba(14, 165, 233, 0.15)',
                color: '#38BDF8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              📦 مدير الطلبات
            </button>

            <button
              type="button"
              onClick={() => handleQuickRoleSelect('catalog_manager', 'catalog@bidayahome.com', 'مدير الكتالوج')}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid rgba(217, 112, 54, 0.4)',
                backgroundColor: 'rgba(217, 112, 54, 0.15)',
                color: '#FB923C',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🏷️ مدير الكتالوج
            </button>

            <button
              type="button"
              onClick={() => handleQuickRoleSelect('admin', 'manager@bidayahome.com', 'مدير النظام')}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                color: '#C084FC',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ⚡ Admin عام
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
              البريد الإلكتروني
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  backgroundColor: '#0F172A',
                  border: '1.5px solid #334155',
                  borderRadius: 'var(--radius-md)',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                  direction: 'ltr',
                  textAlign: 'left'
                }}
              />
              <Mail size={18} color="#64748B" style={{ position: 'absolute', top: '11px', left: '12px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
              كلمة المرور
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  backgroundColor: '#0F172A',
                  border: '1.5px solid #334155',
                  borderRadius: 'var(--radius-md)',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                  direction: 'ltr',
                  textAlign: 'left'
                }}
              />
              <Lock size={18} color="#64748B" style={{ position: 'absolute', top: '11px', left: '12px' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px', fontWeight: 800, borderRadius: 'var(--radius-md)' }}
          >
            <span>دخول لوحة التحكم</span>
          </button>
        </form>

        {/* Back to Customer Storefront */}
        <div style={{ marginTop: '24px', textAlign: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={onBackToStore}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowRight size={16} />
            <span>العودة لمتجر بداية هوم للعملاء</span>
          </button>
        </div>
      </div>
    </div>
  );
};
