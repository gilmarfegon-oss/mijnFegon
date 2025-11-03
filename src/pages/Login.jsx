import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "../styles/theme.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailAuth(event) {
    event.preventDefault();
    if (!email || !password) {
      setError("Vul e-mail en wachtwoord in.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          email: res.user.email,
          role: "user",
          points_total: 0,
          points_pending: 0,
          createdAt: new Date(),
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError("");
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const ref = doc(db, "users", res.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: res.user.uid,
          email: res.user.email,
          role: "user",
          points_total: 0,
          points_pending: 0,
          createdAt: new Date(),
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell" style={{ background: "linear-gradient(120deg, #0f1f47 0%, #0052cc 100%)" }}>
      <div className="auth-card">
        <div className="center">
          <div className="app-shell__logo" style={{ margin: "0 auto 1.25rem" }}>
            <span>F</span>
          </div>
          <h1>{isLogin ? "Inloggen" : "Account aanmaken"}</h1>
          <p className="text-muted" style={{ marginBottom: "1rem" }}>
            {isLogin
              ? "Log in met je e-mail of Google-account en ga direct aan de slag."
              : "Maak een nieuw account aan als installateur en spaar punten."}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="form-grid" style={{ gap: "1rem" }}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Bezig..." : isLogin ? "Inloggen" : "Account aanmaken"}
          </button>
        </form>

        <button
          className="btn btn-secondary"
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          style={{ width: "100%" }}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            width="18"
            style={{ marginRight: "8px" }}
          />
          Inloggen met Google
        </button>

        <p className="auth-switch" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Nog geen account? Registreren" : "Al een account? Log in"}
        </p>

        {error && <p className="auth-error">⚠️ {error}</p>}
      </div>
    </div>
  );
}
