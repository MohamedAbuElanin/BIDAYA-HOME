import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Archive, RotateCcw, Layers, X, Eye } from 'lucide-react';
import { Category, Subcategory, AdminUser } from '../../types';
import { dataStore } from '../../services/dataStore';

interface CategoryManagementProps {
  currentUser: AdminUser;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({ currentUser }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSubcategories, setFormSubcategories] = useState<Subcategory[]>([]);
  const [newSubNameAr, setNewSubNameAr] = useState('');
  const [newSubProductTypes, setNewSubProductTypes] = useState('');
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
    return dataStore.subscribe(refresh);
  }, [showArchived]);

  const refresh = () => {
    setCategories(dataStore.getCategories(showArchived));
  };

  const openAdd = () => {
    setEditingCategory(null);
    setFormNameAr('');
    setFormNameEn('');
    setFormSlug(`cat-${Date.now().toString(36)}`);
    setFormImageUrl('https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80');
    setFormDesc('');
    setFormDisplayOrder(categories.length + 1);
    setFormIsActive(true);
    setFormSubcategories([]);
    setNewSubNameAr('');
    setNewSubProductTypes('');
    setEditingSubId(null);
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormNameAr(cat.name_ar);
    setFormNameEn(cat.name_en || '');
    setFormSlug(cat.slug);
    setFormImageUrl(cat.image_url);
    setFormDesc(cat.description || '');
    setFormDisplayOrder(cat.display_order || 1);
    setFormIsActive(cat.is_active);
    setFormSubcategories(cat.subcategories || []);
    setNewSubNameAr('');
    setNewSubProductTypes('');
    setEditingSubId(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim()) return;

    dataStore.saveCategory(
      {
        id: editingCategory?.id,
        name_ar: formNameAr,
        name_en: formNameEn,
        slug: formSlug || formNameAr.toLowerCase().replace(/\s+/g, '-'),
        image_url: formImageUrl,
        description: formDesc,
        display_order: Number(formDisplayOrder),
        is_active: formIsActive,
        subcategories: formSubcategories
      },
      currentUser
    );

    setIsModalOpen(false);
  };

  const handleAddSubcategory = () => {
    if (newSubNameAr.trim()) {
      const typesList = newSubProductTypes
        .split(/[,،]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const newSub: Subcategory = {
        id: `sub-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        category_id: editingCategory?.id || 'temp',
        name_ar: newSubNameAr.trim(),
        slug: newSubNameAr.trim().toLowerCase().replace(/\s+/g, '-'),
        product_types: typesList,
        display_order: formSubcategories.length + 1,
        is_archived: false
      };
      setFormSubcategories([...formSubcategories, newSub]);
      setNewSubNameAr('');
      setNewSubProductTypes('');
    }
  };

  const handleToggleArchiveSubcategory = (id: string) => {
    setFormSubcategories(
      formSubcategories.map((s) => (s.id === id ? { ...s, is_archived: !s.is_archived } : s))
    );
  };

  const handleUpdateSubcategoryField = (id: string, field: 'name_ar' | 'types', val: string) => {
    setFormSubcategories(
      formSubcategories.map((s) => {
        if (s.id !== id) return s;
        if (field === 'name_ar') return { ...s, name_ar: val };
        if (field === 'types') {
          const typesList = val.split(/[,،]/).map((t) => t.trim()).filter(Boolean);
          return { ...s, product_types: typesList };
        }
        return s;
      })
    );
  };

  const handleRemoveSubcategory = (id: string) => {
    setFormSubcategories(formSubcategories.filter((s) => s.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Action Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>
            أقسام المتجر ({categories.length})
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748B', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              style={{ accentColor: 'var(--primary-700)' }}
            />
            <span>عرض الأقسام المؤرشفة</span>
          </label>
        </div>

        <button onClick={openAdd} className="btn btn-primary" style={{ fontWeight: 700 }}>
          <Plus size={18} />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* Categories Grid Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}
      >
        {categories.map((cat) => {
          const productCount = dataStore.getProducts().filter((p) => p.category_id === cat.id).length;
          return (
            <div
              key={cat.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xs)',
                opacity: cat.is_archived ? 0.6 : 1
              }}
            >
              <div style={{ position: 'relative', height: '140px', backgroundColor: '#F1F5F9' }}>
                <img src={cat.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: cat.is_active ? '#ECFDF5' : '#FEF2F2',
                    color: cat.is_active ? '#047857' : '#B91C1C',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  {cat.is_active ? 'نشط' : 'معطل'}
                </div>
              </div>

              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
                      {cat.name_ar}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      الترتيب: {cat.display_order} | {productCount} منتج
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => openEdit(cat)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '6px', color: '#2563EB' }}
                      title="تعديل"
                    >
                      <Edit2 size={16} />
                    </button>
                    {cat.is_archived ? (
                      <button
                        onClick={() => dataStore.restoreCategory(cat.id, currentUser)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '6px', color: '#059669' }}
                        title="استعادة"
                      >
                        <RotateCcw size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => dataStore.archiveCategory(cat.id, currentUser)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '6px', color: '#D97706' }}
                        title="أرشفة"
                      >
                        <Archive size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('هل تريد حذف هذا القسم نهائياً؟')) {
                          dataStore.deleteCategory(cat.id, currentUser);
                        }
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '6px', color: '#DC2626' }}
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '12px', lineHeight: '1.4' }}>
                  {cat.description || 'لا يوجد وصف مخصص لهذا القسم.'}
                </p>

                {/* Subcategories list pills */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {cat.subcategories.map((sub) => (
                      <span
                        key={sub.id}
                        style={{
                          fontSize: '0.72rem',
                          backgroundColor: sub.is_archived ? '#FEE2E2' : '#F1F5F9',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          color: sub.is_archived ? '#DC2626' : '#475569',
                          textDecoration: sub.is_archived ? 'line-through' : 'none'
                        }}
                        title={sub.product_types && sub.product_types.length > 0 ? `الأنواع: ${sub.product_types.join('، ')}` : undefined}
                      >
                        {sub.name_ar}
                        {sub.product_types && sub.product_types.length > 0 ? ` (${sub.product_types.length})` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
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
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
                {editingCategory ? 'تعديل بيانات القسم' : 'إنشاء قسم رئيسي جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  اسم القسم بالعربي <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أدوات المطبخ والطهي"
                  value={formNameAr}
                  onChange={(e) => setFormNameAr(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  رابط صورة الغلاف (Image URL)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    ترتيب العرض في الموقع <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    الاسم بالإنجليزية (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kitchen & Cooking"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  الوصف التعريفي للقسم
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="وصف مختصر لمحتويات القسم..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                />
              </div>

              {/* Subcategories & Product Types Manager */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, marginBottom: '8px', color: '#1E293B' }}>
                  إدارة التصنيفات الفرعية وأنواع المنتجات التابعة:
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="اسم تصنيف فرعي جديد (مثال: أدوات الطهي)..."
                      value={newSubNameAr}
                      onChange={(e) => setNewSubNameAr(e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                    <button type="button" onClick={handleAddSubcategory} className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                      إضافة الفرع
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="أنواع المنتجات التابعة (مفصولة بفواصل مثل: حلل، طاسات، صواني، أدوات الخبز)..."
                    value={newSubProductTypes}
                    onChange={(e) => setNewSubProductTypes(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                  />
                </div>

                {/* Subcategories list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                  {formSubcategories.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center', padding: '12px' }}>
                      لا توجد تصنيفات فرعية مضافة بعد لهذا القسم.
                    </div>
                  ) : (
                    formSubcategories.map((sub) => {
                      const isArchived = Boolean(sub.is_archived);
                      const isEditing = editingSubId === sub.id;
                      return (
                        <div
                          key={sub.id}
                          style={{
                            backgroundColor: isArchived ? '#F1F5F9' : '#FFFFFF',
                            border: `1px solid ${isArchived ? '#CBD5E1' : '#E2E8F0'}`,
                            borderRadius: '8px',
                            padding: '10px 12px',
                            opacity: isArchived ? 0.7 : 1,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={sub.name_ar}
                                  onChange={(e) => handleUpdateSubcategoryField(sub.id, 'name_ar', e.target.value)}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #3B82F6', fontSize: '0.85rem' }}
                                />
                              ) : (
                                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1E293B', textDecoration: isArchived ? 'line-through' : 'none' }}>
                                  {sub.name_ar}
                                </span>
                              )}
                              {isArchived && (
                                <span style={{ fontSize: '0.68rem', backgroundColor: '#FEE2E2', color: '#DC2626', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                  مؤرشف
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => setEditingSubId(isEditing ? null : sub.id)}
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#2563EB' }}
                              >
                                {isEditing ? 'تم' : 'تعديل'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleArchiveSubcategory(sub.id)}
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', color: isArchived ? '#059669' : '#D97706' }}
                              >
                                {isArchived ? 'استعادة' : 'أرشفة'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSubcategory(sub.id)}
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#DC2626' }}
                              >
                                حذف
                              </button>
                            </div>
                          </div>

                          {/* Product Types Editor / Display */}
                          <div style={{ marginTop: '6px' }}>
                            {isEditing ? (
                              <input
                                type="text"
                                placeholder="أنواع المنتجات (مفصولة بفواصل)..."
                                value={(sub.product_types || []).join('، ')}
                                onChange={(e) => handleUpdateSubcategoryField(sub.id, 'types', e.target.value)}
                                style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
                              />
                            ) : sub.product_types && sub.product_types.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                {sub.product_types.map((pt, pIdx) => (
                                  <span
                                    key={pIdx}
                                    style={{
                                      fontSize: '0.72rem',
                                      backgroundColor: 'var(--primary-50)',
                                      color: 'var(--primary-800)',
                                      padding: '2px 8px',
                                      borderRadius: '4px'
                                    }}
                                  >
                                    {pt}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    style={{ accentColor: 'var(--primary-700)' }}
                  />
                  <span>تفعيل القسم وعرضه للعملاء</span>
                </label>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                    إلغاء
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px', fontWeight: 800 }}>
                    حفظ القسم
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
