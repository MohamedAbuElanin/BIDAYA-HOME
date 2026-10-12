import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface ProductPreferencesContextType {
  wishlistIds: string[];
  compareIds: string[];
  toggleWishlist: (productId: string) => void;
  toggleCompare: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  isCompared: (productId: string) => boolean;
}

const WISHLIST_KEY = 'bh_wishlist_v1';
const COMPARE_KEY = 'bh_compare_v1';
const ProductPreferencesContext = createContext<ProductPreferencesContextType | undefined>(undefined);

const readIds = (key: string): string[] => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

export const ProductPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState(() => readIds(WISHLIST_KEY));
  const [compareIds, setCompareIds] = useState(() => readIds(COMPARE_KEY));

  useEffect(() => { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds)); }, [wishlistIds]);
  useEffect(() => { localStorage.setItem(COMPARE_KEY, JSON.stringify(compareIds)); }, [compareIds]);

  const toggleWishlist = (productId: string) => setWishlistIds((ids) =>
    ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId]
  );

  // Keep comparison focused and readable on mobile as well as desktop.
  const toggleCompare = (productId: string) => setCompareIds((ids) => {
    if (ids.includes(productId)) return ids.filter((id) => id !== productId);
    return [...ids.slice(-2), productId];
  });

  const value = useMemo(() => ({
    wishlistIds,
    compareIds,
    toggleWishlist,
    toggleCompare,
    isWishlisted: (productId: string) => wishlistIds.includes(productId),
    isCompared: (productId: string) => compareIds.includes(productId),
  }), [wishlistIds, compareIds]);

  return <ProductPreferencesContext.Provider value={value}>{children}</ProductPreferencesContext.Provider>;
};

export const useProductPreferences = () => {
  const context = useContext(ProductPreferencesContext);
  if (!context) throw new Error('useProductPreferences must be used within ProductPreferencesProvider');
  return context;
};
