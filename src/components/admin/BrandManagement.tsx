import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Award, X } from 'lucide-react';
import { Brand, AdminUser } from '../../types';
import { dataStore } from '../../services/dataStore';

interface BrandManagementProps {
  currentUser: AdminUser;
}

export const BrandManagement: React.FC<BrandManagementProps> = ({ currentUser }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    refresh();
    return dataStore.subscribe(refresh);
  }, []);

  const refresh = () => {
    setBrands(dataStore.getBrands(true));
  };

  const openAdd = () => {
    setEditingBrand(null);
    setFormNameAr('');
    setFormNameEn('');
    setFormSlug(`brand-${Date.now().toString(36)}`);
    setFormLogoUrl('https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=120&auto=format&fit=crop&q=80');
    setFormDesc('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormNameAr(brand.name_ar);
    setFormNameEn(brand.name_en || '');
    setFormSlug(brand.slug);
    setFormLogoUrl(brand.logo_url);
    setFormDesc(brand.description || '');
    setFormIsActive(brand.is_active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim()) return;

    dataStore.saveBrand(
      {
        id: editingBrand?.id,
        name_ar: formNameAr,
        name_en: formNameEn,
        slug: formSlug || formNameAr.toLowerCase().replace(/\s+/g, '-'),
        logo_url: formLogoUrl,
        description: formDesc,
        is_active: formIsActive
      },
      currentUser
    );

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل تريد حذف هذه العلامة التجارية؟')) {
      dataStore.deleteBrand(id, currentUser);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>
          العلامات التجارية والشركات المصنعة ({brands.length})
        </div>

        <button onClick={openAdd} className="btn btn-primary" style={{ fontWeight: 700 }}>
          <Plus size={18} />
          <span>إضافة ماركة جديدة</span>
        </button>
      </div>

      {/* Brands Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}
      >
        {brands.map((brand) => {
          const productCount = dataStore.getProducts().filter((p) => p.brand_id === brand.id).length;
          return (
            <div
              key={brand.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: 'var(--shadow-xs)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <img
                  src={brand.logo_url}
                  alt=""
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0'
                  }}
                />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
                    {brand.name_ar}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {productCount} منتج مسجل
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.5', marginBottom: '16px' }}>
                {brand.description || 'لا يوجد وصف متاح.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: brand.is_active ? '#ECFDF5' : '#FEF2F2',
                    color: brand.is_active ? '#047857' : '#B91C1C',
                    fontWeight: 700
                  }}
                >
                  {brand.is_active ? 'نشط' : 'معطل'}
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => openEdit(brand)} className="btn btn-ghost btn-sm" style={{ padding: '6px', color: '#2563EB' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(brand.id)} className="btn btn-ghost btn-sm" style={{ padding: '6px', color: '#DC2626' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
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
              maxWidth: '540px',
              padding: '24px',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
                {editingBrand ? 'تعديل العلامة التجارية' : 'إضافة علامة تجارية جديدة'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  اسم الماركة بالعربي <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: لوك إيزي"
                  value={formNameAr}
                  onChange={(e) => setFormNameAr(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  رابط الشعار (Logo URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formLogoUrl}
                  onChange={(e) => setFormLogoUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  الوصف التعريفي
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    style={{ accentColor: 'var(--primary-700)' }}
                  />
                  <span>تفعيل العلامة التجارية</span>
                </label>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                    إلغاء
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px', fontWeight: 800 }}>
                    حفظ
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
