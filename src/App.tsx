import React, { useState, useEffect } from 'react';
import './index.css';

// Context
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { CheckoutModal } from './components/common/CheckoutModal';
import { Toast } from './components/common/Toast';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { ProductModal } from './components/common/ProductModal';

// Customer Pages
import { HeroSection } from './components/customer/HeroSection';
import { CategorySection } from './components/customer/CategorySection';
import { FeaturedProductsSection } from './components/customer/FeaturedProductsSection';
import { WhyBidayaSection } from './components/customer/WhyBidayaSection';
import { CatalogPage } from './components/customer/CatalogPage';
import { CategoriesPage } from './components/customer/CategoriesPage';
import { OffersPage } from './components/customer/OffersPage';
import { AboutPage } from './components/customer/AboutPage';
import { ContactPage } from './components/customer/ContactPage';

// Admin Components
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

// Services & Types
import { analytics } from './services/analytics';
import type { AdminUser, Product } from './types';

type CustomerRoute = 'home' | 'catalog' | 'categories' | 'offers' | 'about' | 'contact';
type AdminTab = 'dashboard' | 'products' | 'categories' | 'brands' | 'orders' | 'customers' | 'analytics' | 'users' | 'logs' | 'settings';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<CustomerRoute>('home');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Initialize services
  useEffect(() => {
    analytics.track('PAGE_VIEW', { page: 'home' });
  }, []);

  // Track page changes & scroll to top
  useEffect(() => {
    if (!isAdminMode) {
      analytics.track('PAGE_VIEW', { page: currentRoute });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentRoute, isAdminMode]);

  const handleNavigate = (route: string) => {
    if (route === 'admin') {
      setIsAdminMode(true);
      return;
    }
    setCurrentRoute(route as CustomerRoute);
    setSelectedCategoryId(undefined);
    setSelectedSubcategoryId(undefined);
  };

  const handleSelectCategory = (categoryId: string, subcategoryId?: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(subcategoryId);
    setCurrentRoute('catalog');
  };

  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    analytics.track('PRODUCT_VIEW', { product_id: product.id });
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null);
  };

  // ─── ADMIN MODE ───────────────────────────────────────────────────────────
  if (isAdminMode) {
    if (!adminUser) {
      return (
        <AdminAuth
          onLoginSuccess={(user) => setAdminUser(user)}
          onBackToStore={() => {
            setIsAdminMode(false);
            setCurrentRoute('home');
          }}
        />
      );
    }

    const renderAdminContent = () => {
      switch (adminTab) {
        case 'dashboard':   return <DashboardOverview onNavigateTab={(tab) => setAdminTab(tab as AdminTab)} />;
        case 'products':    return <ProductManagement currentUser={adminUser} />;
        case 'categories':  return <CategoryManagement currentUser={adminUser} />;
        case 'brands':      return <BrandManagement currentUser={adminUser} />;
        case 'orders':      return <OrderManagement currentUser={adminUser} />;
        case 'customers':   return <CustomerManagement />;
        case 'analytics':   return <AnalyticsDashboard />;
        case 'users':       return <UsersManagement currentUser={adminUser} />;
        case 'logs':        return <ActivityLogs />;
        case 'settings':    return <SettingsManagement currentUser={adminUser} />;
        default:            return <DashboardOverview onNavigateTab={(tab) => setAdminTab(tab as AdminTab)} />;
      }
    };

    return (
      <AdminLayout
        currentUser={adminUser}
        activeTab={adminTab}
        onSelectTab={(tab) => setAdminTab(tab as AdminTab)}
        onLogout={() => {
          setAdminUser(null);
          setIsAdminMode(false);
          setCurrentRoute('home');
        }}
        onReturnToStore={() => {
          setIsAdminMode(false);
          setCurrentRoute('home');
        }}
      >
        {renderAdminContent()}
      </AdminLayout>
    );
  }

  // ─── CUSTOMER MODE ────────────────────────────────────────────────────────
  const renderCustomerPage = () => {
    switch (currentRoute) {
      case 'catalog':
        return (
          <CatalogPage
            initialCategoryId={selectedCategoryId}
            initialSubcategoryId={selectedSubcategoryId}
            onOpenDetails={handleOpenDetails}
            onSelectCategory={handleSelectCategory}
          />
        );
      case 'categories':
        return (
          <CategoriesPage
            onSelectCategory={handleSelectCategory}
          />
        );
      case 'offers':
        return (
          <OffersPage
            onOpenDetails={handleOpenDetails}
            onNavigateToProducts={() => setCurrentRoute('catalog')}
          />
        );
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'home':
      default:
        return (
          <>
            <HeroSection
              onNavigate={handleNavigate}
              onSelectCategory={handleSelectCategory}
            />
            <CategorySection
              onSelectCategory={handleSelectCategory}
              onViewAllCategories={() => setCurrentRoute('categories')}
            />
            <FeaturedProductsSection
              onOpenDetails={handleOpenDetails}
              onViewAllProducts={() => setCurrentRoute('catalog')}
            />
            <WhyBidayaSection />
          </>
        );
    }
  };

  return (
    <LanguageProvider>
      <CartProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
        <Navbar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onSelectCategory={handleSelectCategory}
        />

        <main style={{ flex: 1 }}>
          {renderCustomerPage()}
        </main>

        <Footer
          onNavigate={handleNavigate}
          onSelectCategory={handleSelectCategory}
        />

        {/* Overlays */}
        <CartDrawer />
        <CheckoutModal />
        <Toast />
        <WhatsAppFloatingButton />

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={handleCloseDetails}
            onSelectProduct={handleOpenDetails}
          />
        )}
      </div>
      </CartProvider>
    </LanguageProvider>
  );
};

export default App;
