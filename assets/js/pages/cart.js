/**
 * BIDAYA HOME - Shopping Cart Page Controller
 */

import { BIDAYA_DATA } from "../data/products.js";
import { getCurrentLang, getTranslations } from "../services/i18n.js";
import { getCart, getCartTotal, updateCartQty, removeFromCart } from "../services/cart.js";
import { renderEmptyState } from "../components/empty-state.js";

/** Initializes and renders the cart page. */
export function initPage() {
  const container = document.getElementById("cart-content-wrapper");
  if (container) {
    container.addEventListener("click", handleCartClick);
  }

  renderCartPage();
  window.addEventListener("cartUpdated", renderCartPage);
  window.addEventListener("langChanged", () => window.location.reload());
}

function renderCartPage() {
  const container = document.getElementById("cart-content-wrapper");
  if (!container) return;

  const lang = getCurrentLang();
  const t = getTranslations();
  const cartItems = getCart();
  const { products } = BIDAYA_DATA;

  if (cartItems.length === 0) {
    container.style.display = "block";
    container.innerHTML = renderEmptyState({
      icon: "fa-shopping-bag",
      title: t.cart_empty,
      description: lang === "ar" ? "تصفح أقسامنا وأضف منتجات لعربتك." : "Browse our categories and add items.",
      actionHtml: `<a href="products.html" class="btn btn-primary">${t.cart_continue}</a>`
    });
    return;
  }

  container.style.display = "grid";
  const subtotal = getCartTotal();
  const shippingText = lang === "ar" ? "يُحدد عند الشحن" : "Calculated at checkout";

  const rowsHTML = cartItems.map((item) => {
    const prod = products.find((p) => p.id === item.id);
    if (!prod) return "";
    const name = lang === "ar" ? prod.nameAr : prod.nameEn;

    return `
      <tr class="cart-row">
        <td>
          <div class="cart-product-info">
            <div class="cart-product-img"><img src="${prod.image}" alt="${name}"></div>
            <div>
              <a href="products-details.html?id=${prod.id}" class="cart-product-name">${name}</a>
              <span class="cart-product-cat">${prod.category}</span>
            </div>
          </div>
        </td>
        <td class="cart-price-cell">${prod.price} EGP</td>
        <td>
          <div class="cart-qty-selector">
            <button type="button" class="cart-qty-btn" data-action="decrease" data-id="${prod.id}"><i class="fa-solid fa-minus"></i></button>
            <input type="text" class="cart-qty-input" value="${item.qty}" readonly>
            <button type="button" class="cart-qty-btn" data-action="increase" data-id="${prod.id}"><i class="fa-solid fa-plus"></i></button>
          </div>
        </td>
        <td class="cart-price-cell" style="color:var(--primary);">${prod.price * item.qty} EGP</td>
        <td style="text-align:center;">
          <button type="button" class="cart-remove-btn" data-id="${prod.id}" title="${t.cart_remove}"><i class="fa-solid fa-trash-can"></i></button>
        </td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <div class="cart-items-section">
      <table class="cart-table">
        <thead>
          <tr>
            <th style="width:45%;">${lang === "ar" ? "المنتج" : "Product"}</th>
            <th>${lang === "ar" ? "السعر" : "Price"}</th>
            <th>${lang === "ar" ? "الكمية" : "Qty"}</th>
            <th>${lang === "ar" ? "المجموع" : "Total"}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rowsHTML}</tbody>
      </table>
    </div>
    <div class="summary-panel">
      <h3 class="summary-title">${t.checkout_summary}</h3>
      <div class="summary-row"><span>${t.cart_subtotal}</span><span style="font-weight:700;">${subtotal} EGP</span></div>
      <div class="summary-row"><span>${t.cart_shipping}</span><span style="color:var(--text-muted);font-size:13px;">${shippingText}</span></div>
      <div class="summary-row total"><span>${t.cart_total}</span><span>${subtotal} EGP</span></div>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:30px;">
        <a href="checkout.html" class="btn btn-primary">${t.cart_checkout}</a>
        <a href="products.html" class="btn btn-outline">${t.cart_continue}</a>
      </div>
    </div>
  `;
}

function handleCartClick(e) {
  const btn = e.target.closest("[data-id]");
  if (!btn) return;

  const id = btn.dataset.id;
  const item = getCart().find((i) => i.id === id);
  if (!item) return;

  if (btn.dataset.action === "decrease") updateCartQty(id, item.qty - 1);
  else if (btn.dataset.action === "increase") updateCartQty(id, item.qty + 1);
  else if (btn.classList.contains("cart-remove-btn")) removeFromCart(id);
}
