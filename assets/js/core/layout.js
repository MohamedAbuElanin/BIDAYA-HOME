/**
 * BIDAYA HOME - Layout Components (Header, Footer, Floating Buttons)
 * Renders shared chrome injected into every page.
 */

import { WHATSAPP_NUMBER } from "../config/constants.js";
import { TRANSLATIONS } from "../config/translations.js";
import { getCurrentLang, toggleLanguage } from "../services/i18n.js";
import { updateCartBadges } from "../services/cart.js";
import { buildPath } from "../utils/path.js";

/**
 * Renders header, footer, mobile drawer, and floating action buttons.
 */
export function renderLayout() {
  const lang = getCurrentLang();
  const prefix = buildPath("");
  const t = TRANSLATIONS[lang];
  const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
  const isContact = window.location.pathname.endsWith("contact.html");

  renderHeader(prefix, lang, t, isHome, isContact);
  renderMobileDrawer(prefix, lang, t);
  renderFooter(prefix, lang, t);
  renderFloatingButtons();
  bindLayoutEvents(prefix);
  updateCartBadges();
}

function renderHeader(prefix, lang, t, isHome, isContact) {
  const headerEl = document.getElementById("global-header");
  if (!headerEl) return;

  headerEl.innerHTML = `
    <div class="container header-container">
      <button type="button" class="menu-toggle action-btn" id="mobile-menu-btn" aria-label="Open menu">
        <i class="fa-solid fa-bars" aria-hidden="true"></i>
      </button>
      <a href="${prefix}index.html" class="logo" aria-label="BIDAYA HOME">
        <i class="fa-solid fa-house-chimney logo-icon" aria-hidden="true"></i>
        <span class="logo-bidaya">BIDAYA</span>&nbsp;<span class="logo-home">HOME</span>
      </a>
      <form class="search-bar" id="header-search-form" role="search">
        <input type="search" id="header-search-input" data-i18n-placeholder="search_placeholder" placeholder="${t.search_placeholder}">
        <i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
      </form>
      <div class="header-actions">
        <button type="button" class="lang-switch" id="lang-toggle-btn">${lang === "ar" ? "EN" : "العربية"}</button>
        <a href="${prefix}pages/cart.html" class="action-btn" aria-label="Cart">
          <i class="fa-solid fa-shopping-bag" aria-hidden="true"></i>
          <span class="badge cart-count-badge" style="display:none;">0</span>
        </a>
        <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener noreferrer" class="action-btn btn-success" style="background-color:#25D366;color:white;">
          <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
        </a>
      </div>
    </div>
    <nav class="nav-bar" aria-label="Main navigation">
      <div class="container nav-container">
        <ul class="nav-links">
          <li><a href="${prefix}index.html" class="${isHome ? "active" : ""}">${t.nav_home}</a></li>
          <li>
            <a href="${prefix}pages/products.html?category=home-decor">
              ${t.nav_home_decor || (lang==="ar"?"ديكور المنزل":"Home Decor")}
            </a>
          </li>
          <li>
            <a href="${prefix}pages/products.html?category=kitchen">
              ${t.nav_kitchen || (lang==="ar"?"المطبخ":"Kitchen")}
              <i class="fa-solid fa-chevron-down nav-caret"></i>
            </a>
            <ul class="nav-dropdown">
              <li><a href="${prefix}pages/products.html?category=cookware"><i class="fa-solid fa-pot-food"></i>${t.nav_cookware || (lang==="ar"?"أواني الطهي":"Cookware")}</a></li>
              <li><a href="${prefix}pages/products.html?category=bakeware"><i class="fa-solid fa-cake-candles"></i>${t.nav_bakeware || (lang==="ar"?"أدوات الخبز":"Bakeware")}</a></li>
              <li><a href="${prefix}pages/products.html?category=kitchen-tools"><i class="fa-solid fa-utensils"></i>${t.nav_kitchen_tools || (lang==="ar"?"أدوات المطبخ":"Kitchen Tools")}</a></li>
              <li><a href="${prefix}pages/products.html?category=kitchen-storage"><i class="fa-solid fa-box-open"></i>${t.nav_kitchen_storage || (lang==="ar"?"تخزين المطبخ":"Kitchen Storage")}</a></li>
              <li><a href="${prefix}pages/products.html?category=serveware"><i class="fa-solid fa-bowl-food"></i>${t.nav_serveware || (lang==="ar"?"أدوات التقديم":"Serveware")}</a></li>
              <li><a href="${prefix}pages/products.html?category=glassware"><i class="fa-solid fa-wine-glass"></i>${t.nav_glassware || (lang==="ar"?"الزجاجيات":"Glassware & Drinkware")}</a></li>
              <li><a href="${prefix}pages/products.html?category=dining"><i class="fa-solid fa-plate-wheat"></i>${t.nav_dining || (lang==="ar"?"المائدة":"Dining")}</a></li>
            </ul>
          </li>
          <li><a href="${prefix}pages/products.html?category=bath">${t.nav_bath || (lang==="ar"?"الحمام":"Bath")}</a></li>
          <li><a href="${prefix}pages/products.html?category=bedding">${t.nav_bedding || (lang==="ar"?"المفروشات":"Bedding")}</a></li>
          <li><a href="${prefix}pages/products.html?category=lighting">${t.nav_lighting || (lang==="ar"?"الإضاءة":"Lighting")}</a></li>
          <li>
            <a href="${prefix}pages/products.html?category=storage">
              ${t.nav_storage || (lang==="ar"?"التخزين والتنظيم":"Storage & Organization")}
              <i class="fa-solid fa-chevron-down nav-caret"></i>
            </a>
            <ul class="nav-dropdown">
              <li><a href="${prefix}pages/products.html?category=cleaning"><i class="fa-solid fa-spray-can-sparkles"></i>${t.nav_cleaning || (lang==="ar"?"منتجات النظافة":"Cleaning Supplies")}</a></li>
              <li><a href="${prefix}pages/products.html?category=laundry"><i class="fa-solid fa-jug-detergent"></i>${t.nav_laundry || (lang==="ar"?"الغسيل":"Laundry")}</a></li>
            </ul>
          </li>
          <li><a href="${prefix}pages/products.html?category=appliances">${t.nav_appliances || (lang==="ar"?"الأجهزة المنزلية":"Appliances")}</a></li>
          <li><a href="${prefix}pages/products.html?category=gardening">${t.nav_gardening || (lang==="ar"?"الحديقة":"Gardening & Lawn Care")}</a></li>
          <li><a href="${prefix}pages/products.html?category=events">${t.nav_events || (lang==="ar"?"الفعاليات والحفلات":"Event & Party Supplies")}</a></li>
          <li><a href="${prefix}pages/products.html?category=office">${t.nav_office || (lang==="ar"?"المكتب":"Office")}</a></li>
          <li><a href="${prefix}pages/offers.html" style="color:var(--accent);font-weight:700;">${t.nav_offers}</a></li>
          <li><a href="${prefix}pages/contact.html" class="${isContact ? "active" : ""}">${t.nav_contact}</a></li>
        </ul>
        <div class="contact-direct">
          <i class="fa-solid fa-phone" aria-hidden="true"></i>
          <span>${t.contact_direct}</span>
        </div>
      </div>
    </nav>
  `;
}

