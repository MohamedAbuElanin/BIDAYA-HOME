/**
 * BIDAYA HOME - Breadcrumb Component
 */

/**
 * @param {{ label: string, href?: string }[]} items
 * @returns {string}
 */
export function renderBreadcrumb(items) {
  return items.map((item, index) => {
    const isLast = index === items.length - 1;
    const separator = index > 0 ? `<span class="breadcrumb-separator" aria-hidden="true">/</span>` : "";

    if (isLast || !item.href) {
      return `${separator}<span>${item.label}</span>`;
    }

    return `${separator}<a href="${item.href}">${item.label}</a>`;
  }).join("");
}
