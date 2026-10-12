import React, { useEffect, useMemo, useState } from 'react';
import { Heart, GitCompare, ArrowLeft } from 'lucide-react';
import { Product } from '../../types';
import { dataStore } from '../../services/dataStore';
import { useLanguage } from '../../context/LanguageContext';
import { ProductCard } from '../common/ProductCard';
import { PageSkeleton } from '../common/PageSkeleton';

interface Props { type: 'wishlist' | 'compare'; onOpenDetails: (product: Product) => void; ids: string[]; onBrowse: () => void; }

export const ProductCollectionPage: React.FC<Props> = ({ type, ids, onOpenDetails, onBrowse }) => {
  const { lang } = useLanguage();
  const [products, setProducts] = useState<Product[] | null>(null);
  useEffect(() => {
    const sync = () => setProducts(dataStore.getProducts());
    sync();
    return dataStore.subscribe(sync);
  }, []);
  const selected = useMemo(() => (products || []).filter((product) => ids.includes(product.id)), [products, ids]);
  const isCompare = type === 'compare';
  const title = isCompare ? (lang === 'ar' ? 'مقارنة المنتجات' : 'Compare products') : (lang === 'ar' ? 'قائمة المفضلة' : 'Wishlist');
  if (!products) return <PageSkeleton cards={4} />;
  return <div style={{ background: 'var(--bg-main)', minHeight: '75vh', padding: '40px 0 64px' }}><div className="container">
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>{isCompare ? <GitCompare color="var(--primary-700)" /> : <Heart color="var(--accent-600)" />}<h1 style={{ fontSize: '2rem', fontWeight: 900 }}>{title}</h1></div>
    {selected.length === 0 ? <div style={{ textAlign: 'center', background: '#fff', padding: '56px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}><p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{lang === 'ar' ? 'لم تضف أي منتجات بعد.' : 'No products have been added yet.'}</p><button className="btn btn-primary" onClick={onBrowse}>{lang === 'ar' ? 'تصفح المنتجات' : 'Browse products'} <ArrowLeft size={17} /></button></div> :
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>{selected.map((product) => <ProductCard key={product.id} product={product} onOpenDetails={onOpenDetails} />)}</div>
        {isCompare && <div style={{ overflowX: 'auto', marginTop: '32px', background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
          <table style={{ width: '100%', minWidth: '580px', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left' }}>
            <thead><tr><th style={{ padding: '16px', background: 'var(--bg-surface-subtle)' }}>{lang === 'ar' ? 'المقارنة' : 'Comparison'}</th>{selected.map((p) => <th key={p.id} style={{ padding: '16px', background: 'var(--bg-surface-subtle)' }}>{lang === 'ar' ? p.name_ar : (p.name_en || p.name_ar)}</th>)}</tr></thead>
            <tbody>
              <tr><th style={{ padding: '14px', borderTop: '1px solid var(--border-default)' }}>{lang === 'ar' ? 'السعر' : 'Price'}</th>{selected.map((p) => <td key={p.id} style={{ padding: '14px', borderTop: '1px solid var(--border-default)' }}>{p.pricing_mode === 'on_request' ? (lang === 'ar' ? 'حسب الطلب' : 'On request') : `${p.price.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')} ${lang === 'ar' ? 'ج.م' : 'EGP'}`}</td>)}</tr>
              <tr><th style={{ padding: '14px', borderTop: '1px solid var(--border-default)' }}>{lang === 'ar' ? 'التوفر' : 'Availability'}</th>{selected.map((p) => <td key={p.id} style={{ padding: '14px', borderTop: '1px solid var(--border-default)' }}>{p.is_available ? (lang === 'ar' ? 'متاح' : 'In stock') : (lang === 'ar' ? 'غير متاح' : 'Out of stock')}</td>)}</tr>
              <tr><th style={{ padding: '14px', borderTop: '1px solid var(--border-default)', verticalAlign: 'top' }}>{lang === 'ar' ? 'المواصفات' : 'Specifications'}</th>{selected.map((p) => <td key={p.id} style={{ padding: '14px', borderTop: '1px solid var(--border-default)', verticalAlign: 'top' }}>{p.specifications.length ? p.specifications.map((s) => <div key={s.key} style={{ marginBottom: '5px' }}><strong>{s.key}: </strong>{s.value}</div>) : '—'}</td>)}</tr>
            </tbody>
          </table>
        </div>}
      </>}
  </div></div>;
};
