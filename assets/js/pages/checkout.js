/**
 * BIDAYA HOME - Checkout Page Controller
 * Handles order form validation, Firestore save, and WhatsApp redirect.
 */

import { BIDAYA_DATA } from "../data/products.js";
import { getCurrentLang, t } from "../services/i18n.js";
import { getCart, getCartTotal, clearCart } from "../services/cart.js";
import { showToast } from "../components/toast.js";
import { saveOrder } from "../services/database.js";
import { WHATSAPP_NUMBER } from "../config/constants.js";

let activeShippingFee = 0;

/** Initializes checkout form, summary, and submission handler. */
export function initPage() {
  const cartItems = getCart();
  if (cartItems.length === 0) {
    window.location.href = "cart.html";
    return;
  }

  populateGovernorates();
  renderSummary();
  bindPaymentSelection();
  document.getElementById("submit-order-btn")?.addEventListener("click", validateAndSubmitOrder);
}

function populateGovernorates() {
  const lang = getCurrentLang();
  const govSelect = document.getElementById("bill-gov");
  if (!govSelect) return;

  BIDAYA_DATA.governorates.forEach((gov) => {
    const option = document.createElement("option");
    option.value = gov.id;
    option.textContent = lang === "ar" ? gov.nameAr : gov.nameEn;
    govSelect.appendChild(option);
  });

  govSelect.addEventListener("change", (e) => {
    const gov = BIDAYA_DATA.governorates.find((g) => g.id === e.target.value);
    activeShippingFee = gov?.shipping || 0;
    updatePricing();
  });
}

function renderSummary() {
  const lang = getCurrentLang();
  const container = document.getElementById("checkout-summary-items");
  if (!container) return;

  container.innerHTML = getCart().map((item) => {
    const prod = BIDAYA_DATA.products.find((p) => p.id === item.id);
    if (!prod) return "";
    const name = lang === "ar" ? prod.nameAr : prod.nameEn;
    return `<div class="summary-product-item"><div><span style="font-weight:700;color:var(--primary);">${item.qty}x</span> ${name}</div><span style="font-weight:700;">${prod.price * item.qty} EGP</span></div>`;
  }).join("");

  updatePricing();
}

function updatePricing() {
  const subtotal = getCartTotal();
  document.getElementById("summary-subtotal").textContent = `${subtotal} EGP`;
  document.getElementById("summary-shipping").textContent = `${activeShippingFee} EGP`;
  document.getElementById("summary-total").textContent = `${subtotal + activeShippingFee} EGP`;
}

function bindPaymentSelection() {
  document.querySelectorAll(".payment-option-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".payment-option-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      card.querySelector("input")?.click();
    });
  });
}

