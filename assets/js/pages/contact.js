/**
 * BIDAYA HOME - Contact Page Controller
 */

import { getCurrentLang, t } from "../services/i18n.js";
import { showToast } from "../components/toast.js";

/** Initializes contact form validation and submission. */
export function initPage() {
  const form = document.getElementById("contact-us-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("contact-name");
    const phoneInput = document.getElementById("contact-phone");
    const msgInput = document.getElementById("contact-message");

    document.querySelectorAll(".form-group").forEach((g) => g.classList.remove("error", "success"));

    let isValid = true;

    if (nameInput.value.trim().length < 3) {
      isValid = false;
      nameInput.closest(".form-group").classList.add("error");
    } else {
      nameInput.closest(".form-group").classList.add("success");
    }

    if (!/^01[0125][0-9]{8}$/.test(phoneInput.value.trim())) {
      isValid = false;
      phoneInput.closest(".form-group").classList.add("error");
    } else {
      phoneInput.closest(".form-group").classList.add("success");
    }

    if (msgInput.value.trim().length < 8) {
      isValid = false;
      msgInput.closest(".form-group").classList.add("error");
    } else {
      msgInput.closest(".form-group").classList.add("success");
    }

    if (isValid) {
      showToast(t("contact_success"), "success");
      form.reset();
      document.querySelectorAll(".form-group").forEach((g) => g.classList.remove("success"));
    }
  });
}
