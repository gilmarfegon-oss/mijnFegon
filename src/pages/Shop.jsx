import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import AppShell from "../components/AppShell";
import "../styles/theme.css";

export default function Shop({ user, role }) {
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

  return (
    <AppShell
      user={user}
      role={role}
      title="MijnFegon Shop"
      kicker="Verdien & verzilver"
      description="Bestel beloningen met je verdiende punten. Je saldo werkt realtime bij na elke aankoop."
    >
      <section className="card">
        <div className="section-header">
          <div>
            <h2>Puntensaldo</h2>
            <p className="text-muted">
              Je hebt op dit moment <strong>{saldo}</strong> punten beschikbaar.
            </p>
          </div>
        </div>
        <div className="stat-grid">
          <article className="stat-card">
            <h3>Beschikbaar saldo</h3>
            <p className="stat-card__value">{saldo}</p>
            <p className="stat-card__meta">Gebruik je punten direct voor een beloning</p>
          </article>
          <article className="stat-card">
            <h3>Nieuwste producten</h3>
            <p className="stat-card__value">{producten.length}</p>
            <p className="stat-card__meta">In de shop beschikbaar</p>
          </article>
        </div>
      </section>

      {msg && (
        <div
          className={`alert ${msg.startsWith("✅") ? "alert-success" : "alert-error"}`}
        >
          {msg}
        </div>
      )}

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Beschikbare beloningen</h2>
            <p className="text-muted">
              Kies uit het aanbod en wissel je punten direct in.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Producten laden...</div>
        ) : producten.length === 0 ? (
          <div className="empty-state">
            Er zijn momenteel geen producten beschikbaar. Kom later nog eens terug.
          </div>
        ) : (
          <div className="grid grid-3">
            {producten.map((p) => (
              <article key={p.id} className="card product-card">
                {p.image && <img src={p.image} alt={p.name} />}
                <h3 style={{ marginTop: 0 }}>{p.name}</h3>
                <p className="product-description">
                  {p.description || "Geen beschrijving beschikbaar."}
                </p>
                <p style={{ fontWeight: 700, fontSize: "1.05rem" }}>{p.points} punten</p>
                <button
                  className="btn btn-primary"
                  onClick={() => koopProduct(p)}
                  disabled={saldo < p.points}
                >
                  {saldo < p.points ? "Te weinig punten" : "Bestel"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
