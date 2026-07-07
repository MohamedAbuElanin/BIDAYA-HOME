/**
 * BIDAYA HOME - Product Details Page Controller
 */

import { BIDAYA_DATA } from "../data/products.js";
import { getCurrentLang } from "../services/i18n.js";
import { addToCart } from "../services/cart.js";
import { renderProductGrid, bindProductCardEvents } from "../components/product-card.js";
import { buildPath } from "../utils/path.js";

/** @type {object|null} */
let currentProduct = null;

/** Initializes product detail view from URL ?id= parameter. */
export function initPage() {
  const prodId = new URLSearchParams(window.location.search).get("id");
  const product = BIDAYA_DATA.products.find((p) => p.id === prodId);

  if (!product) {
    window.location.href = "not-found.html";
    return;
  }

  currentProduct = product;
  renderDetails(product);
  bindTabs();
  window.addEventListener("langChanged", () => window.location.reload());
}

function renderDetails(product) {
  const lang = getCurrentLang();
  const name = lang === "ar" ? product.nameAr : product.nameEn;
  const isOutOfStock = product.stock === "out-of-stock";

  document.title = `${name} | BIDAYA HOME`;
  document.getElementById("breadcrumb-product-name").textContent = name;

  const images = product.images || [product.image];
  const detailsContainer = document.getElementById("product-details-content");

  detailsContainer.innerHTML = `
    <div class="gallery-container">
      <div class="main-img-view flex-center"><img src="${product.image}" id="main-product-img" alt="${name}"></div>
      <div class="thumbnails-list">${images.map((img, i) => `
        <button type="button" class="thumb-item ${i === 0 ? "active" : ""}" data-img="${img}" aria-label="View image ${i + 1}"><img src="${img}" alt=""></button>
      `).join("")}</div>
    </div>
    <div class="info-panel">
      <div class="details-category">${product.category}</div>
      <h1 class="details-name">${name}</h1>
      <div class="details-price-wrapper">
        <span class="details-price-current">${product.price} EGP</span>
        ${product.oldPrice ? `<span class="details-price-old">${product.oldPrice} EGP</span>` : ""}
        ${product.discount ? `<div class="badge-discount">${product.discount}%</div>` : ""}
      </div>
      <span class="stock-badge ${isOutOfStock ? "out" : "in"}">${isOutOfStock ? (lang === "ar" ? "غير متوفر" : "Out of Stock") : (lang === "ar" ? "متوفر" : "In Stock")}</span>
      <div class="qty-adder-wrapper">
        <span style="font-weight:700;">${lang === "ar" ? "الكمية:" : "Qty:"}</span>
        <div class="qty-selector">
          <button type="button" class="qty-btn" id="qty-decrease" ${isOutOfStock ? "disabled" : ""}><i class="fa-solid fa-minus"></i></button>
          <input type="number" id="qty-count-input" class="qty-input" value="1" min="1" readonly>
          <button type="button" class="qty-btn" id="qty-increase" ${isOutOfStock ? "disabled" : ""}><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
      <div style="display:flex;gap:16px;margin-top:10px;">
        <button type="button" class="btn btn-primary" id="add-to-cart-btn" style="flex-grow:1;padding:14px;" ${isOutOfStock ? "disabled" : ""}><i class="fa-solid fa-cart-plus"></i> ${lang === "ar" ? "أضف للسلة" : "Add to Cart"}</button>
        <a href="checkout.html" class="btn btn-secondary" style="padding:14px;" ${isOutOfStock ? "aria-disabled=true" : ""}>${lang === "ar" ? "شراء الآن" : "Buy Now"}</a>
      </div>
    </div>
  `;

  document.getElementById("product-full-desc").textContent = lang === "ar" ? product.descriptionAr : product.descriptionEn;

  const specs = lang === "ar" ? product.specsAr : product.specsEn;
  document.getElementById("product-specs-table").innerHTML = Object.entries(specs).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("");

  const related = BIDAYA_DATA.products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const relatedGrid = document.getElementById("related-products-grid");
  if (related.length === 0) {
    relatedGrid.parentElement.style.display = "none";
  } else {
    relatedGrid.innerHTML = renderProductGrid(related, lang);
    bindProductCardEvents(relatedGrid, (id) => addToCart(id, 1));
  }

  bindDetailEvents();
}

function bindDetailEvents() {
  document.querySelectorAll(".thumb-item").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      document.getElementById("main-product-img").src = thumb.dataset.img;
      document.querySelectorAll(".thumb-item").forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  document.getElementById("qty-decrease")?.addEventListener("click", () => modifyQty(-1));
  document.getElementById("qty-increase")?.addEventListener("click", () => modifyQty(1));
  document.getElementById("add-to-cart-btn")?.addEventListener("click", () => {
    const qty = parseInt(document.getElementById("qty-count-input").value, 10);
    addToCart(currentProduct.id, qty);
  });
}

function modifyQty(amount) {
  const input = document.getElementById("qty-count-input");
  input.value = String(Math.max(1, parseInt(input.value, 10) + amount));
}

function bindTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-panel-${tab}`)?.classList.add("active");
    });
  });
}

window.switchTab = (tabId) => {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tabId));
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === `tab-panel-${tabId}`));
};
