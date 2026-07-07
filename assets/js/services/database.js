/**
 * BIDAYA HOME - Firestore Database Service
 * Firebase v9 Modular SDK with localStorage fallback.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "../../../firebase/firebase-config.js";
import { ORDERS_STORAGE_KEY } from "../config/constants.js";

/** @type {import('firebase/firestore').Firestore|null} */
let db = null;
let isFirebaseEnabled = false;

if (isFirebaseConfigured()) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseEnabled = true;
    console.info("Firebase initialized successfully.");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.info("Firebase keys not configured. Using localStorage fallback.");
}

/**
 * @param {object} order
 */
function saveToLocalStorageFallback(order) {
  try {
    const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || [];
    orders.push(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error("LocalStorage order save failed:", error);
  }
}

/**
 * Saves a customer order to Firestore or localStorage fallback.
 * @param {object} orderData
 * @returns {Promise<string>} Order ID
 */
export async function saveOrder(orderData) {
  const enrichedOrder = {
    ...orderData,
    createdAt: new Date().toISOString(),
    orderId: `BHome-${Date.now()}${Math.floor(Math.random() * 1000)}`
  };

  if (isFirebaseEnabled && db) {
    try {
      const docRef = await addDoc(collection(db, "orders"), enrichedOrder);
      console.info("Order saved to Firestore:", docRef.id);
      return enrichedOrder.orderId;
    } catch (error) {
      console.error("Firestore save error:", error);
      saveToLocalStorageFallback(enrichedOrder);
      return enrichedOrder.orderId;
    }
  }

  saveToLocalStorageFallback(enrichedOrder);
  await new Promise((resolve) => setTimeout(resolve, 800));
  return enrichedOrder.orderId;
}

/** @returns {boolean} */
export function isFirebaseActive() {
  return isFirebaseEnabled;
}
