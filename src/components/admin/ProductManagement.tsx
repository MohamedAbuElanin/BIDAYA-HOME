import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, Category, Brand, PricingMode, AdminUser, ProductSpecification } from '../../types';
import { dataStore } from '../../services/dataStore';

const MAX_UPLOAD_SIZE = 15 * 1024 * 1024;
const MAX_COMPRESSED_IMAGE_SIZE = 500 * 1024;

const compressImage = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error(`الملف "${file.name}" ليس صورة صالحة.`);
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error(`حجم الصورة "${file.name}" أكبر من الحد المسموح (15 ميجابايت).`);
  }

  const bitmap = await createImageBitmap(file);
  try {
    const maxDimension = 1400;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('تعذر تجهيز الصورة للرفع.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    let compressedBlob: Blob | null = null;
    for (const quality of [0.82, 0.7, 0.58, 0.46]) {
      compressedBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/webp', quality);
      });
      if (compressedBlob && compressedBlob.size <= MAX_COMPRESSED_IMAGE_SIZE) break;
    }
    if (!compressedBlob) throw new Error('تعذر ضغط الصورة.');
    if (compressedBlob.size > MAX_COMPRESSED_IMAGE_SIZE) {
      throw new Error(`تعذر ضغط الصورة "${file.name}" إلى الحجم المطلوب.`);
    }

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('تعذر قراءة الصورة بعد تجهيزها.'));
      };
      reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة.'));
      reader.readAsDataURL(compressedBlob);
    });
  } finally {
    bitmap.close();
  }
};

