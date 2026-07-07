/**
 * BIDAYA HOME - Application Entry Point
 * Bootstraps shared services, layout, and exposes the global API.
 */

import { WHATSAPP_NUMBER } from "./config/constants.js";
import { TRANSLATIONS } from "./config/translations.js";
import { BIDAYA_DATA } from "./data/products.js";
import { initI18n, getCurrentLang, setLanguage, toggleLanguage } from "./services/i18n.js";
import * as cartService from "./services/cart.js";
import { showToast } from "./components/toast.js";
import { renderLayout } from "./core/layout.js";

/**
 * Initializes the global BIDAYA application.
 */
export function initApp() {
  window.BIDAYA_DATA = BIDAYA_DATA;

  window.BIDAYA_APP = {
    currentLang: getCurrentLang,
    translations: TRANSLATIONS,
    setLanguage,
    toggleLanguage,
    showToast,
    whatsappNumber: WHATSAPP_NUMBER,
    cart: {
      get: cartService.getCart,
      add: cartService.addToCart,
      remove: cartService.removeFromCart,
      updateQty: cartService.updateCartQty,
      clear: cartService.clearCart,
      count: cartService.getCartCount,
      total: cartService.getCartTotal
    }
  };

  renderLayout();
  initI18n();

  window.addEventListener("langChanged", () => {
    renderLayout();
    initI18n();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  initApp();

  const page = document.body.dataset.page;
  if (!page) return;

  try {
    const module = await import(`./pages/${page}.js`);
    module.initPage?.();
  } catch (error) {
    console.error(`Failed to load page module: ${page}`, error);
  }
});
