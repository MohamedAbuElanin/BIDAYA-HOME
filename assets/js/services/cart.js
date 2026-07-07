/**
 * BIDAYA HOME - Shopping Cart Service
 * Persists cart state in localStorage and syncs badge counts.
 */

import { CART_STORAGE_KEY } from "../config/constants.js";
import { BIDAYA_DATA } from "../data/products.js";
import { getCurrentLang, t } from "./i18n.js";
import { showToast } from "../components/toast.js";

/** @type {{ id: string, qty: number }[]} */
let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadges();
  window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { cart: [...cart] } }));
}

/** @returns {{ id: string, qty: number }[]} */
export function getCart() {
  return [...cart];
}

/**
 * @param {string} productId
 * @param {number} [quantity=1]
 */
export function addToCart(productId, quantity = 1) {
  const qty = parseInt(String(quantity), 10);
  const product = BIDAYA_DATA.products.find((p) => p.id === productId);

  if (product?.stock === "out-of-stock") {
    showToast(
      getCurrentLang() === "ar" ? "هذا المنتج غير متوفر حالياً" : "This product is currently out of stock",
      "danger"
    );
    return;
  }

  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }

  saveCart();
  showToast(t("toast_added"), "success");
}

/** @param {string} productId */
export function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  showToast(t("toast_removed"), "info");
}

/**
 * @param {string} productId
 * @param {number} quantity
 */
export function updateCartQty(productId, quantity) {
  const qty = parseInt(String(quantity), 10);

  if (qty <= 0) {
    removeFromCart(productId);
    return;
  }

  const item = cart.find((i) => i.id === productId);
  if (item) {
    item.qty = qty;
    saveCart();
    showToast(t("toast_updated"), "success");
  }
}

export function clearCart() {
  cart = [];
  saveCart();
}

/** @returns {number} */
export function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

/** @returns {number} */
export function getCartTotal() {
  return cart.reduce((sum, item) => {
    const prod = BIDAYA_DATA.products.find((p) => p.id === item.id);
    return sum + (prod ? prod.price * item.qty : 0);
  }, 0);
}

/** Updates cart count badges in the header. */
export function updateCartBadges() {
  const count = getCartCount();
  document.querySelectorAll(".cart-count-badge").forEach((badge) => {
    badge.textContent = String(count);
    badge.style.display = count > 0 ? "flex" : "none";
  });
}
