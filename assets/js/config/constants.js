/**
 * BIDAYA HOME - Global Application Constants
 * Centralizes configuration values used across the storefront.
 */

/** @type {string} Egyptian WhatsApp number for order confirmations (country code + number) */
export const WHATSAPP_NUMBER = "201000000000";

/** @type {string} LocalStorage key for cart persistence */
export const CART_STORAGE_KEY = "bidaya_cart";

/** @type {string} LocalStorage key for language preference */
export const LANG_STORAGE_KEY = "bidaya_lang";

/** @type {string} LocalStorage key for offline order fallback */
export const ORDERS_STORAGE_KEY = "bidaya_orders";

/** @type {string} Default language (Arabic) */
export const DEFAULT_LANG = "ar";

/** @type {number} Products displayed per catalog page */
export const PRODUCTS_PER_PAGE = 12;

/** @type {number} Hero slider auto-advance interval in milliseconds */
export const HERO_SLIDE_INTERVAL = 5000;
