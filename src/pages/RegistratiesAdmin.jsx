import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import AppShell from "../components/AppShell";
import { db } from "../firebase";
import "../styles/theme.css";

export default function RegistratiesAdmin({ user, role }) {
  const [registraties, setRegistraties] = useState([]);
  const [filter, setFilter] = useState("all");
  const [reason, setReason] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "registrations"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRegistraties(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleApprove(id, reg) {
    setFeedback("");
    try {
      const puntenRef = doc(db, "punten", reg.installer_uid);
      const puntenSnap = await getDoc(puntenRef);
      const huidigeSaldo = puntenSnap.exists() ? puntenSnap.data().totaal || 0 : 0;
      const nieuweSaldo = huidigeSaldo + (reg.points || 0);

      await setDoc(puntenRef, { totaal: nieuweSaldo }, { merge: true });

      const userRef = doc(db, "users", reg.installer_uid);
      const uSnap = await getDoc(userRef);
      if (uSnap.exists()) {
        const u = uSnap.data();
        const newPoints = (u.points_total || 0) + (reg.points || 0);
        await updateDoc(userRef, { points_total: newPoints });
      }
      await updateDoc(doc(db, "registrations", id), { status: "approved" });
      setFeedback(`✅ Registratie voor ${reg.installer_email || "installateur"} is goedgekeurd.`);
    } catch (err) {
      console.error(err);
      setFeedback("❌ Fout bij goedkeuren van registratie.");
    }
  }

  async function handleReject(id, reg) {
    setFeedback("");
    try {
      const reden = reason[id] || "Afgekeurd door admin.";
      await updateDoc(doc(db, "registrations", id), {
        status: "rejected",
        reject_reason: reden,
      });
      setFeedback(`❌ Registratie van ${reg.installer_email || "installateur"} afgekeurd.`);
    } catch (err) {
      console.error(err);
      setFeedback("❌ Fout bij afkeuren van registratie.");
    }
  }

  const filtered =
    filter === "all"
      ? registraties
      : registraties.filter((r) => r.status === filter);

  return (
    <AppShell
      user={user}
      role={role}
      title="Registratiebeheer"
      kicker="Controle & toekenning"
      description="Beoordeel ingediende registraties, keur punten goed en voeg optioneel een feedbackbericht toe voor afwijzingen."
    >
      <section className="card">
        <div className="section-header">
          <div>
            <h2>Openstaande registraties</h2>
            <p className="text-muted">
              Gebruik de filter om snel pendende, afgekeurde of afgeronde aanvragen te vinden.
            </p>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Alle statussen</option>
            <option value="pending">In afwachting</option>
            <option value="approved">Goedgekeurd</option>
            <option value="rejected">Afgekeurd</option>
          </select>
        </div>

        {feedback && (
          <div
            className={`alert ${feedback.startsWith("✅") ? "alert-success" : "alert-error"}`}
            style={{ marginBottom: "1rem" }}
          >
            {feedback}
          </div>
        )}

        {loading ? (
          <div className="empty-state">Registraties laden...</div>
        ) : (
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Installateur</th>
                  <th>Product</th>
                  <th>Serienummer</th>
                  <th>Status</th>
                  <th>Punten</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="center text-muted">
                      Geen registraties gevonden voor deze filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id}>
                      <td>{r.installer_email || "-"}</td>
                      <td>{r.productMerk || "-"}</td>
                      <td>{r.serienummer || "-"}</td>
                      <td>
                        <span className={`pill pill-${r.status || "pending"}`}>
                          {r.status || "pending"}
                        </span>
                      </td>
                      <td>{r.points || 0}</td>
                      <td>
                        {r.status === "pending" ? (
                          <div className="activity-item__meta" style={{ gap: "0.5rem" }}>
                            <div className="table-actions">
                              <button
                                className="btn btn-success"
                                onClick={() => handleApprove(r.id, r)}
                              >
                                Goedkeuren
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleReject(r.id, r)}
                              >
                                Afkeuren
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Reden afkeuring (optioneel)"
                              value={reason[r.id] || ""}
                              onChange={(e) =>
                                setReason({ ...reason, [r.id]: e.target.value })
                              }
                            />
                          </div>
                        ) : r.status === "rejected" ? (
                          <span className="text-muted">
                            Afgekeurd: {r.reject_reason || "-"}
                          </span>
                        ) : (
                          <strong className="text-muted">Goedgekeurd</strong>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
