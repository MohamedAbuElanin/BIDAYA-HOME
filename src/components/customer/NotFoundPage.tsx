import React from 'react';
import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const NotFoundPage: React.FC = () => {
  const { lang } = useLanguage();
  return <div style={{ minHeight: '62vh', display: 'grid', placeItems: 'center', padding: '40px 16px', textAlign: 'center' }}><div>
    <SearchX size={56} color="var(--accent-600)" style={{ marginBottom: '16px' }} />
    <h1 style={{ fontSize: '2.3rem', marginBottom: '10px' }}>404</h1>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '22px' }}>{lang === 'ar' ? 'الصفحة التي تبحث عنها غير موجودة.' : 'The page you requested could not be found.'}</p>
    <Link className="btn btn-primary" to="/"><Home size={17} />{lang === 'ar' ? 'العودة للرئيسية' : 'Back home'}</Link>
  </div></div>;
};
