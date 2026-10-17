import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Home,
  Grid,
  Tag,
  Info,
  Phone,
  Layers,
  ShieldCheck,
  Languages,
  ChevronDown,
  Heart,
  GitCompare
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { dataStore } from '../../services/dataStore';
import { analytics } from '../../services/analytics';
import { Category } from '../../types';
import { useProductPreferences } from '../../context/ProductPreferencesContext';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onSearch?: (query: string) => void;
  onSelectCategory?: (categoryId: string, subcategoryId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate, onSearch, onSelectCategory }) => {
  const { itemsCount, openCart } = useCart();
  const { wishlistIds, compareIds } = useProductPreferences();
  const { lang, isRTL, toggleLanguage, t, tx } = useLanguage();
  const [settings, setSettings] = useState(dataStore.getSettings());
  const [categories, setCategories] = useState<Category[]>(dataStore.getCategories());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [activeDropdownCategory, setActiveDropdownCategory] = useState<string | null>(null);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const scrollDelta = useRef(0);

  useEffect(() => {
    return dataStore.subscribe(() => {
      setSettings(dataStore.getSettings());
      setCategories(dataStore.getCategories());
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (currentScrollY < 80 || isMobileMenuOpen) {
        setIsHeaderHidden(false);
        scrollDelta.current = 0;
      } else if (delta !== 0) {
        if (Math.sign(delta) !== Math.sign(scrollDelta.current)) {
          scrollDelta.current = 0;
        }
        scrollDelta.current += delta;

        if (scrollDelta.current > 28) setIsHeaderHidden(true);
        if (scrollDelta.current < -20) setIsHeaderHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = window.scrollY;
    scrollDelta.current = 0;
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
    if (searchQuery.trim()) analytics.track('SEARCH', { query: searchQuery });
  };

  const navLinks = [
    { key: 'home',       label: tx(t.nav.home),       icon: Home },
    { key: 'catalog',    label: tx(t.nav.products),    icon: Grid },
    { key: 'categories', label: tx(t.nav.categories),  icon: Layers },
    { key: 'offers',     label: tx(t.nav.offers),      icon: Tag, isBadge: true },
    { key: 'about',      label: tx(t.nav.about),       icon: Info },
    { key: 'contact',    label: tx(t.nav.contact),     icon: Phone },
  ];

  const storeName = lang === 'ar'
    ? (settings.store_name_ar || 'بداية هوم')
    : (settings.store_name_en || 'Bidaya Home');

  const slogan = lang === 'ar'
    ? (settings.slogan_ar || tx(t.general.slogan))
    : tx(t.general.slogan);

  return (
    <header className={`glass-nav${isHeaderHidden && !isMobileMenuOpen ? ' is-hidden-mobile' : ''}`} style={{ position: 'sticky', top: 0, zIndex: 800 }}>
      {/* Main Navbar Bar */}
      <div className="container navbar-main-container" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

          {/* Logo & Slogan */}
          <div
            className="navbar-brand"
            onClick={() => onNavigate('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <img
              className="navbar-logo"
              src="/Logo/Icon - Mark.svg"
              alt={lang === 'ar' ? 'شعار بداية هوم' : 'Bidaya Home logo'}
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'contain',
                flexShrink: 0
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="navbar-brand-name" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-900)', fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'var(--font-latin)', letterSpacing: '0' }}>
                  {storeName}
                </span>
              </div>
              <div className="navbar-slogan" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {slogan}
              </div>
            </div>
          </div>

          {/* Desktop Search */}
          {currentRoute === 'catalog' && <form
            onSubmit={handleSearchSubmit}
            style={{ flex: '1', maxWidth: '440px', display: 'none', position: 'relative' }}
            className="desktop-search-form"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isSearchFocused ? '#FFFFFF' : 'var(--bg-surface-subtle)',
                border: `1.5px solid ${isSearchFocused ? 'var(--primary-600)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                transition: 'all 0.2s ease',
                boxShadow: isSearchFocused ? '0 0 0 4px rgba(41, 119, 73, 0.12)' : 'none',
                flexDirection: isRTL ? 'row' : 'row-reverse'
              }}
            >
              <Search size={18} color="var(--text-muted)" style={{ [isRTL ? 'marginLeft' : 'marginRight']: '8px' }} />
              <input
                type="text"
                placeholder={tx(t.nav.searchPlaceholder)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  direction: isRTL ? 'rtl' : 'ltr',
                  textAlign: isRTL ? 'right' : 'left'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); if (onSearch) onSearch(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>}

          {/* Actions */}
          <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1vw, 10px)' }}>
            <button
              type="button"
              onClick={() => onNavigate('wishlist')}
              className="btn btn-ghost"
              data-navbar-action
              title={lang === 'ar' ? 'المفضلة' : 'Wishlist'}
              aria-label={lang === 'ar' ? 'المفضلة' : 'Wishlist'}
              style={{ position: 'relative', padding: '8px' }}
            >
              <Heart size={20} fill={wishlistIds.length ? 'currentColor' : 'none'} />
              {wishlistIds.length > 0 && <span style={{ position: 'absolute', top: '-4px', insetInlineEnd: '-4px', minWidth: '17px', height: '17px', display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'var(--accent-500)', color: '#fff', fontSize: '0.65rem', fontWeight: 800 }}>{wishlistIds.length}</span>}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('compare')}
              className="btn btn-ghost"
              data-navbar-action
              title={lang === 'ar' ? 'مقارنة المنتجات' : 'Compare products'}
              aria-label={lang === 'ar' ? 'مقارنة المنتجات' : 'Compare products'}
              style={{ position: 'relative', padding: '8px' }}
            >
              <GitCompare size={20} />
              {compareIds.length > 0 && <span style={{ position: 'absolute', top: '-4px', insetInlineEnd: '-4px', minWidth: '17px', height: '17px', display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'var(--primary-700)', color: '#fff', fontSize: '0.65rem', fontWeight: 800 }}>{compareIds.length}</span>}
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className="btn btn-outline"
              data-navbar-language
              title={tx(t.general.switchToEn)}
              aria-label={tx(t.general.switchToEn)}
              style={{
                padding: '7px clamp(6px, 2vw, 10px)',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                fontFamily: lang === 'ar' ? 'var(--font-latin)' : 'var(--font-arabic)'
              }}
            >
              <Languages size={16} />
              <span className="navbar-language-label">{tx(t.general.switchToEn)}</span>
            </button>
            <button
              onClick={openCart}
              className="btn btn-outline"
              data-navbar-action
              style={{
                position: 'relative',
                padding: '8px clamp(8px, 2vw, 16px)',
                borderRadius: 'var(--radius-full)',
                borderColor: itemsCount > 0 ? 'var(--primary-600)' : 'var(--border-default)',
                backgroundColor: itemsCount > 0 ? 'var(--primary-50)' : 'transparent',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title={tx(t.nav.cart)}
            >
              <ShoppingBag size={20} color={itemsCount > 0 ? 'var(--primary-700)' : 'var(--text-main)'} />
              <span style={{ display: 'none' }} className="desktop-cart-label">
                {tx(t.nav.cart)}
              </span>
              {itemsCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--accent-500)',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}
                >
                  {itemsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsHeaderHidden(false);
              }}
              className="btn btn-ghost"
              data-navbar-menu
              style={{ padding: '8px' }}
              aria-label={tx(t.nav.home)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links Bar */}
        <nav
          style={{
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'none',
            justifyContent: 'center',
            gap: '8px'
          }}
          className="desktop-nav-bar"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentRoute === link.key;

            if (link.key === 'categories') {
              const currentHoveredCat = categories.find(c => c.id === (activeDropdownCategory || categories[0]?.id));
              return (
                <div
                  key={link.key}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
                  onMouseLeave={() => {
                    setIsCategoriesDropdownOpen(false);
                    setActiveDropdownCategory(null);
                  }}
                >
                  <button
                    onClick={() => onNavigate(link.key)}
                    style={{
                      background: isActive ? 'var(--primary-700)' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'var(--text-main)',
                      border: 'none',
                      padding: '7px 18px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.92rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
                        e.currentTarget.style.color = 'var(--primary-700)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-main)';
                      }
                    }}
                  >
                    <Icon size={16} />
                    <span>{link.label}</span>
                    <ChevronDown size={14} style={{ opacity: 0.7 }} />
                  </button>

                  {/* Mega Menu Category Dropdown */}
                  {isCategoriesDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        [isRTL ? 'right' : 'left']: '-80px',
                        width: '560px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 'var(--radius-xl)',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--border-default)',
                        padding: '16px',
                        display: 'grid',
                        gridTemplateColumns: '240px 1fr',
                        gap: '16px',
                        zIndex: 999,
                        marginTop: '4px',
                        textAlign: isRTL ? 'right' : 'left'
                      }}
                    >
                      {/* Left: 10 Main Categories */}
                      <div
                        style={{
                          borderInlineEnd: '1px solid var(--border-subtle)',
                          paddingInlineEnd: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          maxHeight: '380px',
                          overflowY: 'auto'
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                          {lang === 'ar' ? 'الأقسام الرئيسية' : 'Main Categories'}
                        </div>
                        {categories.map((cat) => {
                          const isHovered = (activeDropdownCategory || categories[0]?.id) === cat.id;
                          return (
                            <div
                              key={cat.id}
                              onMouseEnter={() => setActiveDropdownCategory(cat.id)}
                              onClick={() => {
                                if (onSelectCategory) {
                                  onSelectCategory(cat.id);
                                } else {
                                  onNavigate('catalog');
                                }
                                setIsCategoriesDropdownOpen(false);
                              }}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.84rem',
                                fontWeight: isHovered ? 700 : 500,
                                color: isHovered ? 'var(--primary-800)' : 'var(--text-main)',
                                backgroundColor: isHovered ? 'var(--primary-50)' : 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <span>{lang === 'en' ? (cat.name_en || cat.name_ar) : cat.name_ar}</span>
                              <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>›</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right: Subcategories of Hovered Category */}
                      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '380px', overflowY: 'auto' }}>
                        {currentHoveredCat && (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                                {lang === 'en' ? (currentHoveredCat.name_en || currentHoveredCat.name_ar) : currentHoveredCat.name_ar}
                              </span>
                              <button
                                onClick={() => {
                                  if (onSelectCategory) {
                                    onSelectCategory(currentHoveredCat.id);
                                  } else {
                                    onNavigate('catalog');
                                  }
                                  setIsCategoriesDropdownOpen(false);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--primary-700)',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                {lang === 'ar' ? 'عرض الكل' : 'View all'}
                              </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {(currentHoveredCat.subcategories || []).filter(s => !s.is_archived).map((sub) => (
                                <div
                                  key={sub.id}
                                  onClick={() => {
                                    if (onSelectCategory) {
                                      onSelectCategory(currentHoveredCat.id, sub.id);
                                    } else {
                                      onNavigate('catalog');
                                    }
                                    setIsCategoriesDropdownOpen(false);
                                  }}
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.82rem',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
                                    e.currentTarget.style.color = 'var(--primary-700)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                  }}
                                >
                                  {lang === 'en' ? (sub.name_en || sub.name_ar) : sub.name_ar}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={link.key}
                onClick={() => onNavigate(link.key)}
                style={{
                  background: isActive ? 'var(--primary-700)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-main)',
                  border: 'none',
                  padding: '7px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
                    e.currentTarget.style.color = 'var(--primary-700)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
              >
                <Icon size={16} />
                <span>{link.label}</span>
                {link.isBadge && (
                  <span
                    style={{
                      backgroundColor: isActive ? '#FFFFFF' : 'var(--accent-500)',
                      color: isActive ? 'var(--accent-700)' : '#FFFFFF',
                      fontSize: '0.65rem',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontWeight: 800
                    }}
                  >
                    {tx(t.nav.discounts)}
                  </span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            title={tx(t.topbar.admin)}
            style={{
              background: 'transparent',
              color: 'var(--text-main)',
              border: 'none',
              padding: '7px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.92rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
              e.currentTarget.style.color = 'var(--primary-700)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-main)';
            }}
          >
            <ShieldCheck size={16} />
            <span>{tx(t.topbar.admin)}</span>
          </button>
        </nav>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '2px solid var(--border-default)',
            padding: '16px',
            boxShadow: 'var(--shadow-lg)'
          }}
          className="animate-fade-in"
        >
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1.5px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                flexDirection: isRTL ? 'row' : 'row-reverse'
              }}
            >
              <Search size={18} color="var(--text-muted)" style={{ [isRTL ? 'marginLeft' : 'marginRight']: '8px' }} />
              <input
                type="text"
                placeholder={tx(t.nav.searchPlaceholder)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.9rem',
                  direction: isRTL ? 'rtl' : 'ltr'
                }}
              />
            </div>
          </form>

          {/* Links list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentRoute === link.key;

              if (link.key === 'categories') {
                return (
                  <div key={link.key} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                        color: isActive ? 'var(--primary-700)' : 'var(--text-main)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={20} color={isActive ? 'var(--primary-700)' : 'var(--text-secondary)'} />
                        <span>{link.label}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        style={{
                          transform: isMobileCategoriesOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </div>

                    {isMobileCategoriesOpen && (
                      <div style={{ paddingInlineStart: '20px', paddingTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '280px', overflowY: 'auto' }}>
                        <div
                          onClick={() => {
                            onNavigate('categories');
                            setIsMobileMenuOpen(false);
                          }}
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--primary-700)',
                            cursor: 'pointer'
                          }}
                        >
                          {lang === 'ar' ? 'عرض كل الأقسام' : 'View all categories'}
                        </div>
                        {categories.map((cat) => (
                          <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div
                              onClick={() => {
                                if (onSelectCategory) {
                                  onSelectCategory(cat.id);
                                } else {
                                  onNavigate('catalog');
                                }
                                setIsMobileMenuOpen(false);
                              }}
                              style={{
                                padding: '6px 10px',
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                backgroundColor: 'var(--bg-surface-subtle)',
                                borderRadius: '4px'
                              }}
                            >
                              {lang === 'en' ? (cat.name_en || cat.name_ar) : cat.name_ar}
                            </div>
                            {(cat.subcategories || []).filter(s => !s.is_archived).slice(0, 4).map((sub) => (
                              <div
                                key={sub.id}
                                onClick={() => {
                                  if (onSelectCategory) {
                                    onSelectCategory(cat.id, sub.id);
                                  } else {
                                    onNavigate('catalog');
                                  }
                                  setIsMobileMenuOpen(false);
                                }}
                                style={{
                                  padding: '4px 10px 4px 16px',
                                  fontSize: '0.78rem',
                                  color: 'var(--text-secondary)',
                                  cursor: 'pointer'
                                }}
                              >
                                • {lang === 'en' ? (sub.name_en || sub.name_ar) : sub.name_ar}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={link.key}
                  onClick={() => {
                    onNavigate(link.key);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                    color: isActive ? 'var(--primary-700)' : 'var(--text-main)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    textAlign: isRTL ? 'right' : 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={20} color={isActive ? 'var(--primary-700)' : 'var(--text-secondary)'} />
                    <span>{link.label}</span>
                  </div>
                  {link.isBadge && (
                    <span className="badge badge-offer">{tx(t.nav.discounts)}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => {
                onNavigate('admin');
                setIsMobileMenuOpen(false);
              }}
              className="btn btn-outline btn-sm"
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <ShieldCheck size={16} />
              <span>{tx(t.nav.adminPanel)}</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-search-form { display: block !important; }
          .desktop-nav-bar { display: flex !important; }
          .desktop-cart-label { display: inline !important; }
        }

        @media (max-width: 859px) {
          .glass-nav { transition: transform 320ms ease; }
          .glass-nav.is-hidden-mobile { transform: translateY(-100%); }
          .navbar-main-container { padding: 7px 10px !important; }
          .navbar-brand { gap: 8px !important; }
          .navbar-logo { width: 36px !important; height: 36px !important; }
          .navbar-brand-name { font-size: 1.05rem !important; }
          .navbar-slogan { font-size: 0.6rem !important; }
          .navbar-actions { gap: 2px !important; }
          [data-navbar-action], [data-navbar-menu] { padding: 5px !important; }
          [data-navbar-action] svg, [data-navbar-menu] svg { width: 18px; height: 18px; }
          [data-navbar-language] { padding: 5px 6px !important; font-size: 0.7rem !important; }
          [data-navbar-language] svg { width: 15px; height: 15px; }
        }
      `}</style>
    </header>
  );
};