function renderMobileDrawer(prefix, lang, t) {
  if (document.getElementById("mobile-nav-drawer")) return;

  const drawer = document.createElement("div");
  drawer.id = "mobile-nav-drawer";
  drawer.className = "mobile-drawer";
  drawer.innerHTML = `
    <div class="drawer-header">
      <a href="${prefix}index.html" class="logo">
        <i class="fa-solid fa-house-chimney logo-icon" aria-hidden="true"></i>
        <span class="logo-bidaya">BIDAYA</span>&nbsp;<span class="logo-home">HOME</span>
      </a>
      <button type="button" class="action-btn" id="mobile-drawer-close" aria-label="Close"><i class="fa-solid fa-times"></i></button>
    </div>
    <form class="form-group" id="mobile-search-form" role="search" style="margin-bottom:24px;">
      <input type="search" id="mobile-search-input" class="form-control" data-i18n-placeholder="search_placeholder" placeholder="${t.search_placeholder}">
    </form>
    <ul class="drawer-links">
      <li><a href="${prefix}index.html">${t.nav_home}</a></li>
      <li><a href="${prefix}pages/products.html?category=home-decor">${t.nav_home_decor || (lang==="ar"?"ديكور المنزل":"Home Decor")}</a></li>
      <li><a href="${prefix}pages/products.html?category=kitchen">${t.nav_kitchen || (lang==="ar"?"المطبخ":"Kitchen")}</a></li>
      <li><a href="${prefix}pages/products.html?category=bath">${t.nav_bath || (lang==="ar"?"الحمام":"Bath")}</a></li>
      <li><a href="${prefix}pages/products.html?category=bedding">${t.nav_bedding || (lang==="ar"?"المفروشات":"Bedding")}</a></li>
      <li><a href="${prefix}pages/products.html?category=lighting">${t.nav_lighting || (lang==="ar"?"الإضاءة":"Lighting")}</a></li>
      <li><a href="${prefix}pages/products.html?category=appliances">${t.nav_appliances || (lang==="ar"?"الأجهزة المنزلية":"Appliances")}</a></li>
      <li><a href="${prefix}pages/offers.html">${t.nav_offers}</a></li>
      <li><a href="${prefix}pages/about.html">${t.nav_about}</a></li>
      <li><a href="${prefix}pages/contact.html">${t.nav_contact}</a></li>
    </ul>
  `;
  document.body.appendChild(drawer);

  const overlay = document.createElement("div");
  overlay.id = "mobile-drawer-overlay";
  overlay.className = "drawer-overlay";
  document.body.appendChild(overlay);
}

