import { auth } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

export function checkAuth() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location = "index.html";
    } else {
      document.getElementById("userName").innerText = user.displayName || user.email;
    }
  });
}

export function logout() {
  signOut(auth);
}
