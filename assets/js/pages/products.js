/**
 * BIDAYA HOME - Products Catalog Page Controller
 */

import { BIDAYA_DATA } from "../data/products.js";
import { getCurrentLang } from "../services/i18n.js";
import { addToCart } from "../services/cart.js";
import { renderProductGrid, bindProductCardEvents } from "../components/product-card.js";
import { renderEmptyState } from "../components/empty-state.js";
import { renderPagination, bindPagination } from "../components/pagination.js";
import { PRODUCTS_PER_PAGE } from "../config/constants.js";

let currentPage = 1;
/** @type {object[]} */
let filteredProducts = [];

/** Initializes the products catalog with filters, sort, and pagination. */
export function initPage() {
  const lang = getCurrentLang();
  const urlParams = new URLSearchParams(window.location.search);
  const activeCategory = urlParams.get("category");
  const activeFilter = urlParams.get("filter");

  renderCategoryFilters(lang, activeCategory);

  if (activeFilter === "best-sellers") {
    document.getElementById("sort-select").value = "bestselling";
  } else if (activeFilter === "new-arrivals") {
    document.getElementById("sort-select").value = "newest";
  }

  bindFilterEvents();
  applyFilters();

  window.addEventListener("langChanged", () => window.location.reload());
}

function renderCategoryFilters(lang, activeCategory) {
  const list = document.getElementById("filter-categories-list");
  if (!list) return;

  const allLabel = lang === "ar" ? "الكل" : "All";
  list.innerHTML = `
    <li><label class="control-check"><input type="radio" name="cat-filter" value="all" ${!activeCategory ? "checked" : ""}><span>${allLabel}</span></label></li>
    ${BIDAYA_DATA.categories.map((cat) => `
      <li><label class="control-check"><input type="radio" name="cat-filter" value="${cat.id}" ${activeCategory === cat.id ? "checked" : ""}><span>${lang === "ar" ? cat.nameAr : cat.nameEn}</span></label></li>
    `).join("")}
  `;
}

function applyFilters() {
  const { products } = BIDAYA_DATA;
  const selectedCat = document.querySelector('input[name="cat-filter"]:checked')?.value || "all";
  const minPrice = parseFloat(document.getElementById("price-min")?.value) || 0;
  const maxPrice = parseFloat(document.getElementById("price-max")?.value) || Infinity;
  const inStockOnly = document.getElementById("filter-in-stock")?.checked;
  const offersOnly = document.getElementById("filter-offers")?.checked;
  const sortBy = document.getElementById("sort-select")?.value || "default";

  filteredProducts = [...products];

  if (selectedCat !== "all") filteredProducts = filteredProducts.filter((p) => p.category === selectedCat);
  filteredProducts = filteredProducts.filter((p) => p.price >= minPrice && p.price <= maxPrice);
  if (inStockOnly) filteredProducts = filteredProducts.filter((p) => p.stock === "in-stock");
  if (offersOnly) filteredProducts = filteredProducts.filter((p) => p.discount > 0);

  if (sortBy === "newest") filteredProducts.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
  else if (sortBy === "bestselling") filteredProducts.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
  else if (sortBy === "price-low") filteredProducts.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-high") filteredProducts.sort((a, b) => b.price - a.price);

  currentPage = 1;
  renderPage(getCurrentLang());
}

function renderPage(lang) {
  const grid = document.getElementById("catalog-products-grid");
  const paginationEl = document.getElementById("catalog-pagination");
  const resultsNum = document.getElementById("results-count-num");
  if (!grid) return;

  resultsNum.textContent = String(filteredProducts.length);

  if (filteredProducts.length === 0) {
    grid.className = "flex-center";
    grid.innerHTML = renderEmptyState({
      title: lang === "ar" ? "لم نجد أي منتجات." : "No products found.",
      description: lang === "ar" ? "حاول تغيير خيارات التصفية." : "Try adjusting your filters.",
      actionHtml: `<button type="button" class="btn btn-primary" id="grid-reset-btn">${lang === "ar" ? "عرض الكل" : "View All"}</button>`
    });
    document.getElementById("grid-reset-btn")?.addEventListener("click", resetFilters);
    if (paginationEl) paginationEl.innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const pageItems = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);

  grid.className = "grid grid-3";
  grid.innerHTML = renderProductGrid(pageItems, lang);
  bindProductCardEvents(grid, (id) => addToCart(id, 1));

  if (paginationEl) {
    paginationEl.innerHTML = renderPagination({ currentPage, totalPages });
    bindPagination(paginationEl, (page) => {
      if (page < 1 || page > totalPages) return;
      currentPage = page;
      renderPage(lang);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

function resetFilters() {
  const allRadio = document.querySelector('input[name="cat-filter"][value="all"]');
  if (allRadio) allRadio.checked = true;
  document.getElementById("price-min").value = "";
  document.getElementById("price-max").value = "";
  document.getElementById("filter-in-stock").checked = false;
  document.getElementById("filter-offers").checked = false;
  document.getElementById("sort-select").value = "default";
  applyFilters();
}

function bindFilterEvents() {
  document.querySelectorAll('input[name="cat-filter"]').forEach((r) => r.addEventListener("change", applyFilters));
  ["price-min", "price-max", "filter-in-stock", "filter-offers", "sort-select"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", applyFilters);
    document.getElementById(id)?.addEventListener("change", applyFilters);
  });
  document.getElementById("reset-filters-btn")?.addEventListener("click", resetFilters);

  const sidebar = document.getElementById("catalog-sidebar");
  const overlay = document.getElementById("mobile-drawer-overlay");
  document.getElementById("mobile-filter-btn")?.addEventListener("click", () => {
    sidebar?.classList.add("open-mobile");
    overlay?.classList.add("open");
  });
  document.getElementById("close-filters-btn")?.addEventListener("click", () => {
    sidebar?.classList.remove("open-mobile");
    overlay?.classList.remove("open");
  });
}
