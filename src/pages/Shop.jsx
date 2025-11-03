import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import "../styles/theme.css";

export default function Shop({ user }) {
  const [producten, setProducten] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "shop"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducten(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "punten", user.uid), (snap) => {
      setSaldo(snap.exists() ? snap.data().totaal || 0 : 0);
    });
    return () => unsub();
  }, [user]);

  async function koopProduct(p) {
    setMsg("");
    try {
      await runTransaction(db, async (tx) => {
        const saldoRef = doc(db, "punten", user.uid);
        const saldoSnap = await tx.get(saldoRef);
        const huidig = saldoSnap.exists() ? saldoSnap.data().totaal || 0 : 0;

        if (huidig < p.points) {
          throw new Error("Onvoldoende punten");
        }

        tx.set(saldoRef, { totaal: huidig - p.points }, { merge: true });

        const purchasesCol = collection(db, "purchases");
        const purchaseRef = doc(purchasesCol);
        tx.set(purchaseRef, {
          user_uid: user.uid,
          user_email: user.email,
          product_id: p.id,
          product_name: p.name,
          points_spent: p.points,
          purchasedAt: serverTimestamp(),
        });
      });

      setMsg(`✅ Je hebt "${p.name}" gekocht!`);
    } catch (err) {
      setMsg(`❌ Aankoop mislukt: ${err.message}`);
      console.error(err);
    }
  }

  if (loading) return <div className="container center">⏳ Laden...</div>;

  return (
    <div className="container">
      <nav className="app-nav">
        <Link to="/dashboard">← Terug</Link>
        <Link to="/instellingen">Instellingen</Link>
        <button
          className="btn btn-danger"
          onClick={() => signOut(auth)}
          style={{ marginLeft: "auto" }}
        >
          Uitloggen
        </button>
      </nav>

      <h1>🛍️ Fegon Shop</h1>
      <div className="card center" style={{ marginBottom: "1rem" }}>
        <h2>Je saldo: {saldo} punten</h2>
      </div>

      {msg && (
        <div
          className={`alert ${
            msg.startsWith("✅") ? "alert-success" : "alert-error"
          }`}
          style={{ marginBottom: "1rem" }}
        >
          {msg}
        </div>
      )}

      {producten.length === 0 ? (
        <p>Er zijn nog geen producten beschikbaar.</p>
      ) : (
        <div className="grid grid-3">
          {producten.map((p) => (
            <div key={p.id} className="card center">
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  width="92"
                  height="92"
                  style={{
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                />
              )}
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p>
                <strong>{p.points} punten</strong>
              </p>
              <button
                className="btn btn-primary"
                onClick={() => koopProduct(p)}
                disabled={saldo < p.points}
              >
                {saldo < p.points ? "Te weinig punten" : "Koop product"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
