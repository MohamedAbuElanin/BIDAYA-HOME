/**
 * BIDAYA HOME - Search Results Page Controller
 */

import { BIDAYA_DATA } from "../data/products.js";
import { getCurrentLang } from "../services/i18n.js";
import { addToCart } from "../services/cart.js";
import { renderProductGrid, bindProductCardEvents } from "../components/product-card.js";
import { renderEmptyState } from "../components/empty-state.js";

/** Initializes search results from ?q= URL parameter. */
export function initPage() {
  const lang = getCurrentLang();
  const query = new URLSearchParams(window.location.search).get("q")?.trim() || "";
  const searchInput = document.getElementById("main-search-input");

  if (searchInput) searchInput.value = query;

  const titleEl = document.getElementById("search-query-text");
  if (titleEl) titleEl.textContent = `"${query}"`;

  const grid = document.getElementById("search-results-grid");
  if (!grid) return;

  if (!query) {
    grid.innerHTML = renderEmptyState({ title: lang === "ar" ? "أدخل كلمة بحث" : "Enter a search term" });
    bindSearchForm(searchInput);
    return;
  }

  const cleanQuery = query.toLowerCase();
  const results = BIDAYA_DATA.products.filter((p) => {
    const haystack = `${p.nameAr} ${p.nameEn} ${p.descriptionAr} ${p.descriptionEn} ${p.category}`.toLowerCase();
    return haystack.includes(cleanQuery);
  });

  if (results.length === 0) {
    grid.className = "flex-center";
    grid.innerHTML = renderEmptyState({
      title: lang === "ar" ? "لم نجد نتائج" : "No results found",
      description: lang === "ar" ? "حاول كلمات أبسط مثل: سرير، كرسي، فوط." : "Try simpler terms like bed, chair, towels.",
      actionHtml: `<a href="products.html" class="btn btn-primary">${lang === "ar" ? "تصفح المنتجات" : "Browse Products"}</a>`
    });
  } else {
    grid.className = "grid grid-4";
    grid.innerHTML = renderProductGrid(results, lang);
    bindProductCardEvents(grid, (id) => addToCart(id, 1));
  }

  bindSearchForm(searchInput);
}

function bindSearchForm(searchInput) {
  document.getElementById("main-search-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = searchInput?.value.trim();
    if (val) window.location.href = `search.html?q=${encodeURIComponent(val)}`;
  });
}
