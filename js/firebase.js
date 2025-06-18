// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPQex4B1CLc7SqTyuyE4CladVeKBG2se0",
  authDomain: "smart-meal-planer.firebaseapp.com",
  projectId: "smart-meal-planer",
  storageBucket: "smart-meal-planer.firebasestorage.app",
  messagingSenderId: "910435130398",
  appId: "1:910435130398:web:5223a758c7bacee1a6620f",
  measurementId: "G-FQBBHRP28Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
