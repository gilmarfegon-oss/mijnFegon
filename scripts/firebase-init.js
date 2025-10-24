// scripts/firebase-init.js
// ---------------------------------------------
// Centrale Firebase-initialisatie voor MijnFegon
// ---------------------------------------------

// Firebase SDK-imports (v11)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ✅ Correcte configuratie uit Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAjxjmYzmbSbfUneXaxEKmewWoSfwF8Ld30",
  authDomain: "mijnfegon.firebaseapp.com",
  projectId: "mijnfegon",
  storageBucket: "mijnfegon.appspot.com", // ← vaste, juiste waarde
  messagingSenderId: "415529097955",
  appId: "1:415529097955:web:da03af79ae2888a58a83d6"
};

// 🔧 Initialiseer Firebase
const app = initializeApp(firebaseConfig);

// 🔑 Exporteer Auth & Firestore instanties
export const auth = getAuth(app);
export const db = getFirestore(app);

// (optioneel) Debug-uitvoer bij laden
console.log("✅ Firebase geladen voor project:", firebaseConfig.projectId);
