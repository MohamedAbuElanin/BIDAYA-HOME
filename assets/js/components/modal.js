/**
 * BIDAYA HOME - Modal Component
 * Reusable overlay dialog for confirmations and loaders.
 */

/**
 * Creates and opens a modal dialog.
 * @param {{ title: string, body: string, onClose?: () => void }} options
 * @returns {{ close: () => void, element: HTMLElement }}
 */
export function openModal({ title, body, onClose }) {
  const modal = document.createElement("div");
  modal.className = "modal open";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${title}</h3>
        <button type="button" class="modal-close" aria-label="Close">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
      <div class="modal-body">${body}</div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => {
    modal.classList.remove("open");
    setTimeout(() => {
      modal.remove();
      onClose?.();
    }, 300);
  };

  modal.querySelector(".modal-close").addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  return { close, element: modal };
}

/**
 * Shows a processing loader modal.
 * @param {string} message
 * @returns {{ close: () => void }}
 */
export function showLoader(message) {
  return openModal({
    title: "",
    body: `
      <div style="text-align:center; padding: 20px;">
        <div class="loading-skeleton" style="width:48px; height:48px; border-radius:50%; margin:0 auto 16px;"></div>
        <p>${message}</p>
      </div>
    `
  });
}
