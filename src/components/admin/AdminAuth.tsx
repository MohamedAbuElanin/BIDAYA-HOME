import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { AdminUser } from '../../types';
import { getSupabaseClient } from '../../lib/supabase';

interface AdminAuthProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToStore: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    const client = getSupabaseClient();
    if (!client) { setError('إعداد تسجيل الدخول الآمن غير مكتمل.'); return; }
    setIsSubmitting(true);
    setError('');
    try {
      const { data: auth, error: authError } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (authError || !auth.user) throw new Error('بيانات تسجيل الدخول غير صحيحة.');
      const { data: admin, error: adminError } = await client.from('admin_users').select('id,name,email,role,avatar_url,last_login_at,created_at').eq('auth_user_id', auth.user.id).maybeSingle();
      if (adminError || !admin) {
        await client.auth.signOut();
        throw new Error('هذا الحساب غير مخول للوصول إلى لوحة الإدارة.');
      }
      onLoginSuccess(admin as AdminUser);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'تعذر تسجيل الدخول.');
    } finally { setIsSubmitting(false); }
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
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px', fontWeight: 800, borderRadius: 'var(--radius-md)' }}
          >
            <span>{isSubmitting ? 'جارٍ التحقق...' : 'دخول لوحة التحكم'}</span>
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
