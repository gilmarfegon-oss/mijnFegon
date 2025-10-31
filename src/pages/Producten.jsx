import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import "../styles/theme.css";

export default function Producten() {
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
    <div className="container">
      <div className="card">
        <h2>📦 Mijn Producten</h2>
        <form onSubmit={voegToe} className="grid" style={{ gap: "0.75rem" }}>
          <input
            placeholder="Productnaam"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
          />
          <input
            placeholder="Punten"
            type="number"
            value={punten}
            onChange={(e) => setPunten(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Toevoegen
          </button>
        </form>

        <ul>
          {producten.map((p, index) => (
            <li key={`${p.naam}-${index}`} style={{ margin: "0.5rem 0" }}>
              {p.naam} — {p.punten} punten
              <button
                className="btn btn-danger"
                style={{ marginLeft: "1rem" }}
                onClick={() => verwijder(index)}
              >
                Verwijder
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
