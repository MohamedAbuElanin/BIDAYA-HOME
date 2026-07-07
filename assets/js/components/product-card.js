/**
 * BIDAYA HOME - Product Card Component
 * Reusable card for product listings across the storefront.
 */

import { getLocalizedName } from "../utils/format.js";
import { buildPath } from "../utils/path.js";

/**
 * @param {object} product
 * @param {string} lang
 * @param {{ animate?: boolean }} [options]
 * @returns {string}
 */
export function renderProductCard(product, lang, options = {}) {
  const name = getLocalizedName(product, lang);
  const viewText = lang === "ar" ? "التفاصيل" : "Details";
  const isOutOfStock = product.stock === "out-of-stock";
  const discountLabel = lang === "ar" ? "خصم" : "OFF";
  const soldOutLabel = lang === "ar" ? "نفد" : "SOLD OUT";
  const animateClass = options.animate ? " slide-up" : "";

  const badgeHtml = product.discount
    ? `<div class="badge-discount">${product.discount}% ${discountLabel}</div>`
    : "";

  const outBadgeHtml = isOutOfStock
    ? `<div class="badge-out">${soldOutLabel}</div>`
    : "";

  return `
    <article class="product-card${animateClass}" data-product-id="${product.id}">
      <div class="card-img-wrapper">
        <img src="${product.image}" alt="${name}" loading="lazy" width="300" height="300">
        ${badgeHtml}
        ${outBadgeHtml}
      </div>
      <div class="card-info">
        <div class="card-category">${product.category}</div>
        <a href="${buildPath(`pages/products-details.html?id=${product.id}`)}" class="card-name">${name}</a>
        <div class="card-price-container">
          <span class="price-current">${product.price} EGP</span>
          ${product.oldPrice ? `<span class="price-old">${product.oldPrice} EGP</span>` : ""}
        </div>
        <div class="card-actions">
          <a href="${buildPath(`pages/products-details.html?id=${product.id}`)}" class="btn btn-outline" style="padding:10px 16px; font-size:13px;">${viewText}</a>
          <button type="button" class="btn btn-primary btn-add-cart" style="padding:10px 16px; font-size:13px;" data-product-id="${product.id}" ${isOutOfStock ? "disabled" : ""} aria-label="${lang === "ar" ? "أضف للسلة" : "Add to cart"}">
            <i class="fa-solid fa-cart-plus" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renders multiple product cards.
 * @param {object[]} products
 * @param {string} lang
 * @returns {string}
 */
export function renderProductGrid(products, lang) {
  return products.map((p) => renderProductCard(p, lang, { animate: true })).join("");
}

/**
 * Event delegation for add-to-cart buttons inside a container.
 * @param {HTMLElement} container
 * @param {(productId: string) => void} onAdd
 */
export function bindProductCardEvents(container, onAdd) {
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add-cart");
    if (!btn || btn.disabled) return;
    onAdd(btn.dataset.productId);
  });
}
