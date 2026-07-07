/**
 * BIDAYA HOME - Toast Notification Component
 * Displays transient feedback messages to the user.
 */

const ICONS = {
  success: "fa-check-circle",
  danger: "fa-times-circle",
  info: "fa-info-circle"
};

/**
 * Shows a toast notification.
 * @param {string} message
 * @param {"success"|"danger"|"info"} [type="success"]
 */
export function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");

  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("role", "status");
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${ICONS[type] || ICONS.success}" aria-hidden="true"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
