import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { analytics } from '../services/analytics';
import { useLanguage } from './LanguageContext';

interface CartContextType {
  items: CartItem[];
  itemsCount: number;
  totalAmount: number;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CART_STORAGE_KEY = 'bh_cart_items_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang } = useLanguage();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [items]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingIdx = prevItems.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        const primaryImage = product.images[product.primary_image_index || 0] || product.images[0] || '';
        return [...prevItems, { product, quantity, selected_image: primaryImage }];
      }
    });

    analytics.track('ADD_TO_CART', {
      product_id: product.id,
      product_name: product.name_ar,
      sku: product.sku,
      price: product.price,
      quantity
    });

    const productName = lang === 'en' ? (product.name_en || product.name_ar) : product.name_ar;
    showToast(lang === 'en'
      ? `Added "${productName}" to your order ✨`
      : `تمت إضافة "${productName}" إلى سلة الطلبات ✨`);
  };

  const removeFromCart = (productId: string) => {
    const itemToRemove = items.find((i) => i.product.id === productId);
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));

    if (itemToRemove) {
      analytics.track('REMOVE_FROM_CART', {
        product_id: productId,
        product_name: itemToRemove.product.name_ar
      });
      showToast(lang === 'en' ? 'Item removed from your order' : 'تم حذف المنتج من السلة');
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    analytics.track('BEGIN_CHECKOUT', {
      items_count: items.reduce((sum, item) => sum + item.quantity, 0),
      total_estimate: totalAmount
    });
  };

  const closeCheckout = () => setIsCheckoutOpen(false);

  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalAmount = items.reduce((sum, item) => {
    if (item.product.pricing_mode === 'on_request') return sum;
    return sum + (Number(item.product.price) || 0) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemsCount,
        totalAmount,
        isCartOpen,
        isCheckoutOpen,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toastMessage,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
