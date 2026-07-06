// BIDAYA HOME - Firebase Configuration & Database Access Layer
(function () {
  // Replace these placeholders with your actual Firebase config keys
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  let db = null;
  let isFirebaseEnabled = false;

  // Check if credentials are set (not starting with default "YOUR_")
  const isConfigValid = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_");

  if (isConfigValid) {
    try {
      // Initialize Firebase (Assuming Firebase Compat libraries are imported via script tags)
      if (typeof firebase !== 'undefined') {
        const app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore(app);
        isFirebaseEnabled = true;
        console.log("✔ Firebase initialized successfully.");
      } else {
        console.warn("⚠ Firebase libraries not loaded. Operating in LocalStorage fallback mode.");
      }
    } catch (error) {
      console.error("❌ Error initializing Firebase:", error);
    }
  } else {
    console.log("ℹ Firebase keys not configured. Operating in LocalStorage database fallback mode.");
  }

  /**
   * Saves customer order to the database.
   * Falls back to localStorage if Firestore is not available.
   * @param {Object} orderData - Customer & items details
   * @returns {Promise<string>} - Resolves with order identifier
   */
  function saveOrderToDatabase(orderData) {
    return new Promise((resolve, reject) => {
      // Enrich order data with metadata
      const enrichedOrder = {
        ...orderData,
        createdAt: new Date().toISOString(),
        orderId: "BHome-" + Date.now() + Math.floor(Math.random() * 1000)
      };

      if (isFirebaseEnabled && db) {
        // Save to Firestore 'orders' collection
        db.collection("orders").add(enrichedOrder)
          .then((docRef) => {
            console.log("✔ Order saved to Firestore with ID: ", docRef.id);
            resolve(enrichedOrder.orderId);
          })
          .catch((error) => {
            console.error("❌ Firestore save error: ", error);
            // Attempt localStorage fallback on failure
            saveToLocalStorageFallback(enrichedOrder);
            resolve(enrichedOrder.orderId);
          });
      } else {
        // Save to LocalStorage fallback
        saveToLocalStorageFallback(enrichedOrder);
        // Simulate minor network lag for a realistic UI loader
        setTimeout(() => {
          resolve(enrichedOrder.orderId);
        }, 800);
      }
    });
  }

  function saveToLocalStorageFallback(order) {
    try {
      const orders = JSON.parse(localStorage.getItem("bidaya_orders")) || [];
      orders.push(order);
      localStorage.setItem("bidaya_orders", JSON.stringify(orders));
      console.log("✔ Order saved to LocalStorage Fallback DB:", order);
    } catch (e) {
      console.error("❌ LocalStorage write failed:", e);
    }
  }

  // Expose database functions globally
  window.BIDAYA_DB = {
    isFirebaseEnabled: () => isFirebaseEnabled,
    saveOrder: saveOrderToDatabase
  };
})();
