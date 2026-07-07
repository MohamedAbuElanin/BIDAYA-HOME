# BIDAYA HOME

Production-ready bilingual (Arabic RTL / English LTR) e-commerce front-end for home products in Egypt.

## Stack

- HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- Firebase v9 Modular SDK (Firestore, Storage, Auth, Hosting)
- No React, Vue, Bootstrap, or Tailwind

## Folder Structure

```text
assets/
  css/          Design system & components
  js/           ES6 modules (app, pages, components, services)
  icons/
  fonts/
images/         Product & brand assets
pages/          Inner pages (cart, checkout, products, etc.)
admin/          Reserved for future admin dashboard
firebase/       Firebase config, rules, indexes
index.html      Home page
```

## Getting Started

1. Open `index.html` in a browser, or serve locally:

```bash
npx serve .
```

2. Configure Firebase in `firebase/firebase-config.js` with your project credentials.

3. Deploy to Firebase Hosting:

```bash
firebase deploy
```

## Architecture

- **`assets/js/app.js`** — Application bootstrap; loads page modules via `data-page` on `<body>`.
- **`assets/js/core/layout.js`** — Header, footer, mobile nav, floating WhatsApp & back-to-top.
- **`assets/js/components/`** — Reusable UI: product card, category card, toast, modal, pagination, etc.
- **`assets/js/services/`** — Cart, i18n, Firestore order persistence.
- **`assets/js/pages/`** — Page-specific controllers (home, products, checkout, …).

## Pages

| Page | Route |
|------|-------|
| Home | `/index.html` |
| Products | `/pages/products.html` |
| Product Details | `/pages/products-details.html?id=` |
| Cart | `/pages/cart.html` |
| Checkout | `/pages/checkout.html` |
| Search | `/pages/search.html?q=` |
| Offers | `/pages/offers.html` |
| About | `/pages/about.html` |
| Contact | `/pages/contact.html` |
| Privacy | `/pages/privacy.html` |
| Terms | `/pages/terms.html` |
| 404 | `/pages/not-found.html` |

## Checkout Flow

1. Customer fills shipping form on checkout page.
2. Order saved to Firestore (or localStorage fallback).
3. WhatsApp message generated and opened for order confirmation.
4. No online payment gateway — COD / InstaPay / wallet options only.

## Currency & Locale

- Currency: **EGP** (Egyptian Pound)
- Default language: **Arabic (RTL)**
- Toggle language via header switcher (EN ↔ AR)

## License

© 2026 BIDAYA HOME. All rights reserved.
