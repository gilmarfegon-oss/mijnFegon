import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import AppShell from "../components/AppShell";
import "../styles/theme.css";

export default function Producten({ user, role }) {
  const [naam, setNaam] = useState("");
  const [punten, setPunten] = useState("");
  const [producten, setProducten] = useState([]);

  async function laadProducten() {
    if (!auth.currentUser) return;
    const ref = doc(db, "users", auth.currentUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setProducten(snap.data().producten || []);
    }
  }

  useEffect(() => {
    laadProducten();
  }, []);

  async function voegToe(e) {
    e.preventDefault();
    if (!naam || !punten) return alert("Vul een naam en punten in!");
    const nieuw = { naam, punten: Number(punten) };
    const ref = doc(db, "users", auth.currentUser.uid);
    await setDoc(
      ref,
      {
        producten: [...producten, nieuw],
      },
      { merge: true }
    );
    setProducten((prev) => [...prev, nieuw]);
    setNaam("");
    setPunten("");
  }

  async function verwijder(idx) {
    const bijgewerkt = producten.filter((_, i) => i !== idx);
    const ref = doc(db, "users", auth.currentUser.uid);
    await updateDoc(ref, { producten: bijgewerkt });
    setProducten(bijgewerkt);
  }

  return (
    <AppShell
      user={user}
      role={role}
      title="Mijn producten"
      kicker="Persoonlijke catalogus"
      description="Bewaar veelgebruikte producten inclusief puntenwaardes en voeg ze eenvoudig toe aan nieuwe registraties."
    >
      <section className="card">
        <div className="section-header">
          <div>
            <h2>Product toevoegen</h2>
            <p className="text-muted">Leg je favoriete producten vast voor snelle registratie.</p>
          </div>
        </div>
        <form onSubmit={voegToe} className="form-grid" style={{ gap: "1rem" }}>
          <div className="form-row">
            <div>
              <label htmlFor="product-naam">Productnaam</label>
              <input
                id="product-naam"
                placeholder="Productnaam"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="product-punten">Punten</label>
              <input
                id="product-punten"
                placeholder="Punten"
                type="number"
                value={punten}
                onChange={(e) => setPunten(e.target.value)}
                required
                min="0"
              />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" style={{ justifySelf: "start" }}>
            Toevoegen
          </button>
        </form>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Opgeslagen producten</h2>
        </div>
        {producten.length === 0 ? (
          <div className="empty-state">Je hebt nog geen producten opgeslagen.</div>
        ) : (
          <div className="activity-list">
            {producten.map((p, index) => (
              <div key={`${p.naam}-${index}`} className="activity-item">
                <div className="activity-item__meta">
                  <span className="activity-item__title">{p.naam}</span>
                  <span className="activity-item__subtitle">{p.punten} punten</span>
                </div>
                <button className="btn btn-danger" onClick={() => verwijder(index)}>
                  Verwijderen
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
