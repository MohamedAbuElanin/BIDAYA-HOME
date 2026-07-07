/**
 * BIDAYA HOME - Path Utilities
 * Resolves relative asset paths based on current page location.
 */

/**
 * Returns the path prefix for root-relative links.
 * Pages inside /pages/ need "../" to reach project root.
 * @returns {string}
 */
export function getPathPrefix() {
  return window.location.pathname.includes("/pages/") ? "../" : "";
}

/**
 * Builds a full URL path from a relative segment.
 * @param {string} segment - e.g. "pages/products.html"
 * @returns {string}
 */
export function buildPath(segment) {
  return `${getPathPrefix()}${segment}`;
}
