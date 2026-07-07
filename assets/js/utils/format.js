/**
 * BIDAYA HOME - Formatting Utilities
 */

/**
 * Formats a numeric price with EGP currency label.
 * @param {number} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  return `${amount.toLocaleString("en-EG")} EGP`;
}

/**
 * Returns localized product or category name.
 * @param {{ nameAr: string, nameEn: string }} item
 * @param {string} lang
 * @returns {string}
 */
export function getLocalizedName(item, lang) {
  return lang === "ar" ? item.nameAr : item.nameEn;
}
