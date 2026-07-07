/**
 * BIDAYA HOME - Home Page Controller
 */

import { BIDAYA_DATA } from "../data/products.js";
import { getCurrentLang } from "../services/i18n.js";
import { addToCart } from "../services/cart.js";
import { showToast } from "../components/toast.js";
import { renderProductGrid, bindProductCardEvents } from "../components/product-card.js";
import { renderCategoryGrid, bindCategoryCardEvents, navigateToCategory } from "../components/category-card.js";
import { buildPath } from "../utils/path.js";
import { HERO_SLIDE_INTERVAL } from "../config/constants.js";

/** Initializes all home page sections and interactions. */
export function initPage() {
  const lang = getCurrentLang();
  renderCategories(lang);
  renderProductSections(lang);
  initHeroSlider();
  initNewsletter(lang);
  bindHomeEvents(lang);
}

function renderCategories(lang) {
  const container = document.getElementById("categories-container");
  if (!container) return;

  container.innerHTML = renderCategoryGrid(BIDAYA_DATA.categories, lang);
  bindCategoryCardEvents(container, navigateToCategory);
}

function renderProductSections(lang) {
  const { products } = BIDAYA_DATA;

  fillGrid("featured-products-container", products.filter((p) => p.featured).slice(0, 4), lang);
  fillGrid("bestsellers-products-container", products.filter((p) => p.bestSeller).slice(0, 4), lang);
  fillGrid("newarrivals-products-container", products.filter((p) => p.newArrival).slice(0, 4), lang);
  fillGrid("offers-products-container", products.filter((p) => p.discount > 0).slice(0, 4), lang);
}

/**
 * @param {string} id
 * @param {object[]} items
 * @param {string} lang
 */
function fillGrid(id, items, lang) {
  const container = document.getElementById(id);
  if (!container) return;

  container.innerHTML = renderProductGrid(items, lang);
  bindProductCardEvents(container, (productId) => addToCart(productId, 1));
}

function initHeroSlider() {
  let currentSlide = 0;
  let autoTimer;
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".dot");
  if (!slides.length) return;

  const showSlide = (index) => {
    slides.forEach((s) => s.classList.remove("active"));
    dots.forEach((d) => d.classList.remove("active"));
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide]?.classList.add("active");
    dots[currentSlide]?.classList.add("active");
  };

  const startAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => showSlide(currentSlide + 1), HERO_SLIDE_INTERVAL);
  };

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => { showSlide(idx); startAuto(); });
  });

  document.getElementById("slider-prev")?.addEventListener("click", () => { showSlide(currentSlide - 1); startAuto(); });
  document.getElementById("slider-next")?.addEventListener("click", () => { showSlide(currentSlide + 1); startAuto(); });

  startAuto();
}

function initNewsletter(lang) {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = lang === "ar" ? "شكراً لاشتراكك في نشرتنا الإخبارية!" : "Thank you for subscribing!";
    showToast(msg, "success");
    form.reset();
  });
}

function bindHomeEvents(lang) {
  window.addEventListener("langChanged", () => window.location.reload());
}
