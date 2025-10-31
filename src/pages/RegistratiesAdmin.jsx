import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import "../styles/theme.css";

export default function RegistratiesAdmin({ user }) {
  const [registraties, setRegistraties] = useState([]);
  const [filter, setFilter] = useState("all");
  const [reason, setReason] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "registrations"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRegistraties(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleApprove(id, reg) {
    try {
      const userRef = doc(db, "users", reg.installer_uid);
      const uSnap = await getDoc(userRef);
      if (uSnap.exists()) {
        const u = uSnap.data();
        const newPoints = (u.points_total || 0) + (reg.points || 0);
        await updateDoc(userRef, { points_total: newPoints });
      }
      await updateDoc(doc(db, "registrations", id), { status: "approved" });
    } catch (err) {
      console.error(err);
      alert("❌ Fout bij goedkeuren");
    }
  }

  async function handleReject(id, reg) {
    try {
      const reden = reason[id] || "Afgekeurd door admin.";
      await updateDoc(doc(db, "registrations", id), {
        status: "rejected",
        reject_reason: reden,
      });
      alert("Registratie afgekeurd.");
    } catch (err) {
      console.error(err);
      alert("❌ Fout bij afkeuren");
    }
  }

  const filtered =
    filter === "all"
      ? registraties
      : registraties.filter((r) => r.status === filter);

  if (loading) return <div className="container center">⏳ Laden...</div>;

  return (
    <div className="container">
      <nav className="app-nav">
        <Link to="/admin">← Terug</Link>
        <button
          onClick={() => signOut(auth)}
          className="btn btn-danger"
          style={{ marginLeft: "auto" }}
        >
          Uitloggen
        </button>
      </nav>

      <h1>📋 Registratiebeheer</h1>
      <p className="text-muted" style={{ marginBottom: "1rem" }}>
        Keur registraties goed of af. Punten worden automatisch verwerkt bij goedkeuring.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: ".5rem", borderRadius: "6px" }}
        >
          <option value="all">Alle</option>
          <option value="pending">In afwachting</option>
          <option value="approved">Goedgekeurd</option>
          <option value="rejected">Afgekeurd</option>
        </select>
      </div>

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
                Geen registraties gevonden.
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
                    <>
                      <button
                        className="btn btn-success"
                        onClick={() => handleApprove(r.id, r)}
                      >
                        Goedkeuren
                      </button>
                      <div style={{ marginTop: ".4rem" }}>
                        <input
                          type="text"
                          placeholder="Reden afkeuring"
                          value={reason[r.id] || ""}
                          onChange={(e) =>
                            setReason({ ...reason, [r.id]: e.target.value })
                          }
                          style={{ width: "140px", marginRight: "0.5rem" }}
                        />
                        <button
                          className="btn btn-danger"
                          onClick={() => handleReject(r.id, r)}
                        >
                          Afkeuren
                        </button>
                      </div>
                    </>
                  ) : r.status === "rejected" ? (
                    <em style={{ color: "red" }}>
                      Afgekeurd: {r.reject_reason || "-"}
                    </em>
                  ) : (
                    <strong style={{ color: "green" }}>Goedgekeurd</strong>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
