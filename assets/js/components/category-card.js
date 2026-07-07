/**
 * BIDAYA HOME - Category Card Component
 */

import { getLocalizedName } from "../utils/format.js";
import { buildPath } from "../utils/path.js";

/**
 * @param {object} category
 * @param {string} lang
 * @returns {string}
 */
export function renderCategoryCard(category, lang) {
  const name = getLocalizedName(category, lang);

  return `
    <article class="category-card" data-category-id="${category.id}" role="link" tabindex="0" aria-label="${name}">
      <div class="category-icon-wrapper flex-center">
        <i class="fa-solid ${category.icon}" aria-hidden="true"></i>
      </div>
      <div class="category-name">${name}</div>
    </article>
  `;
}

/**
 * @param {object[]} categories
 * @param {string} lang
 * @returns {string}
 */
export function renderCategoryGrid(categories, lang) {
  return categories.map((cat) => renderCategoryCard(cat, lang)).join("");
}

/**
 * @param {HTMLElement} container
 * @param {(categoryId: string) => void} onSelect
 */
export function bindCategoryCardEvents(container, onSelect) {
  const navigate = (card) => {
    const id = card.dataset.categoryId;
    if (id) onSelect(id);
  };

  container.addEventListener("click", (e) => {
    const card = e.target.closest(".category-card");
    if (card) navigate(card);
  });

  container.addEventListener("keydown", (e) => {
    const card = e.target.closest(".category-card");
    if (card && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      navigate(card);
    }
  });
}

/**
 * Default navigation handler for category cards.
 * @param {string} categoryId
 */
export function navigateToCategory(categoryId) {
  window.location.href = buildPath(`pages/products.html?category=${categoryId}`);
}
