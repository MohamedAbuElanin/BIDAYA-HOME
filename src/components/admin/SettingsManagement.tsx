import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  MessageCircle,
  Phone,
  Globe,
  Database,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { SiteSettings, AdminUser } from '../../types';
import { dataStore } from '../../services/dataStore';

interface SettingsManagementProps {
  currentUser: AdminUser;
}

export const SettingsManagement: React.FC<SettingsManagementProps> = ({ currentUser }) => {
  const [settings, setSettings] = useState<SiteSettings>(dataStore.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setSettings(dataStore.getSettings());
    return dataStore.subscribe(() => {
      setSettings(dataStore.getSettings());
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updateSettings(settings, currentUser);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('تحذير: هل أنت متأكد من إعادة ضبط بيانات المتجر بالكامل إلى البيانات الافتراضية الأولية؟')) {
      dataStore.resetToInitialData();
      alert('تمت إعادة ضبط البيانات بنجاح.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      {savedSuccess && (
        <div style={{ padding: '14px 18px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#047857', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <CheckCircle2 size={20} />
          <span>تم حفظ كافة التعديلات وتحديث إعدادات المتجر بنجاح!</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Basic Brand Info */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '16px', fontFamily: 'Cairo, sans-serif' }}>
            بيانات الهوية والمتجر
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                اسم المتجر بالعربي
              </label>
              <input
                type="text"
                value={settings.store_name_ar}
                onChange={(e) => setSettings({ ...settings, store_name_ar: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                اسم المتجر بالإنجليزية
              </label>
              <input
                type="text"
                value={settings.store_name_en}
                onChange={(e) => setSettings({ ...settings, store_name_en: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', direction: 'ltr', textAlign: 'right' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              الشعار اللفظي (Slogan)
            </label>
            <input
              type="text"
              value={settings.slogan_ar}
              onChange={(e) => setSettings({ ...settings, slogan_ar: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
            />
          </div>
        </div>

        {/* WhatsApp & Contact Details */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '16px', fontFamily: 'Cairo, sans-serif' }}>
            أرقام الواتساب والتواصل المركزي
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                رقم الواتساب لاستقبال الطلبات <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                placeholder="201509990745"
                dir="ltr"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', textAlign: 'right' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                اكتب الرقم مع كود الدولة 20 وبدون مسافات أو +
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                هاتف خدمة العملاء للعرض
              </label>
              <input
                type="text"
                value={settings.support_phone}
                onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                dir="ltr"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', textAlign: 'right' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              عنوان المتجر ونطاق الشحن
            </label>
            <input
              type="text"
              value={settings.store_address}
              onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
            />
          </div>
        </div>

        {/* Customizable WhatsApp Message Template */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
              قالب رسالة طلبات الواتساب
            </h3>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              متغيرات ذكية
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '10px' }}>
            الرموز المتاحة للاستبدال التلقائي: <code>{'{ORDER_NUMBER}'}</code>, <code>{'{PRODUCTS_LIST}'}</code>, <code>{'{TOTAL_AMOUNT}'}</code>, <code>{'{CUSTOMER_NAME}'}</code>, <code>{'{CUSTOMER_PHONE}'}</code>, <code>{'{GOVERNORATE}'}</code>, <code>{'{AREA}'}</code>, <code>{'{ADDRESS}'}</code>, <code>{'{NOTES}'}</code>
          </p>

          <textarea
            rows={9}
            value={settings.whatsapp_template}
            onChange={(e) => setSettings({ ...settings, whatsapp_template: e.target.value })}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.85rem', fontFamily: 'monospace', whiteSpace: 'pre' }}
          />
        </div>

        {/* Social Media Links */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '16px', fontFamily: 'Cairo, sans-serif' }}>
            روابط وسائل التواصل الاجتماعي
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                رابط صفحة Facebook
              </label>
              <input
                type="url"
                value={settings.facebook_url}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', direction: 'ltr', textAlign: 'left' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                رابط صفحة Instagram
              </label>
              <input
                type="url"
                value={settings.instagram_url}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', direction: 'ltr', textAlign: 'left' }}
              />
            </div>
          </div>
        </div>

        {/* Store Behavior Switches */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '16px', fontFamily: 'Cairo, sans-serif' }}>
            سلوك وإتاحة المتجر
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={settings.show_prices}
                onChange={(e) => setSettings({ ...settings, show_prices: e.target.checked })}
                style={{ accentColor: 'var(--primary-700)', width: '18px', height: '18px' }}
              />
              <span>إظهار الأسعار للعملاء في الكتالوج والصفحة الرئيسية</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={settings.enable_ordering}
                onChange={(e) => setSettings({ ...settings, enable_ordering: e.target.checked })}
                style={{ accentColor: 'var(--primary-700)', width: '18px', height: '18px' }}
              />
              <span>تفعيل نظام استلام الطلبات وسلة المشتريات</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={settings.enable_offers}
                onChange={(e) => setSettings({ ...settings, enable_offers: e.target.checked })}
                style={{ accentColor: 'var(--primary-700)', width: '18px', height: '18px' }}
              />
              <span>تفعيل صفحة وتبويب العروض والتخفيضات</span>
            </label>
          </div>
        </div>

        {/* SEO Settings */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '16px', fontFamily: 'Cairo, sans-serif' }}>
            تهيئة محركات البحث (SEO)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                عنوان الصفحة الرئيسي (SEO Title)
              </label>
              <input
                type="text"
                value={settings.seo_title}
                onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                وصف الموقع لمحركات البحث (Meta Description)
              </label>
              <textarea
                rows={2}
                value={settings.seo_description}
                onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleResetData}
            className="btn btn-outline"
            style={{ color: '#DC2626', borderColor: '#FECACA' }}
          >
            <RotateCcw size={16} />
            <span>إعادة ضبط البيانات الافتراضية</span>
          </button>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ padding: '12px 36px', fontWeight: 800, borderRadius: 'var(--radius-md)' }}
          >
            <Save size={18} />
            <span>حفظ كافة الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
};
