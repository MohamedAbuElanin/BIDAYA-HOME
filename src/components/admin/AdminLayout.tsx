import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  ShoppingBag,
  Users,
  BarChart3,
  UserCog,
  History,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { AdminUser } from '../../types';

interface AdminLayoutProps {
  currentUser: AdminUser;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onReturnToStore: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onLogout,
  onReturnToStore,
  children
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getRoleArabicName = (role: string) => {
    switch (role) {
      case 'super_admin': return '👑 Super Admin (مدير عام)';
      case 'admin': return '⚡ Admin (مدير نظام)';
      case 'catalog_manager': return '🏷️ مدير الكتالوج والمنتجات';
      case 'order_manager': return '📦 مدير الطلبات والمبيعات';
      default: return role;
    }
  };

  const navItems = [
    { key: 'overview', label: 'نظرة عامة ومؤشرات', icon: LayoutDashboard },
    { key: 'products', label: 'إدارة المنتجات', icon: Package },
    { key: 'categories', label: 'الأقسام والتصنيفات', icon: Layers },
    { key: 'brands', label: 'العلامات التجارية', icon: Award },
    { key: 'orders', label: 'الطلبات والمبيعات', icon: ShoppingBag },
    { key: 'customers', label: 'دليل العملاء', icon: Users },
    { key: 'analytics', label: 'تحليلات الزوار والتحويل', icon: BarChart3 },
    { key: 'users', label: 'المستخدمين والصلاحيات', icon: UserCog },
    { key: 'activity', label: 'سجل العمليات (Audit Log)', icon: History },
    { key: 'settings', label: 'إعدادات المتجر والربط', icon: Settings }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F1F5F9' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '270px',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 90,
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
        }}
        className={isSidebarOpen ? 'admin-sidebar-mobile-open' : 'admin-sidebar'}
      >
        {/* Sidebar Brand Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.svg"
              alt="Bidaya Home logo"
              style={{
                width: '42px',
                height: '42px',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
                flexShrink: 0
              }}
            />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Cairo, sans-serif' }}>
                بداية هوم
              </div>
              <div style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 600 }}>
                لوحة الإدارة والمخزن
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="btn btn-ghost mobile-close-sidebar"
            style={{ color: '#FFFFFF' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Current User Card */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            {currentUser.name.charAt(0)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
              {getRoleArabicName(currentUser.role)}
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelectTab(item.key);
                  setIsSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--primary-700)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'right',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                <Icon size={18} color={isActive ? '#FFFFFF' : '#64748B'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Actions */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={onReturnToStore}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px',
              backgroundColor: 'rgba(56, 149, 93, 0.2)',
              border: '1px solid rgba(56, 149, 93, 0.4)',
              borderRadius: 'var(--radius-md)',
              color: '#4ADE80',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={15} />
            <span>عرض المتجر للعملاء</span>
          </button>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#EF4444',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={15} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 80
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="btn btn-ghost mobile-sidebar-toggle"
              style={{ padding: '6px' }}
            >
              <Menu size={22} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
              {navItems.find((i) => i.key === activeTab)?.label || 'لوحة الإدارة'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onReturnToStore}
              className="btn btn-outline btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <ExternalLink size={14} />
              <span>المتجر</span>
            </button>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#ECFDF5',
                color: '#047857',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
              <span>النظام متصل ونشط</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ padding: '28px', flex: 1 }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .admin-sidebar {
            display: none !important;
          }
          .admin-sidebar-mobile-open {
            display: flex !important;
            position: fixed !important;
            top: 0;
            right: 0;
            bottom: 0;
            width: 280px;
            z-index: 1000;
          }
          .mobile-sidebar-toggle {
            display: block !important;
          }
          .mobile-close-sidebar {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
