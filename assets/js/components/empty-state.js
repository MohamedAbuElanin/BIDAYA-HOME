/**
 * BIDAYA HOME - Empty State Component
 * Renders a centered placeholder when no content is available.
 */

/**
 * @param {{ icon?: string, title: string, description?: string, actionHtml?: string }} options
 * @returns {string}
 */
export function renderEmptyState({ icon = "fa-box-open", title, description = "", actionHtml = "" }) {
  return `
    <div class="empty-state">
      <i class="fa-solid ${icon} empty-state-icon" aria-hidden="true"></i>
      <h3 class="empty-state-title">${title}</h3>
      ${description ? `<p style="color:var(--text-muted); margin-bottom:24px;">${description}</p>` : ""}
      ${actionHtml}
    </div>
  `;
}
