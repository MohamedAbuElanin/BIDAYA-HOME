/**
 * BIDAYA HOME - Internationalization Service
 * Manages bilingual (AR/EN) content and RTL/LTR layout switching.
 */

import { TRANSLATIONS } from "../config/translations.js";
import { DEFAULT_LANG, LANG_STORAGE_KEY } from "../config/constants.js";

let currentLang = localStorage.getItem(LANG_STORAGE_KEY) || DEFAULT_LANG;

/** @returns {string} */
export function getCurrentLang() {
  return currentLang;
}

/** @returns {typeof TRANSLATIONS.ar} */
export function getTranslations() {
  return TRANSLATIONS[currentLang];
}

/**
 * @param {string} key
 * @returns {string|undefined}
 */
export function t(key) {
  return TRANSLATIONS[currentLang][key];
}

/**
 * Applies language to document and updates all [data-i18n] elements.
 * @param {string} lang
 */
export function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  updateDOM();
}

/** Toggles between Arabic and English. */
export function toggleLanguage() {
  setLanguage(currentLang === "ar" ? "en" : "ar");
}

/** Updates HTML dir/lang attributes and translates bound elements. */
export function updateDOM() {
  const dir = currentLang === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", currentLang);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (TRANSLATIONS[currentLang][key]) {
      element.innerHTML = TRANSLATIONS[currentLang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    if (TRANSLATIONS[currentLang][key]) {
      element.setAttribute("placeholder", TRANSLATIONS[currentLang][key]);
    }
  });

  window.dispatchEvent(new CustomEvent("langChanged", { detail: { lang: currentLang } }));
}

/** Initializes i18n on page load. */
export function initI18n() {
  updateDOM();
}

export { TRANSLATIONS };
