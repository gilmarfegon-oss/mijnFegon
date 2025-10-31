import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import "../styles/theme.css";

export default function Dashboard({ user, role, userData }) {
  const [punten, setPunten] = useState(0);
  const [pendingPunten, setPendingPunten] = useState(0);
  const [registraties, setRegistraties] = useState([]);
  const [laatsteLogin, setLaatsteLogin] = useState(null);
  const [gebruikersAantal, setGebruikersAantal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const puntenRef = doc(db, "punten", user.uid);
    const unsubPunten = onSnapshot(puntenRef, (snap) => {
      if (snap.exists()) {
        setPunten(snap.data().totaal || 0);
        setPendingPunten(snap.data().in_afwachting || 0);
      } else {
        setPunten(0);
        setPendingPunten(0);
      }
    });

    const q = query(
      collection(db, "registrations"),
      where("installer_uid", "==", user.uid)
    );
    const unsubRegs = onSnapshot(q, (snapshot) => {
      setRegistraties(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    setLaatsteLogin(user?.metadata?.lastSignInTime || "Onbekend");

    let unsubUsers;
    if (role === "admin") {
      unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        setGebruikersAantal(snap.size);
      });
    }

    return () => {
      unsubPunten();
      unsubRegs();
      if (unsubUsers) unsubUsers();
    };
  }, [user, role]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const goedgekeurd = registraties.filter((r) => r.status === "approved").length;
  const afwachting = registraties.filter((r) => r.status === "pending").length;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1>Welkom, {userData?.installer_full_name || userData?.email}</h1>
          <p>
            Laatste login: {laatsteLogin ? new Date(laatsteLogin).toLocaleString("nl-NL") : "Onbekend"}
          </p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Uitloggen
        </button>
      </header>

      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <h3>💎 Beschikbare punten</h3>
          <p style={styles.points}>{punten}</p>
        </div>

        <div style={styles.card}>
          <h3>⏳ Punten in afwachting</h3>
          <p style={styles.points}>{pendingPunten}</p>
        </div>

        <div style={styles.card}>
          <h3>🧾 Registraties</h3>
          <p style={styles.points}>{registraties.length}</p>
          <small>
            ✅ {goedgekeurd} goedgekeurd / ⏳ {afwachting} in afwachting
          </small>
        </div>

        {role === "admin" && (
          <div style={styles.card}>
            <h3>👥 Aantal gebruikers</h3>
            <p style={styles.points}>{gebruikersAantal}</p>
          </div>
        )}
      </div>

      <div style={styles.actions}>
        <Link to="/registratie" style={styles.button}>
          ➕ Nieuwe registratie
        </Link>

        {role === "admin" && (
          <>
            <Link to="/admin" style={styles.button}>
              ⚙️ Adminpaneel
            </Link>
            <Link to="/shop-admin" style={styles.button}>
              🛒 Shop beheren
            </Link>
          </>
        )}

        <Link to="/shop" style={styles.buttonOutline}>
          🛍️ Naar de Shop
        </Link>
        <Link to="/instellingen" style={styles.buttonOutline}>
          ⚙️ Instellingen
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "system-ui, sans-serif",
    padding: "2rem",
    background: "#f4f6fb",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    background: "white",
    padding: "1rem 1.5rem",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  card: {
    background: "white",
    borderRadius: 12,
    padding: "1.5rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  points: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#0066ff",
    margin: "0.5rem 0",
  },
  button: {
    background: "#0066ff",
    color: "#fff",
    textDecoration: "none",
    padding: "0.75rem 1.2rem",
    borderRadius: 8,
    fontWeight: "bold",
    transition: "0.2s",
  },
  buttonOutline: {
    background: "transparent",
    color: "#0066ff",
    textDecoration: "none",
    padding: "0.75rem 1.2rem",
    border: "2px solid #0066ff",
    borderRadius: 8,
    fontWeight: "bold",
    transition: "0.2s",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
  },
  logoutBtn: {
    background: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "0.5rem 1rem",
    cursor: "pointer",
  },
};
