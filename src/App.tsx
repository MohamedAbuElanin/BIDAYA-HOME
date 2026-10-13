import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './index.css';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProductPreferencesProvider, useProductPreferences } from './context/ProductPreferencesContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { CheckoutModal } from './components/common/CheckoutModal';
import { Toast } from './components/common/Toast';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { ProductModal } from './components/common/ProductModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { HeroSection } from './components/customer/HeroSection';
import { CategorySection } from './components/customer/CategorySection';
import { FeaturedProductsSection } from './components/customer/FeaturedProductsSection';
import { WhyBidayaSection } from './components/customer/WhyBidayaSection';
import { CatalogPage } from './components/customer/CatalogPage';
import { CategoriesPage } from './components/customer/CategoriesPage';
import { OffersPage } from './components/customer/OffersPage';
import { AboutPage } from './components/customer/AboutPage';
import { ContactPage } from './components/customer/ContactPage';
import { NotFoundPage } from './components/customer/NotFoundPage';
import { ProductCollectionPage } from './components/customer/ProductCollectionPage';
import { AdminAuth } from './components/admin/AdminAuth';
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { ProductManagement } from './components/admin/ProductManagement';
import { CategoryManagement } from './components/admin/CategoryManagement';
import { BrandManagement } from './components/admin/BrandManagement';
import { OrderManagement } from './components/admin/OrderManagement';
import { CustomerManagement } from './components/admin/CustomerManagement';
import { AnalyticsDashboard } from './components/admin/AnalyticsDashboard';
import { UsersManagement } from './components/admin/UsersManagement';
import { ActivityLogs } from './components/admin/ActivityLogs';
import { SettingsManagement } from './components/admin/SettingsManagement';
import { analytics } from './services/analytics';
import { getSupabaseClient } from './lib/supabase';
import type { AdminUser, Product } from './types';

type AdminTab = 'dashboard' | 'products' | 'categories' | 'brands' | 'orders' | 'customers' | 'analytics' | 'users' | 'logs' | 'settings';

const paths: Record<string, string> = { home: '/', catalog: '/catalog', categories: '/categories', offers: '/offers', about: '/about', contact: '/contact', wishlist: '/wishlist', compare: '/compare', admin: '/admin' };

const Storefront: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wishlistIds, compareIds } = useProductPreferences();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const routeName = Object.entries(paths).find(([, path]) => path === location.pathname)?.[0] || 'not-found';
  const params = new URLSearchParams(location.search);

  useEffect(() => {
    if (!location.pathname.startsWith('/admin')) analytics.track('PAGE_VIEW', { page: routeName });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, routeName]);

  const go = (route: string) => navigate(paths[route] || '/not-found');
  const selectCategory = (categoryId: string, subcategoryId?: string) => {
    const next = new URLSearchParams({ category: categoryId });
    if (subcategoryId) next.set('subcategory', subcategoryId);
    navigate(`/catalog?${next.toString()}`);
  };
  const openProduct = (product: Product) => { setSelectedProduct(product); analytics.track('PRODUCT_VIEW', { product_id: product.id }); };

  const adminContent = () => {
    if (!adminUser) return <AdminAuth onLoginSuccess={setAdminUser} onBackToStore={() => go('home')} />;
    const content: Record<AdminTab, React.ReactNode> = {
      dashboard: <DashboardOverview onNavigateTab={(tab) => setAdminTab(tab as AdminTab)} />, products: <ProductManagement currentUser={adminUser} />,
      categories: <CategoryManagement currentUser={adminUser} />, brands: <BrandManagement currentUser={adminUser} />,
      orders: <OrderManagement currentUser={adminUser} />, customers: <CustomerManagement />, analytics: <AnalyticsDashboard />,
      users: <UsersManagement currentUser={adminUser} />, logs: <ActivityLogs />, settings: <SettingsManagement currentUser={adminUser} />,
    };
    return <AdminLayout currentUser={adminUser} activeTab={adminTab} onSelectTab={(tab) => setAdminTab(tab as AdminTab)} onLogout={() => { void getSupabaseClient()?.auth.signOut(); setAdminUser(null); go('home'); }} onReturnToStore={() => go('home')}>{content[adminTab]}</AdminLayout>;
  };

  if (location.pathname === '/admin') return <ErrorBoundary key="admin">{adminContent()}</ErrorBoundary>;

  return <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
    <Navbar currentRoute={routeName} onNavigate={go} onSearch={(query) => navigate(`/catalog${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)} onSelectCategory={selectCategory} />
    <main style={{ flex: 1 }}>
      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route path="/" element={<><HeroSection onNavigate={go} onSelectCategory={selectCategory} /><CategorySection onSelectCategory={selectCategory} onViewAllCategories={() => go('categories')} /><FeaturedProductsSection onOpenDetails={openProduct} onViewAllProducts={() => go('catalog')} /><WhyBidayaSection /></>} />
          <Route path="/catalog" element={<CatalogPage initialCategoryId={params.get('category') || undefined} initialSubcategoryId={params.get('subcategory') || undefined} initialSearchQuery={params.get('q') || ''} onOpenDetails={openProduct} onSelectCategory={selectCategory} />} />
          <Route path="/categories" element={<CategoriesPage onSelectCategory={selectCategory} />} />
          <Route path="/offers" element={<OffersPage onOpenDetails={openProduct} onNavigateToProducts={() => go('catalog')} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/wishlist" element={<ProductCollectionPage type="wishlist" ids={wishlistIds} onOpenDetails={openProduct} onBrowse={() => go('catalog')} />} />
          <Route path="/compare" element={<ProductCollectionPage type="compare" ids={compareIds} onOpenDetails={openProduct} onBrowse={() => go('catalog')} />} />
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </main>
    <Footer onNavigate={go} onSelectCategory={selectCategory} />
    <CartDrawer /><CheckoutModal /><Toast /><WhatsAppFloatingButton />
    {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onSelectProduct={openProduct} />}
  </div>;
};

const App: React.FC = () => <LanguageProvider><CartProvider><ProductPreferencesProvider><Storefront /></ProductPreferencesProvider></CartProvider></LanguageProvider>;
export default App;
