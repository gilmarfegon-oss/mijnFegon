import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjxjmYzmbSbfUneXaxEKmewWoSfwF8Ld30",
  authDomain: "mijnfegon.firebaseapp.com",
  projectId: "mijnfegon",
  storageBucket: "mijnfegon.appspot.com",
  messagingSenderId: "415529097955",
  appId: "1:415529097955:web:da03af79ae2888a58a83d6"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