async function validateAndSubmitOrder() {
  const lang = getCurrentLang();
  const nameInput = document.getElementById("bill-name");
  const phoneInput = document.getElementById("bill-phone");
  const govSelect = document.getElementById("bill-gov");
  const cityInput = document.getElementById("bill-city");
  const addressInput = document.getElementById("bill-address");
  const landmarkInput = document.getElementById("bill-landmark");
  const notesInput = document.getElementById("bill-notes");
  const paymentInput = document.querySelector('input[name="payment"]:checked');

  document.querySelectorAll(".form-group").forEach((g) => g.classList.remove("error", "success"));

  let isValid = true;
  let firstError = null;

  const setError = (input) => { isValid = false; input.closest(".form-group")?.classList.add("error"); if (!firstError) firstError = input; };
  const setSuccess = (input) => input.closest(".form-group")?.classList.add("success");

  const nameVal = nameInput.value.trim();
  if (nameVal.length < 8 || nameVal.split(/\s+/).filter(Boolean).length < 3) setError(nameInput);
  else setSuccess(nameInput);

  if (!/^01[0125][0-9]{8}$/.test(phoneInput.value.trim())) setError(phoneInput);
  else setSuccess(phoneInput);

  if (!govSelect.value) setError(govSelect);
  else setSuccess(govSelect);

  if (cityInput.value.trim().length < 3) setError(cityInput);
  else setSuccess(cityInput);

  if (addressInput.value.trim().length < 10) setError(addressInput);
  else setSuccess(addressInput);

  if (!isValid) {
    firstError?.focus();
    showToast(lang === "ar" ? "يرجى تصحيح الحقول المحددة" : "Please correct the highlighted fields", "danger");
    return;
  }

  const subtotal = getCartTotal();
  const govText = govSelect.options[govSelect.selectedIndex].text;
  const orderPayload = {
    customer: {
      name: nameVal,
      phone: phoneInput.value.trim(),
      govId: govSelect.value,
      govName: govText,
      city: cityInput.value.trim(),
      address: addressInput.value.trim(),
      landmark: landmarkInput.value.trim(),
      notes: notesInput.value.trim()
    },
    items: getCart(),
    paymentMethod: paymentInput.value,
    pricing: { subtotal, shipping: activeShippingFee, total: subtotal + activeShippingFee }
  };

  const loader = document.getElementById("processing-loader");
  if (loader) loader.style.display = "flex";

  try {
    const orderId = await saveOrder(orderPayload);
    const waUrl = buildWhatsAppLink(orderId, orderPayload);
    clearCart();
    renderSuccess(orderId, waUrl);
    window.open(waUrl, "_blank");
    showToast(t("toast_order_success"), "success");
  } catch {
    showToast(t("toast_order_error"), "danger");
  } finally {
    if (loader) loader.style.display = "none";
  }
}

function buildWhatsAppLink(orderId, payload) {
  const lang = getCurrentLang();
  let msg = `*BIDAYA HOME - طلب جديد ${orderId}*\n`;
  msg += `- الاسم: ${payload.customer.name}\n- الهاتف: ${payload.customer.phone}\n`;
  msg += `- العنوان: ${payload.customer.address}, ${payload.customer.city}, ${payload.customer.govName}\n`;
  msg += `\n*المنتجات:*\n`;
  payload.items.forEach((item) => {
    const prod = BIDAYA_DATA.products.find((p) => p.id === item.id);
    if (prod) msg += `- ${item.qty}x ${lang === "ar" ? prod.nameAr : prod.nameEn} (${prod.price} EGP)\n`;
  });
  msg += `\n*الإجمالي: ${payload.pricing.total} EGP*`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function renderSuccess(orderId, waUrl) {
  const lang = getCurrentLang();
  const container = document.getElementById("checkout-main-content");
  if (!container) return;

  container.innerHTML = `
    <div class="success-container fade-in" style="text-align:center;padding:60px 24px;">
      <div class="success-icon-wrapper flex-center" style="width:80px;height:80px;border-radius:50%;background:var(--success);color:white;margin:0 auto 24px;font-size:32px;"><i class="fa-solid fa-check"></i></div>
      <h2 style="font-weight:800;font-size:26px;color:var(--primary);margin-bottom:12px;">${lang === "ar" ? "تم تسجيل طلبك!" : "Order registered!"}</h2>
      <p style="color:var(--text-muted);margin-bottom:24px;">${lang === "ar" ? `رقم الطلب: ${orderId}` : `Order #${orderId}`}</p>
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-success" style="padding:14px;margin-bottom:12px;"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
      <br><a href="../index.html" class="btn btn-outline" style="padding:14px;">${lang === "ar" ? "الرئيسية" : "Home"}</a>
    </div>
  `;
}

/** Exposed for inline onclick handlers in HTML payment cards. */
window.selectPaymentMethod = (method, element) => {
  document.querySelectorAll(".payment-option-card").forEach((c) => c.classList.remove("active"));
  element.classList.add("active");
  document.getElementById(`pay-${method}`).checked = true;
};

window.validateAndSubmitOrder = validateAndSubmitOrder;