interface ProductManagementProps {
  currentUser: AdminUser;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({ currentUser }) => {
  const [allProducts, setProducts] = useState<Product[]>(() => dataStore.getProducts(true));
  const [categories, setCategories] = useState<Category[]>(() => dataStore.getCategories());
  const [brands, setBrands] = useState<Brand[]>(() => dataStore.getBrands());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const products = showArchived ? allProducts : allProducts.filter((product) => !product.is_archived);

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Form State
  const [formNameAr, setFormNameAr] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formOldPrice, setFormOldPrice] = useState<number | undefined>(undefined);
  const [formPricingMode, setFormPricingMode] = useState<PricingMode>('fixed');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formSubcategoryId, setFormSubcategoryId] = useState('');
  const [formProductType, setFormProductType] = useState('');
  const [formBrandId, setFormBrandId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [formError, setFormError] = useState('');
  const [operationError, setOperationError] = useState('');
  const [formPrimaryImgIdx, setFormPrimaryImgIdx] = useState(0);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsNew, setFormIsNew] = useState(true);
  const [formIsOffer, setFormIsOffer] = useState(false);
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formSpecs, setFormSpecs] = useState<ProductSpecification[]>([]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  const refreshData = useCallback(() => {
    setProducts(dataStore.getProducts(true));
    setCategories(dataStore.getCategories());
    setBrands(dataStore.getBrands());
  }, []);

  useEffect(() => dataStore.subscribe(refreshData), [refreshData]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormNameAr('');
    setFormSku(`BH-PRD-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormPrice(250);
    setFormOldPrice(undefined);
    setFormPricingMode('fixed');
    setFormCategoryId(categories[0]?.id || '');
    setFormSubcategoryId('');
    setFormProductType('');
    setFormBrandId(brands[0]?.id || '');
    setFormDescription('');
    setFormShortDesc('');
    setFormImages([]);
    setNewImageUrl('');
    setImageUploadError('');
    setFormError('');
    setFormPrimaryImgIdx(0);
    setFormIsFeatured(false);
    setFormIsNew(true);
    setFormIsOffer(false);
    setFormIsAvailable(true);
    setFormSpecs([
      { key: 'الخامة', value: 'بلاستيك صحي عالي الجودة' },
      { key: 'الاستخدام', value: 'منزلي ومطبخ' }
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormNameAr(p.name_ar);
    setFormSku(p.sku);
    setFormPrice(p.price);
    setFormOldPrice(p.old_price);
    setFormPricingMode(p.pricing_mode);
    setFormCategoryId(p.category_id);
    setFormSubcategoryId(p.subcategory_id || '');
    setFormProductType(p.product_type || '');
    setFormBrandId(p.brand_id || '');
    setFormDescription(p.description);
    setFormShortDesc(p.short_description || '');
    setFormImages(p.images || []);
    setNewImageUrl('');
    setImageUploadError('');
    setFormError('');
    setFormPrimaryImgIdx(p.primary_image_index || 0);
    setFormIsFeatured(p.is_featured);
    setFormIsNew(p.is_new);
    setFormIsOffer(p.is_offer);
    setFormIsAvailable(p.is_available);
    setFormSpecs(p.specifications || []);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim() || !formCategoryId) return;

    setIsSavingProduct(true);
    setFormError('');
    try {
      await dataStore.saveProduct(
        {
          id: editingProduct?.id,
          name_ar: formNameAr,
          sku: formSku,
          price: Number(formPrice),
          old_price: formOldPrice ? Number(formOldPrice) : undefined,
          pricing_mode: formPricingMode,
          category_id: formCategoryId,
          subcategory_id: formSubcategoryId || undefined,
          product_type: formProductType || undefined,
          brand_id: formBrandId || undefined,
          description: formDescription,
          short_description: formShortDesc,
          images: formImages.length > 0 ? formImages : ['https://images.unsplash.com/photo-1584473457406-6240486418e9?w=800&auto=format&fit=crop&q=80'],
          primary_image_index: formPrimaryImgIdx,
          is_featured: formIsFeatured,
          is_new: formIsNew,
          is_offer: formIsOffer,
          is_available: formIsAvailable,
          specifications: formSpecs
        },
        currentUser
      );

      setIsModalOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'تعذر حفظ المنتج. حاول مرة أخرى.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleImageFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;

    setIsUploadingImages(true);
    setImageUploadError('');
    try {
      const uploadedImages: string[] = [];
      for (const file of files) {
        uploadedImages.push(await compressImage(file));
      }
      setFormImages((images) => [...images, ...uploadedImages]);
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : 'تعذر رفع الصورة. حاول مرة أخرى.');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormImages([...formImages, newImageUrl.trim()]);
      setNewImageUrl('');
      setImageUploadError('');
    }
  };

  const handleRemoveImage = (idx: number) => {
    const updated = formImages.filter((_, i) => i !== idx);
    setFormImages(updated);
    if (formPrimaryImgIdx >= updated.length) {
      setFormPrimaryImgIdx(0);
    }
  };

  const handleAddSpec = () => {
    if (newSpecKey.trim() && newSpecVal.trim()) {
      setFormSpecs([...formSpecs, { key: newSpecKey.trim(), value: newSpecVal.trim() }]);
      setNewSpecKey('');
      setNewSpecVal('');
    }
  };

  const handleRemoveSpec = (idx: number) => {
    setFormSpecs(formSpecs.filter((_, i) => i !== idx));
  };

  const runProductAction = async (action: () => Promise<void>) => {
    setOperationError('');
    try {
      await action();
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'تعذر تنفيذ العملية على المنتج.');
    }
  };

  const handleArchive = (id: string) => {
    void runProductAction(() => dataStore.archiveProduct(id, currentUser));
  };

  const handleRestore = (id: string) => {
    void runProductAction(() => dataStore.restoreProduct(id, currentUser));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج نهائياً من قاعدة البيانات؟')) {
      void runProductAction(() => dataStore.deleteProduct(id, currentUser));
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name_ar.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedCategoryObj = categories.find((c) => c.id === formCategoryId);
  const availableSubcategories = (selectedCategoryObj?.subcategories || []).filter((s) => !s.is_archived);
  const selectedSubcategoryObj = availableSubcategories.find((s) => s.id === formSubcategoryId);
  const availableProductTypes = selectedSubcategoryObj?.product_types || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {operationError && (
        <div role="alert" style={{ padding: '12px 16px', borderRadius: '8px', color: '#991B1B', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
          {operationError}
        </div>
      )}
      {/* Top Action Bar */}
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
        {/* Search & Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: 'var(--radius-md)',
              padding: '6px 12px',
              minWidth: '240px'
            }}
          >
            <Search size={16} color="#94A3B8" style={{ marginLeft: '8px' }} />
            <input
              type="text"
              placeholder="بحث بالاسم أو الكود SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.88rem', width: '100%' }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          >
            <option value="all">كافة الأقسام ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_ar}
              </option>
            ))}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748B', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              style={{ accentColor: 'var(--primary-700)' }}
            />
            <span>عرض المؤرشفة</span>
          </label>
        </div>

        {/* Add Product CTA */}
        <button
          onClick={openAddModal}
          className="btn btn-primary"
          style={{ borderRadius: 'var(--radius-md)', fontWeight: 700 }}
        >
          <Plus size={18} />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Products Table */}
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
                <th style={{ padding: '12px 16px' }}>المنتج</th>
                <th style={{ padding: '12px 16px' }}>كود SKU</th>
                <th style={{ padding: '12px 16px' }}>القسم</th>
                <th style={{ padding: '12px 16px' }}>السعر ونظام التسعير</th>
                <th style={{ padding: '12px 16px' }}>التوفر</th>
                <th style={{ padding: '12px 16px' }}>الشارات</th>
                <th style={{ padding: '12px 16px' }}>المشاهدات والطلبات</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    لا توجد منتجات مطابقة للبحث أو القسم المحدد.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const cat = categories.find((c) => c.id === product.category_id);
                  const primaryImg = product.images[product.primary_image_index || 0] || product.images[0];
                  return (
                    <tr
                      key={product.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        opacity: product.is_archived ? 0.6 : 1,
                        backgroundColor: product.is_archived ? '#FFFBEB' : 'transparent'
                      }}
                    >
                      {/* Product Name & Thumb */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={primaryImg}
                            alt=""
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              backgroundColor: '#F1F5F9',
                              border: '1px solid #E2E8F0'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#1E293B', maxWidth: '240px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {product.name_ar}
                            </div>
                            {product.name_en && (
                              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{product.name_en}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: 'monospace', color: '#475569' }}>
                        {product.sku}
                      </td>

                      {/* Category & Subcategory */}
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>
                        <div style={{ fontWeight: 700, color: '#334155' }}>{cat?.name_ar || 'غير مصنف'}</div>
                        {product.subcategory_id && (
                          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                            <span>{cat?.subcategories?.find((s) => s.id === product.subcategory_id)?.name_ar || ''}</span>
                            {product.product_type && (
                              <span style={{ backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--primary-800)', fontWeight: 600 }}>
                                {product.product_type}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Price & Mode */}
                      <td style={{ padding: '12px 16px' }}>
                        {product.pricing_mode === 'on_request' ? (
                          <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>اطلب السعر</span>
                        ) : product.pricing_mode === 'starting_at' ? (
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>يبدأ من </span>
                            <span style={{ fontWeight: 800, color: '#1E293B' }}>{product.price} ج.م</span>
                          </div>
                        ) : (
                          <div>
                            <span style={{ fontWeight: 800, color: '#1E293B' }}>{product.price} ج.م</span>
                            {product.old_price && (
                              <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through', marginRight: '6px' }}>
                                {product.old_price}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Availability */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: product.is_available ? '#ECFDF5' : '#FEF2F2',
                            color: product.is_available ? '#047857' : '#B91C1C'
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: product.is_available ? '#10B981' : '#EF4444' }}></span>
                          {product.is_available ? 'متوفر' : 'غير متوفر'}
                        </span>
                      </td>

                      {/* Badges */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {product.is_featured && (
                            <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: 700 }}>
                              مميز
                            </span>
                          )}
                          {product.is_offer && (
                            <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#FEE2E2', color: '#B91C1C', fontWeight: 700 }}>
                              عرض
                            </span>
                          )}
                          {product.is_new && (
                            <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700 }}>
                              جديد
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Views / Requests */}
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#64748B' }}>
                        <div>👁️ {product.views_count || 0} مشاهدة</div>
                        <div>🛒 {product.request_count || 0} طلب</div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(product)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '6px', color: '#2563EB' }}
                            title="تعديل المنتج"
                          >
                            <Edit2 size={16} />
                          </button>

                          {product.is_archived ? (
                            <button
                              onClick={() => handleRestore(product.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '6px', color: '#059669' }}
                              title="استعادة المنتج"
                            >
                              <RotateCcw size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleArchive(product.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '6px', color: '#D97706' }}
                              title="أرشفة المنتج"
                            >
                              <Archive size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(product.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '6px', color: '#DC2626' }}
                            title="حذف نهائي"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
              animation: 'fadeIn 0.25s ease-out'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                backgroundColor: '#FFFFFF',
                zIndex: 10
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Cairo, sans-serif' }}>
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للكتالوج'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost" style={{ padding: '8px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProduct} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Product Title & SKU */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    اسم المنتج بالعربي <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="مثال: طقم علب ثلاجة محكمة الإغلاق"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    كود SKU <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              {/* Pricing Mode Selector & Prices */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, marginBottom: '10px', color: '#1E293B' }}>
                  نظام التسعير:
                </label>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="pricing_mode"
                      value="fixed"
                      checked={formPricingMode === 'fixed'}
                      onChange={() => setFormPricingMode('fixed')}
                      style={{ accentColor: 'var(--primary-700)' }}
                    />
                    <span>سعر ثابت (Mode A)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="pricing_mode"
                      value="starting_at"
                      checked={formPricingMode === 'starting_at'}
                      onChange={() => setFormPricingMode('starting_at')}
                      style={{ accentColor: 'var(--primary-700)' }}
                    />
                    <span>يبدأ من XXX (Mode B)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="pricing_mode"
                      value="on_request"
                      checked={formPricingMode === 'on_request'}
                      onChange={() => setFormPricingMode('on_request')}
                      style={{ accentColor: 'var(--primary-700)' }}
                    />
                    <span>السعر عند الطلب (Mode C)</span>
                  </label>
                </div>

                {formPricingMode !== 'on_request' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                        السعر الحالي (ج.م)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', color: '#64748B' }}>
                        السعر القديم قبل الخصم (اختياري)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formOldPrice || ''}
                        onChange={(e) => setFormOldPrice(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="مثال: 350"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Category Hierarchy: Main Category -> Subcategory -> Product Type + Brand */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    القسم الرئيسي <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => {
                      setFormCategoryId(e.target.value);
                      setFormSubcategoryId('');
                      setFormProductType('');
                    }}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    التصنيف الفرعي
                  </label>
                  <select
                    value={formSubcategoryId}
                    onChange={(e) => {
                      setFormSubcategoryId(e.target.value);
                      setFormProductType('');
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                  >
                    <option value="">بدون تصنيف فرعي</option>
                    {availableSubcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    نوع المنتج (Product Type)
                  </label>
                  {availableProductTypes.length > 0 ? (
                    <select
                      value={formProductType}
                      onChange={(e) => setFormProductType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                    >
                      <option value="">اختر نوع المنتج (اختياري)</option>
                      {availableProductTypes.map((pt, idx) => (
                        <option key={idx} value={pt}>
                          {pt}
                        </option>
                      ))}
                      {formProductType && !availableProductTypes.includes(formProductType) && (
                        <option value={formProductType}>{formProductType} (مخصص)</option>
                      )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="نوع المنتج (اختياري)..."
                      value={formProductType}
                      onChange={(e) => setFormProductType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    العلامة التجارية (Brand)
                  </label>
                  <select
                    value={formBrandId}
                    onChange={(e) => setFormBrandId(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                  >
                    <option value="">بدون ماركة محددة</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Images Manager */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  صور المنتج (ارفع صورة من جهازك أو أضف رابطاً):
                </label>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="url"
                    placeholder="رابط صورة جديدة (URL)..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="btn btn-outline btn-sm"
                  >
                    <Plus size={16} />
                    <span>إضافة صورة</span>
                  </button>
                  <label
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: isUploadingImages ? 'wait' : 'pointer', opacity: isUploadingImages ? 0.65 : 1 }}
                  >
                    <ImageIcon size={16} />
                    <span>{isUploadingImages ? 'جاري تجهيز الصور...' : 'اختيار من الجهاز'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploadingImages}
                      onChange={handleImageFiles}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <p style={{ margin: '-4px 0 10px', color: '#64748B', fontSize: '0.78rem' }}>
                  يتم ضغط الصور تلقائياً قبل حفظها، بحد أقصى 15 ميجابايت للصورة.
                </p>
                {imageUploadError && (
                  <p role="alert" style={{ margin: '0 0 10px', color: '#B91C1C', fontSize: '0.82rem' }}>
                    {imageUploadError}
                  </p>
                )}

                {/* Images Thumbnails with Primary selector */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {formImages.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: `2px solid ${formPrimaryImgIdx === idx ? 'var(--primary-700)' : '#E2E8F0'}`
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setFormPrimaryImgIdx(idx)}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: formPrimaryImgIdx === idx ? 'var(--primary-700)' : 'rgba(0,0,0,0.6)',
                          color: '#FFFFFF',
                          fontSize: '0.65rem',
                          border: 'none',
                          padding: '2px 0',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        {formPrimaryImgIdx === idx ? 'الرئيسية ⭐' : 'تعيين رئيسية'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description & Short Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  الوصف الكامل للمنتج
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="اكتب مواصفات المنتج ومميزاته بالتفصيل..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              {/* Specifications Key-Value Builder */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
                  المواصفات الفنية (الخامة، الأبعاد، السعة، بلد المنشأ):
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="الخاصية (مثال: الخامة)"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                  <input
                    type="text"
                    placeholder="القيمة (مثال: ألومنيوم فضائي مقاوم للصدأ)"
                    value={newSpecVal}
                    onChange={(e) => setNewSpecVal(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                  <button type="button" onClick={handleAddSpec} className="btn btn-outline btn-sm">
                    إضافة خاصية
                  </button>
                </div>

                {formSpecs.map((spec, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', marginBottom: '4px', fontSize: '0.85rem' }}>
                    <span><strong>{spec.key}:</strong> {spec.value}</span>
                    <button type="button" onClick={() => handleRemoveSpec(idx)} style={{ border: 'none', background: 'none', color: '#DC2626', cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Toggles & Badges */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    style={{ accentColor: 'var(--primary-700)' }}
                  />
                  <span>متوفر بالمخزن وجاهز للطلب</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    style={{ accentColor: 'var(--primary-700)' }}
                  />
                  <span>تمييز في الصفحة الرئيسية (Featured)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formIsOffer}
                    onChange={(e) => setFormIsOffer(e.target.checked)}
                    style={{ accentColor: 'var(--accent-500)' }}
                  />
                  <span>منتج عروض وتخفيضات (Offer)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formIsNew}
                    onChange={(e) => setFormIsNew(e.target.checked)}
                    style={{ accentColor: 'var(--primary-700)' }}
                  />
                  <span>وصل حديثاً (New)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                {formError && (
                  <p role="alert" style={{ margin: '0 auto 0 0', alignSelf: 'center', color: '#B91C1C', fontSize: '0.82rem' }}>
                    {formError}
                  </p>
                )}
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  إلغاء
                </button>
                <button type="submit" disabled={isUploadingImages || isSavingProduct} className="btn btn-primary" style={{ padding: '10px 28px', fontWeight: 800, opacity: isUploadingImages || isSavingProduct ? 0.65 : 1 }}>
                  <span>{isSavingProduct ? 'جاري الحفظ في قاعدة البيانات...' : 'حفظ المنتج'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
