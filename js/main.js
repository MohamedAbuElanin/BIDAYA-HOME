// BIDAYA HOME - Global Controller & Localization Engine
(function () {
  // 1. Language and Translation Database
  const TRANSLATIONS = {
    ar: {
      site_title: "بداية هوم | للأدوات المنزلية",
      logo_text: "بداية <span>هوم</span>",
      nav_home: "الرئيسية",
      nav_categories: "الأقسام",
      nav_offers: "العروض",
      nav_bestsellers: "الأكثر مبيعاً",
      nav_newarrivals: "وصل حديثاً",
      nav_contact: "اتصل بنا",
      nav_about: "من نحن",
      search_placeholder: "ابحث عن منتجات لبيتك...",
      whatsapp_chat: "تحدث معنا",
      contact_direct: "اتصل بنا: 01000000000",
      
      // Footer
      footer_desc: "بداية هوم هي وجهتك الأولى لتسوق مستلزمات المنزل والأدوات المنزلية الراقية في مصر. نجمع بين الجودة العالية، التصميمات العصرية، والأسعار المناسبة.",
      footer_quick_links: "روابط سريعة",
      footer_categories: "الأقسام الرئيسية",
      footer_contact: "معلومات التواصل",
      footer_copyright: "© 2026 بداية هوم. جميع الحقوق محفوظة.",
      footer_privacy: "سياسة الخصوصية",
      footer_terms: "الشروط والأحكام",
      footer_address: "القاهرة، جمهورية مصر العربية",
      
      // Product Card
      card_view_details: "التفاصيل",
      card_add_to_cart: "أضف للسلة",
      card_out_of_stock: "نفد من المخزن",
      card_in_stock: "متوفر في المخزن",
      badge_discount: "خصم",
      
      // Cart & Checkout General
      cart_title: "عربة التسوق",
      cart_empty: "عربة التسوق فارغة حالياً",
      cart_subtotal: "المجموع الفرعي",
      cart_shipping: "الشحن",
      cart_total: "المجموع الكلي",
      cart_checkout: "إتمام الطلب",
      cart_continue: "متابعة التسوق",
      cart_remove: "إزالة",
      
      // Checkout Form
      checkout_title: "بيانات الشحن والدفع",
      checkout_name: "الاسم الكامل",
      checkout_phone: "رقم الهاتف",
      checkout_gov: "المحافظة",
      checkout_city: "المدينة / المنطقة",
      checkout_address: "العنوان بالتفصيل",
      checkout_landmark: "علامة مميزة (اختياري)",
      checkout_payment: "طريقة الدفع",
      checkout_payment_cod: "الدفع عند الاستلام (COD)",
      checkout_payment_instapay: "إنستا باي (InstaPay)",
      checkout_payment_wallet: "محفظة إلكترونية (فودافون كاش...)",
      checkout_notes: "ملاحظات إضافية على الطلب",
      checkout_submit: "تأكيد الطلب عبر واتساب",
      checkout_summary: "ملخص الطلب",
      
      // Validation Alerts
      val_name: "يرجى إدخال الاسم الكامل (ثلاثي على الأقل)",
      val_phone: "يرجى إدخال رقم هاتف مصري صحيح (11 رقم)",
      val_gov: "يرجى اختيار المحافظة",
      val_city: "يرجى إدخال المدينة أو المنطقة",
      val_address: "يرجى إدخال العنوان بالتفصيل",
      
      // Toast messages
      toast_added: "تم إضافة المنتج إلى عربة التسوق!",
      toast_removed: "تم إزالة المنتج من العربة.",
      toast_updated: "تم تحديث الكمية.",
      toast_order_success: "تم حفظ الطلب بنجاح! جاري تحويلك إلى واتساب...",
      toast_order_error: "حدث خطأ أثناء حفظ الطلب. يرجى المحاولة لاحقاً.",
      
      // Other Pages
      about_title: "من نحن",
      about_story_title: "قصتنا",
      about_story_desc: "بدأت رحلتنا في بداية هوم بهدف بسيط: تقديم منتجات منزلية تجمع بين الفخامة، العملية، والقيمة الممتازة للمستهلك المصري. نؤمن بأن كل ركن في منزلك يستحق الاهتمام والجمال، ولذلك نسعى جاهدين لانتقاء أرقى المفروشات والأدوات المنزلية التي تدوم طويلاً.",
      about_mission: "مهمتنا",
      about_mission_desc: "توفير تجربة تسوق منزلية سلسة وممتعة للعميل المصري، وتقديم خيارات واسعة من المنتجات بجودة لا تضاهى وتوصيل سريع لكافة المحافظات.",
      about_vision: "رؤيتنا",
      about_vision_desc: "أن نكون الخيار الأول والاسم الموثوق لكل بيت مصري يبحث عن الرقي والتجدد في مستلزمات المنزل والأدوات الحديثة.",
      about_why_title: "لماذا تختار بداية هوم؟",
      about_why_1: "جودة ممتازة وخامات منتقاة بعناية.",
      about_why_2: "أسعار تنافسية وعروض مستمرة طوال العام.",
      about_why_3: "شحن سريع وآمن لجميع محافظات مصر.",
      about_why_4: "خدمة عملاء متميزة وتواصل مباشر عبر واتساب.",
      
      contact_title: "اتصل بنا",
      contact_info_title: "معلومات الاتصال",
      contact_form_title: "أرسل لنا رسالة",
      contact_name: "الاسم",
      contact_email: "البريد الإلكتروني (اختياري)",
      contact_message: "الرسالة",
      contact_submit: "إرسال الرسالة",
      contact_success: "تم إرسال رسالتك بنجاح! سنقوم بالرد عليك في أقرب وقت.",
      
      offers_title: "أقوى العروض والخصومات",
      offers_subtitle: "استمتع بخصومات حصرية ولفترة محدودة على أرقى المنتجات المنزلية",
      offers_ends: "ينتهي العرض خلال:",
      days: "يوم",
      hours: "ساعة",
      minutes: "دقيقة",
      seconds: "ثانية",
      
      search_results_for: "نتائج البحث عن:",
      search_no_results: "لم نجد أي منتجات تطابق بحثك.",
      
      filter_title: "تصفية المنتجات",
      filter_category: "القسم",
      filter_price: "النطاق السعري",
      filter_availability: "حالة التوفر",
      filter_all: "الكل",
      filter_instock: "متوفر فقط",
      filter_discount: "العروض فقط",
      sort_title: "ترتيب حسب",
      sort_default: "الافتراضي",
      sort_newest: "الأحدث",
      sort_bestselling: "الأكثر مبيعاً",
      sort_price_low: "السعر: من الأقل للأعلى",
      sort_price_high: "السعر: من الأعلى للأقل",
      
      page_not_found: "الصفحة غير موجودة",
      page_not_found_desc: "عذراً، الصفحة التي تبحث عنها قد تم نقلها، أو حذفها، أو أنها لم تكن موجودة في الأصل.",
      back_home: "العودة للرئيسية"
    },
    en: {
      site_title: "BIDAYA HOME | Household Products",
      logo_text: "BIDAYA <span>HOME</span>",
      nav_home: "Home",
      nav_categories: "Categories",
      nav_offers: "Offers",
      nav_bestsellers: "Best Sellers",
      nav_newarrivals: "New Arrivals",
      nav_contact: "Contact",
      nav_about: "About Us",
      search_placeholder: "Search for home products...",
      whatsapp_chat: "Chat Us",
      contact_direct: "Call: 01000000000",
      
      // Footer
      footer_desc: "BIDAYA HOME is your premier destination for high-quality home and household accessories in Egypt, blending luxury, modern design, and affordability.",
      footer_quick_links: "Quick Links",
      footer_categories: "Top Categories",
      footer_contact: "Contact Details",
      footer_copyright: "© 2026 BIDAYA HOME. All rights reserved.",
      footer_privacy: "Privacy Policy",
      footer_terms: "Terms & Conditions",
      footer_address: "Cairo, Egypt",
      
      // Product Card
      card_view_details: "View Details",
      card_add_to_cart: "Add to Cart",
      card_out_of_stock: "Out of Stock",
      card_in_stock: "In Stock",
      badge_discount: "OFF",
      
      // Cart & Checkout General
      cart_title: "Shopping Cart",
      cart_empty: "Your cart is currently empty",
      cart_subtotal: "Subtotal",
      cart_shipping: "Shipping",
      cart_total: "Total",
      cart_checkout: "Proceed to Checkout",
      cart_continue: "Continue Shopping",
      cart_remove: "Remove",
      
      // Checkout Form
      checkout_title: "Shipping & Payment Info",
      checkout_name: "Full Name",
      checkout_phone: "Phone Number",
      checkout_gov: "Governorate",
      checkout_city: "City / Area",
      checkout_address: "Detailed Address",
      checkout_landmark: "Landmark (Optional)",
      checkout_payment: "Payment Method",
      checkout_payment_cod: "Cash on Delivery (COD)",
      checkout_payment_instapay: "InstaPay",
      checkout_payment_wallet: "Mobile Wallet (Vodafone Cash...)",
      checkout_notes: "Additional Order Notes",
      checkout_submit: "Confirm Order via WhatsApp",
      checkout_summary: "Order Summary",
      
      // Validation Alerts
      val_name: "Please enter your full name (at least 3 words)",
      val_phone: "Please enter a valid Egyptian phone number (11 digits)",
      val_gov: "Please select your governorate",
      val_city: "Please enter your city/area",
      val_address: "Please enter your detailed address",
      
      // Toast messages
      toast_added: "Item added to cart successfully!",
      toast_removed: "Item removed from cart.",
      toast_updated: "Quantity updated.",
      toast_order_success: "Order saved! Redirecting to WhatsApp...",
      toast_order_error: "Error saving order. Please try again.",
      
      // Other Pages
      about_title: "About Us",
      about_story_title: "Our Story",
      about_story_desc: "Our journey at BIDAYA HOME started with a simple goal: providing elegant, practical, and highly valuable home accessories for the Egyptian market. We believe every corner of your home deserves aesthetics and durability, leading us to curate only premium household essentials.",
      about_mission: "Our Mission",
      about_mission_desc: "To deliver a seamless, delightful home shopping experience to Egyptian customers, offering high-quality products and fast shipping across Egypt.",
      about_vision: "Our Vision",
      about_vision_desc: "To become the first choice and most trusted brand for Egyptian households looking for style and refinement in modern home accessories.",
      about_why_title: "Why Choose BIDAYA HOME?",
      about_why_1: "Top-tier quality and handpicked materials.",
      about_why_2: "Unbeatable pricing and year-round offers.",
      about_why_3: "Fast and reliable shipping to all Egyptian governorates.",
      about_why_4: "Excellent direct communication and support via WhatsApp.",
      
      contact_title: "Contact Us",
      contact_info_title: "Contact Info",
      contact_form_title: "Send us a message",
      contact_name: "Name",
      contact_email: "Email (Optional)",
      contact_message: "Message",
      contact_submit: "Send Message",
      contact_success: "Your message has been sent! We will reply shortly.",
      
      offers_title: "Hot Offers & Discounts",
      offers_subtitle: "Enjoy exclusive, limited-time discounts on our finest household products",
      offers_ends: "Offer ends in:",
      days: "Days",
      hours: "Hours",
      minutes: "Mins",
      seconds: "Secs",
      
      search_results_for: "Search results for:",
      search_no_results: "No products matched your search.",
      
      filter_title: "Filter Products",
      filter_category: "Category",
      filter_price: "Price Range",
      filter_availability: "Availability",
      filter_all: "All",
      filter_instock: "In Stock Only",
      filter_discount: "On Sale Only",
      sort_title: "Sort By",
      sort_default: "Default",
      sort_newest: "Newest",
      sort_bestselling: "Best Selling",
      sort_price_low: "Price: Low to High",
      sort_price_high: "Price: High to Low",
      
      page_not_found: "Page Not Found",
      page_not_found_desc: "Sorry, the page you are looking for has been moved, deleted, or never existed.",
      back_home: "Back to Home"
    }
  };

  // 2. State & Constants
  let currentLang = localStorage.getItem("bidaya_lang") || "ar";
  const WHATSAPP_NUMBER = "201000000000"; // Target WhatsApp Number for orders

  // Dynamic Relative Paths Finder
  function getPathPrefix() {
    return window.location.pathname.includes("/pages/") ? "../" : "";
  }

  // 3. i18n Localization Engine
  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("bidaya_lang", lang);
    updateDOM();
  }

  function toggleLanguage() {
    setLanguage(currentLang === "ar" ? "en" : "ar");
  }

  function updateDOM() {
    const dir = currentLang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", currentLang);

    // Apply font change dynamically if needed (done via CSS layout)
    
    // Translate text nodes
    document.querySelectorAll("[data-i18n]").forEach(element => {
      const key = element.getAttribute("data-i18n");
      if (TRANSLATIONS[currentLang][key]) {
        element.innerHTML = TRANSLATIONS[currentLang][key];
      }
    });

    // Translate inputs/placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
      const key = element.getAttribute("data-i18n-placeholder");
      if (TRANSLATIONS[currentLang][key]) {
        element.setAttribute("placeholder", TRANSLATIONS[currentLang][key]);
      }
    });

    // Dispatch global language changed event
    window.dispatchEvent(new CustomEvent("langChanged", { detail: { lang: currentLang } }));
  }

  // 4. Cart State Management
  let cart = JSON.parse(localStorage.getItem("bidaya_cart")) || [];

  function saveCart() {
    localStorage.setItem("bidaya_cart", JSON.stringify(cart));
    updateCartBadges();
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { cart } }));
  }

  function addToCart(productId, quantity = 1) {
    const qty = parseInt(quantity);
    const existing = cart.find(item => item.id === productId);
    
    // Double check stock from products registry
    if (window.BIDAYA_DATA) {
      const prod = window.BIDAYA_DATA.products.find(p => p.id === productId);
      if (prod && prod.stock === "out-of-stock") {
        showToast(currentLang === "ar" ? "هذا المنتج غير متوفر حالياً" : "This product is currently out of stock", "danger");
        return;
      }
    }

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id: productId, qty: qty });
    }
    saveCart();
    showToast(TRANSLATIONS[currentLang]["toast_added"], "success");
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    showToast(TRANSLATIONS[currentLang]["toast_removed"], "info");
  }

  function updateCartQty(productId, quantity) {
    const qty = parseInt(quantity);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const item = cart.find(item => item.id === productId);
    if (item) {
      item.qty = qty;
      saveCart();
      showToast(TRANSLATIONS[currentLang]["toast_updated"], "success");
    }
  }

  function clearCart() {
    cart = [];
    saveCart();
  }

  function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function getCartTotal() {
    if (!window.BIDAYA_DATA) return 0;
    return cart.reduce((sum, item) => {
      const prod = window.BIDAYA_DATA.products.find(p => p.id === item.id);
      return sum + (prod ? prod.price * item.qty : 0);
    }, 0);
  }

  function updateCartBadges() {
    const count = getCartCount();
    document.querySelectorAll(".cart-count-badge").forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? "flex" : "none";
    });
  }

  // 5. Toast Notifications System
  function showToast(message, type = "success") {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "fa-check-circle";
    if (type === "danger") icon = "fa-times-circle";
    if (type === "info") icon = "fa-info-circle";

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    
    // Animate In
    setTimeout(() => toast.classList.add("show"), 50);

    // Remove after 3s
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  // 6. Sticky Header, Mobile Sidebar & Dynamic Insertion
  function renderLayout() {
    const prefix = getPathPrefix();
    const isRtl = currentLang === "ar";
    
    // Dynamic Header HTML
    const headerEl = document.getElementById("global-header");
    if (headerEl) {
      headerEl.innerHTML = `
        <div class="container header-container">
          <div class="menu-toggle action-btn" id="mobile-menu-btn">
            <i class="fa-solid fa-bars"></i>
          </div>
          
          <a href="${prefix}index.html" class="logo">
            <i class="fa-solid fa-house-chimney"></i>
            <span data-i18n="logo_text">${TRANSLATIONS[currentLang]["logo_text"]}</span>
          </a>
          
          <form class="search-bar" id="header-search-form">
            <input type="text" id="header-search-input" data-i18n-placeholder="search_placeholder" placeholder="${TRANSLATIONS[currentLang]["search_placeholder"]}">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
          </form>
          
          <div class="header-actions">
            <div class="lang-switch" id="lang-toggle-btn">
              ${currentLang === "ar" ? "EN" : "العربية"}
            </div>
            
            <a href="${prefix}pages/cart.html" class="action-btn">
              <i class="fa-solid fa-shopping-bag"></i>
              <span class="badge cart-count-badge" style="display: none;">0</span>
            </a>
            
            <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" class="action-btn btn-success" style="background-color:#25D366; color:white;">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>
        
        <nav class="nav-bar">
          <div class="container nav-container">
            <ul class="nav-links">
              <li><a href="${prefix}index.html" data-i18n="nav_home" class="${window.location.pathname.endsWith("index.html") || window.location.pathname === "/" ? "active" : ""}">${TRANSLATIONS[currentLang]["nav_home"]}</a></li>
              <li><a href="${prefix}pages/products.html" data-i18n="nav_categories">${TRANSLATIONS[currentLang]["nav_categories"]}</a></li>
              <li><a href="${prefix}pages/offers.html" data-i18n="nav_offers">${TRANSLATIONS[currentLang]["nav_offers"]}</a></li>
              <li><a href="${prefix}pages/products.html?filter=best-sellers" data-i18n="nav_bestsellers">${TRANSLATIONS[currentLang]["nav_bestsellers"]}</a></li>
              <li><a href="${prefix}pages/products.html?filter=new-arrivals" data-i18n="nav_newarrivals">${TRANSLATIONS[currentLang]["nav_newarrivals"]}</a></li>
              <li><a href="${prefix}pages/contact.html" data-i18n="nav_contact" class="${window.location.pathname.endsWith("contact.html") ? "active" : ""}">${TRANSLATIONS[currentLang]["nav_contact"]}</a></li>
            </ul>
            <div class="contact-direct">
              <i class="fa-solid fa-phone"></i>
              <span data-i18n="contact_direct">${TRANSLATIONS[currentLang]["contact_direct"]}</span>
            </div>
          </div>
        </nav>
      `;
    }

    // Dynamic Mobile Navigation Drawer
    let drawer = document.getElementById("mobile-nav-drawer");
    if (!drawer && headerEl) {
      drawer = document.createElement("div");
      drawer.id = "mobile-nav-drawer";
      drawer.className = "mobile-drawer";
      drawer.innerHTML = `
        <div class="drawer-header">
          <a href="${prefix}index.html" class="logo">
            <span data-i18n="logo_text">${TRANSLATIONS[currentLang]["logo_text"]}</span>
          </a>
          <div class="action-btn" id="mobile-drawer-close">
            <i class="fa-solid fa-times"></i>
          </div>
        </div>
        <form class="form-group" id="mobile-search-form" style="margin-bottom: 24px;">
          <input type="text" id="mobile-search-input" class="form-control" data-i18n-placeholder="search_placeholder" placeholder="${TRANSLATIONS[currentLang]["search_placeholder"]}">
        </form>
        <ul class="drawer-links">
          <li><a href="${prefix}index.html" data-i18n="nav_home">${TRANSLATIONS[currentLang]["nav_home"]}</a></li>
          <li><a href="${prefix}pages/products.html" data-i18n="nav_categories">${TRANSLATIONS[currentLang]["nav_categories"]}</a></li>
          <li><a href="${prefix}pages/offers.html" data-i18n="nav_offers">${TRANSLATIONS[currentLang]["nav_offers"]}</a></li>
          <li><a href="${prefix}pages/products.html?filter=best-sellers" data-i18n="nav_bestsellers">${TRANSLATIONS[currentLang]["nav_bestsellers"]}</a></li>
          <li><a href="${prefix}pages/products.html?filter=new-arrivals" data-i18n="nav_newarrivals">${TRANSLATIONS[currentLang]["nav_newarrivals"]}</a></li>
          <li><a href="${prefix}pages/about.html" data-i18n="nav_about">${TRANSLATIONS[currentLang]["nav_about"]}</a></li>
          <li><a href="${prefix}pages/contact.html" data-i18n="nav_contact">${TRANSLATIONS[currentLang]["nav_contact"]}</a></li>
        </ul>
      `;
      document.body.appendChild(drawer);

      const overlay = document.createElement("div");
      overlay.id = "mobile-drawer-overlay";
      overlay.className = "drawer-overlay";
      document.body.appendChild(overlay);
    }

    // Dynamic Footer HTML
    const footerEl = document.getElementById("global-footer");
    if (footerEl) {
      footerEl.innerHTML = `
        <div class="container">
          <div class="footer-top">
            <div>
              <a href="${prefix}index.html" class="logo" style="color:white; margin-bottom: 20px;">
                <span data-i18n="logo_text">${TRANSLATIONS[currentLang]["logo_text"]}</span>
              </a>
              <p class="footer-desc" data-i18n="footer_desc">${TRANSLATIONS[currentLang]["footer_desc"]}</p>
              <div class="footer-socials">
                <a href="https://facebook.com" target="_blank" class="social-icon"><i class="fa-brands fa-facebook-f"></i></a>
                <a href="https://instagram.com" target="_blank" class="social-icon"><i class="fa-brands fa-instagram"></i></a>
                <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" class="social-icon"><i class="fa-brands fa-whatsapp"></i></a>
              </div>
            </div>
            
            <div>
              <h4 class="footer-title" data-i18n="footer_quick_links">${TRANSLATIONS[currentLang]["footer_quick_links"]}</h4>
              <ul class="footer-links">
                <li><a href="${prefix}index.html" data-i18n="nav_home">${TRANSLATIONS[currentLang]["nav_home"]}</a></li>
                <li><a href="${prefix}pages/about.html" data-i18n="nav_about">${TRANSLATIONS[currentLang]["nav_about"]}</a></li>
                <li><a href="${prefix}pages/contact.html" data-i18n="nav_contact">${TRANSLATIONS[currentLang]["nav_contact"]}</a></li>
                <li><a href="${prefix}pages/offers.html" data-i18n="nav_offers">${TRANSLATIONS[currentLang]["nav_offers"]}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 class="footer-title" data-i18n="footer_categories">${TRANSLATIONS[currentLang]["footer_categories"]}</h4>
              <ul class="footer-links">
                <li><a href="${prefix}pages/products.html?category=living-room" data-i18n="nav_categories">Living Room</a></li>
                <li><a href="${prefix}pages/products.html?category=bedroom" data-i18n="nav_categories">Bedroom</a></li>
                <li><a href="${prefix}pages/products.html?category=kitchen" data-i18n="nav_categories">Kitchen & Dining</a></li>
                <li><a href="${prefix}pages/products.html?category=decor" data-i18n="nav_categories">Decor & Lighting</a></li>
              </ul>
            </div>
            
            <div>
              <h4 class="footer-title" data-i18n="footer_contact">${TRANSLATIONS[currentLang]["footer_contact"]}</h4>
              <ul class="footer-contact-info">
                <li>
                  <i class="fa-solid fa-location-dot"></i>
                  <span data-i18n="footer_address">${TRANSLATIONS[currentLang]["footer_address"]}</span>
                </li>
                <li>
                  <i class="fa-solid fa-phone"></i>
                  <span>01000000000</span>
                </li>
                <li>
                  <i class="fa-solid fa-envelope"></i>
                  <span>info@bidayahome.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div class="footer-bottom">
            <p data-i18n="footer_copyright">${TRANSLATIONS[currentLang]["footer_copyright"]}</p>
            <div class="footer-bottom-links">
              <a href="${prefix}pages/privacy.html" data-i18n="footer_privacy">${TRANSLATIONS[currentLang]["footer_privacy"]}</a>
              <a href="${prefix}pages/terms.html" data-i18n="footer_terms">${TRANSLATIONS[currentLang]["footer_terms"]}</a>
            </div>
          </div>
        </div>
      `;
    }

    // Dynamic Floating elements
    let floatingContainer = document.querySelector(".floating-container");
    if (!floatingContainer) {
      floatingContainer = document.createElement("div");
      floatingContainer.className = "floating-container";
      floatingContainer.innerHTML = `
        <div class="floating-btn floating-backtop" id="back-to-top-btn">
          <i class="fa-solid fa-arrow-up"></i>
        </div>
        <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" class="floating-btn floating-whatsapp">
          <i class="fa-brands fa-whatsapp"></i>
        </a>
      `;
      document.body.appendChild(floatingContainer);
    }

    setupEvents();
    updateCartBadges();
  }

  function setupEvents() {
    const prefix = getPathPrefix();
    
    // Language Switcher
    const langBtn = document.getElementById("lang-toggle-btn");
    if (langBtn) {
      langBtn.addEventListener("click", toggleLanguage);
    }

    // Sticky header
    window.addEventListener("scroll", () => {
      const header = document.querySelector("header");
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }

      // Back to Top button
      const backTop = document.getElementById("back-to-top-btn");
      if (backTop) {
        if (window.scrollY > 300) {
          backTop.classList.add("show");
        } else {
          backTop.classList.remove("show");
        }
      }
    });

    const backTop = document.getElementById("back-to-top-btn");
    if (backTop) {
      backTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // Mobile navigation controls
    const menuBtn = document.getElementById("mobile-menu-btn");
    const drawer = document.getElementById("mobile-nav-drawer");
    const overlay = document.getElementById("mobile-drawer-overlay");
    const closeBtn = document.getElementById("mobile-drawer-close");

    if (menuBtn && drawer && overlay) {
      menuBtn.addEventListener("click", () => {
        drawer.classList.add("open");
        overlay.classList.add("open");
      });

      const closeDrawer = () => {
        drawer.classList.remove("open");
        overlay.classList.remove("open");
      };

      closeBtn.addEventListener("click", closeDrawer);
      overlay.addEventListener("click", closeDrawer);
    }

    // Search routing logic
    const handleSearchSubmit = (inputSelector) => {
      const searchInput = document.querySelector(inputSelector);
      if (searchInput && searchInput.value.trim() !== "") {
        const query = encodeURIComponent(searchInput.value.trim());
        window.location.href = `${prefix}pages/search.html?q=${query}`;
      }
    };

    const headerSearch = document.getElementById("header-search-form");
    if (headerSearch) {
      headerSearch.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSearchSubmit("#header-search-input");
      });
    }

    const mobileSearch = document.getElementById("mobile-search-form");
    if (mobileSearch) {
      mobileSearch.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSearchSubmit("#mobile-search-input");
      });
    }
  }

  // 7. Page Load Initializer
  document.addEventListener("DOMContentLoaded", () => {
    renderLayout();
    updateDOM();
  });

  // Expose API globally
  window.BIDAYA_APP = {
    currentLang: () => currentLang,
    translations: TRANSLATIONS,
    setLanguage,
    toggleLanguage,
    showToast,
    whatsappNumber: WHATSAPP_NUMBER,
    
    // Cart operations
    cart: {
      get: () => cart,
      add: addToCart,
      remove: removeFromCart,
      updateQty: updateCartQty,
      clear: clearCart,
      count: getCartCount,
      total: getCartTotal
    }
  };
})();
