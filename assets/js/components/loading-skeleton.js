/**
 * BIDAYA HOME - Loading Skeleton Component
 * Generates placeholder shimmer blocks for async content.
 */

/**
 * @param {number} count - Number of skeleton cards
 * @returns {string}
 */
export function renderProductSkeletons(count = 4) {
  return Array.from({ length: count }, () => `
    <div class="product-card" aria-hidden="true">
      <div class="loading-skeleton" style="aspect-ratio:1; margin-bottom:16px; border-radius:var(--radius-md);"></div>
      <div class="loading-skeleton" style="height:14px; width:40%; margin-bottom:8px;"></div>
      <div class="loading-skeleton" style="height:18px; width:80%; margin-bottom:12px;"></div>
      <div class="loading-skeleton" style="height:22px; width:50%; margin-bottom:16px;"></div>
      <div class="loading-skeleton" style="height:40px; border-radius:var(--radius-md);"></div>
    </div>
  `).join("");
}
