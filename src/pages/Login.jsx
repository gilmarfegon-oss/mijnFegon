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

  async function handleEmailAuth() {
    if (!email || !password) return alert("Vul e-mail en wachtwoord in.");
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
    <div className="container" style={s.wrapper}>
      <div className="card" style={s.card}>
        <h1 style={s.title}>{isLogin ? "Inloggen" : "Registreren"}</h1>
        <p className="text-muted" style={{ marginBottom: "1rem" }}>
          {isLogin
            ? "Log in met je e-mail of Google-account."
            : "Maak een nieuw account aan als installateur."}
        </p>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={s.input}
        />
        <input
          type="password"
          placeholder="Wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={s.input}
        />

        <button
          className="btn btn-primary"
          onClick={handleEmailAuth}
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading
            ? "Bezig..."
            : isLogin
            ? "Inloggen"
            : "Account aanmaken"}
        </button>

        <button
          className="btn"
          onClick={handleGoogle}
          style={s.google}
          disabled={loading}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            width="18"
            style={{ marginRight: "8px" }}
          />
          Inloggen met Google
        </button>

        <p style={s.switch} onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Nog geen account? Registreren"
            : "Al een account? Log in"}
        </p>

        {error && <p style={s.error}>⚠️ {error}</p>}
      </div>
    </div>
  );
}

const s = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
  card: {
    maxWidth: "380px",
    textAlign: "center",
  },
  title: {
    marginBottom: "1rem",
    color: "#002b5c",
  },
  input: {
    marginBottom: "0.8rem",
  },
  google: {
    background: "#fff",
    border: "1px solid #ddd",
    color: "#444",
    width: "100%",
    marginTop: "0.6rem",
    fontWeight: "600",
  },
  switch: {
    marginTop: "1rem",
    color: "#0066ff",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "1rem",
  },
};
