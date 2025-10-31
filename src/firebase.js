import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Zie docs/firebase-setup.md voor uitgebreide uitleg over het invullen van deze configuratie.

const defaultConfig = {
  apiKey: "AIzaSyAjxmYzmbSbfUneXaxEKmewWoSfwF8Ld30",
  authDomain: "mijnfegon.firebaseapp.com",
  projectId: "mijnfegon",
  storageBucket: "mijnfegon.firebasestorage.app",
  messagingSenderId: "415529097955",
  appId: "1:415529097955:web:da03af79ae2888a58a83d6",
};

function sanitize(value) {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    return undefined;
  }
  return trimmed;
}

const envOverrides = {
  apiKey: sanitize(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: sanitize(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: sanitize(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: sanitize(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitize(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitize(import.meta.env.VITE_FIREBASE_APP_ID),
};

const firebaseConfig = { ...defaultConfig };
for (const [key, value] of Object.entries(envOverrides)) {
  if (value) {
    firebaseConfig[key] = value;
  }
}

const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  const message = `Firebase configuratie mist waarden voor: ${missingKeys.join(", ")}. ` +
    "Controleer je .env bestand of gebruik de standaardwaarden uit src/firebase.js.";
  throw new Error(message);
}

if (!firebaseConfig.apiKey.startsWith("AIza")) {
  console.warn(
    "De ingestelde Firebase API key lijkt ongeldig. Controleer of je de juiste sleutel hebt gekopieerd uit het Firebase project."
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
export { app };
