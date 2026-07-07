/**
 * BIDAYA HOME - Pagination Component
 */

/**
 * @param {{ currentPage: number, totalPages: number, onPage?: string }} options
 * @returns {string}
 */
export function renderPagination({ currentPage, totalPages }) {
  if (totalPages <= 1) return "";

  const prevDisabled = currentPage <= 1 ? "disabled" : "";
  const nextDisabled = currentPage >= totalPages ? "disabled" : "";

  let pagesHtml = "";
  for (let i = 1; i <= totalPages; i++) {
    pagesHtml += `
      <button type="button" class="pagination-item ${i === currentPage ? "active" : ""}" data-page="${i}" aria-label="Page ${i}" ${i === currentPage ? 'aria-current="page"' : ""}>
        ${i}
      </button>
    `;
  }

  return `
    <nav class="pagination" aria-label="Pagination">
      <button type="button" class="pagination-item ${prevDisabled}" data-page="${currentPage - 1}" aria-label="Previous page" ${prevDisabled ? "disabled" : ""}>
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      ${pagesHtml}
      <button type="button" class="pagination-item ${nextDisabled}" data-page="${currentPage + 1}" aria-label="Next page" ${nextDisabled ? "disabled" : ""}>
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </nav>
  `;
}

/**
 * Attaches click handlers to pagination buttons.
 * @param {HTMLElement} container
 * @param {(page: number) => void} callback
 */
export function bindPagination(container, callback) {
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".pagination-item");
    if (!btn || btn.disabled) return;

    const page = parseInt(btn.dataset.page, 10);
    if (!Number.isNaN(page)) callback(page);
  });
}
