/**
 * BIDAYA HOME - Offers Page Controller
 */

import { BIDAYA_DATA } from "../data/products.js";
import { getCurrentLang } from "../services/i18n.js";
import { addToCart } from "../services/cart.js";
import { renderProductGrid, bindProductCardEvents } from "../components/product-card.js";

/** Initializes offers page with discounted products and countdown timer. */
export function initPage() {
  const lang = getCurrentLang();
  const offers = BIDAYA_DATA.products.filter((p) => p.discount > 0);
  const grid = document.getElementById("offers-products-grid");

  if (grid) {
    grid.innerHTML = renderProductGrid(offers, lang);
    bindProductCardEvents(grid, (id) => addToCart(id, 1));
  }

  initCountdown();
  window.addEventListener("langChanged", () => window.location.reload());
}

/** Countdown to a rolling 3-day offer window. */
function initCountdown() {
  const lang = getCurrentLang();
  let targetTime = localStorage.getItem("offers_target_date");

  if (!targetTime || Date.now() > parseInt(targetTime, 10)) {
    targetTime = String(Date.now() + 3 * 24 * 60 * 60 * 1000);
    localStorage.setItem("offers_target_date", targetTime);
  }

  const els = {
    days: document.getElementById("days-val"),
    hours: document.getElementById("hours-val"),
    minutes: document.getElementById("mins-val"),
    seconds: document.getElementById("secs-val")
  };

  if (lang === "ar") {
    document.getElementById("days-label").textContent = "يوم";
    document.getElementById("hours-label").textContent = "ساعة";
    document.getElementById("mins-label").textContent = "دقيقة";
    document.getElementById("secs-label").textContent = "ثانية";
  }

  if (!els.days) return;

  const tick = () => {
    let diff = parseInt(targetTime, 10) - Date.now();
    if (diff <= 0) {
      targetTime = String(Date.now() + 3 * 24 * 60 * 60 * 1000);
      localStorage.setItem("offers_target_date", targetTime);
      diff = parseInt(targetTime, 10) - Date.now();
    }

    els.days.textContent = String(Math.floor(diff / 86400000)).padStart(2, "0");
    els.hours.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0");
    els.minutes.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    els.seconds.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  };

  tick();
  setInterval(tick, 1000);
}