function renderFooter(prefix, lang, t) {
  const footerEl = document.getElementById("global-footer");
  if (!footerEl) return;

  footerEl.innerHTML = `
    <div class="container">
      <div class="footer-top">
        <div>
          <a href="${prefix}index.html" class="logo" style="margin-bottom:20px;">
            <i class="fa-solid fa-house-chimney logo-icon" style="color:#BA9653;" aria-hidden="true"></i>
            <span class="logo-bidaya" style="color:white;">BIDAYA</span>&nbsp;<span class="logo-home">HOME</span>
          </a>
          <p class="footer-desc" data-i18n="footer_desc">${t.footer_desc}</p>
          <div class="footer-socials">
            <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener noreferrer" class="social-icon"><i class="fa-brands fa-whatsapp"></i></a>
          </div>
        </div>
        <div>
          <h4 class="footer-title" data-i18n="footer_quick_links">${t.footer_quick_links}</h4>
          <ul class="footer-links">
            <li><a href="${prefix}index.html" data-i18n="nav_home">${t.nav_home}</a></li>
            <li><a href="${prefix}pages/about.html" data-i18n="nav_about">${t.nav_about}</a></li>
            <li><a href="${prefix}pages/contact.html" data-i18n="nav_contact">${t.nav_contact}</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-title" data-i18n="footer_categories">${t.footer_categories}</h4>
          <ul class="footer-links">
            <li><a href="${prefix}pages/products.html?category=bedroom">${lang === "ar" ? "غرفة النوم" : "Bedroom"}</a></li>
            <li><a href="${prefix}pages/products.html?category=kitchen">${lang === "ar" ? "المطبخ" : "Kitchen"}</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-title" data-i18n="footer_contact">${t.footer_contact}</h4>
          <ul class="footer-contact-info">
            <li><i class="fa-solid fa-location-dot"></i><span data-i18n="footer_address">${t.footer_address}</span></li>
            <li><i class="fa-solid fa-phone"></i><span>01000000000</span></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p data-i18n="footer_copyright">${t.footer_copyright}</p>
        <div class="footer-bottom-links">
          <a href="${prefix}pages/privacy.html" data-i18n="footer_privacy">${t.footer_privacy}</a>
          <a href="${prefix}pages/terms.html" data-i18n="footer_terms">${t.footer_terms}</a>
        </div>
      </div>
    </div>
  `;
}

function renderFloatingButtons() {
  if (document.querySelector(".floating-container")) return;

  const container = document.createElement("div");
  container.className = "floating-container";
  container.innerHTML = `
    <button type="button" class="floating-btn floating-backtop" id="back-to-top-btn" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>
    <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener noreferrer" class="floating-btn floating-whatsapp"><i class="fa-brands fa-whatsapp"></i></a>
  `;
  document.body.appendChild(container);
}

function bindLayoutEvents(prefix) {
  document.getElementById("lang-toggle-btn")?.addEventListener("click", () => {
    toggleLanguage();
    renderLayout();
  });

  window.addEventListener("scroll", () => {
    document.querySelector("header")?.classList.toggle("scrolled", window.scrollY > 50);
    document.getElementById("back-to-top-btn")?.classList.toggle("show", window.scrollY > 300);
  }, { passive: true });

  document.getElementById("back-to-top-btn")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const drawer = document.getElementById("mobile-nav-drawer");
  const overlay = document.getElementById("mobile-drawer-overlay");
  const closeDrawer = () => { drawer?.classList.remove("open"); overlay?.classList.remove("open"); };

  document.getElementById("mobile-menu-btn")?.addEventListener("click", () => { drawer?.classList.add("open"); overlay?.classList.add("open"); });
  document.getElementById("mobile-drawer-close")?.addEventListener("click", closeDrawer);
  overlay?.addEventListener("click", closeDrawer);

  const search = (sel) => {
    const input = document.querySelector(sel);
    if (input?.value.trim()) window.location.href = `${prefix}pages/search.html?q=${encodeURIComponent(input.value.trim())}`;
  };

  document.getElementById("header-search-form")?.addEventListener("submit", (e) => { e.preventDefault(); search("#header-search-input"); });
  document.getElementById("mobile-search-form")?.addEventListener("submit", (e) => { e.preventDefault(); search("#mobile-search-input"); });
}
