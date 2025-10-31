import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import "../styles/theme.css";

export default function ShopAdmin({ user }) {
  const [producten, setProducten] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    points: 0,
    image: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "shop"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducten(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.points)
      return alert("Naam en punten zijn verplicht.");
    try {
      if (editId) {
        await updateDoc(doc(db, "shop", editId), {
          name: form.name,
          description: form.description || "",
          points: Number(form.points),
          image: form.image || "",
        });
      } else {
        await addDoc(collection(db, "shop"), {
          name: form.name,
          description: form.description || "",
          points: Number(form.points),
          image: form.image || "",
          createdAt: new Date(),
        });
      }
      setForm({ name: "", description: "", points: 0, image: "" });
      setEditId(null);
    } catch (err) {
      console.error(err);
      alert("❌ Fout bij opslaan product: " + err.message);
    }
  }

  function startEdit(p) {
    setEditId(p.id);
    setForm({
      name: p.name || "",
      description: p.description || "",
      points: p.points || 0,
      image: p.image || "",
    });
  }

  async function handleDelete(id) {
    if (confirm("Weet je zeker dat je dit product wilt verwijderen?")) {
      await deleteDoc(doc(db, "shop", id));
    }
  }

  if (loading) return <div className="container center">⏳ Laden...</div>;

  return (
    <div className="container">
      <nav className="app-nav">
        <Link to="/admin">← Adminpaneel</Link>
        <Link to="/dashboard">Dashboard</Link>
        <button
          className="btn btn-danger"
          onClick={() => signOut(auth)}
          style={{ marginLeft: "auto" }}
        >
          Uitloggen
        </button>
      </nav>

      <h1>🛒 Productbeheer</h1>
      <p className="text-muted">Beheer de producten die zichtbaar zijn in de shop.</p>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <form className="grid" style={{ gap: "1rem" }} onSubmit={handleSubmit}>
          <input
            placeholder="Naam"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Punten"
            value={form.points}
            onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
            required
          />
          <input
            placeholder="Afbeeldings-URL (optioneel)"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
          <textarea
            placeholder="Beschrijving (optioneel)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-primary" type="submit">
              {editId ? "Bijwerken" : "Toevoegen"}
            </button>
            {editId && (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setEditId(null);
                  setForm({ name: "", description: "", points: 0, image: "" });
                }}
              >
                Annuleren
              </button>
            )}
          </div>
        </form>
      </div>

      <table>
        <thead>
          <tr>
            <th>Afbeelding</th>
            <th>Naam</th>
            <th>Punten</th>
            <th>Beschrijving</th>
            <th>Acties</th>
          </tr>
        </thead>
        <tbody>
          {producten.map((p) => (
            <tr key={p.id}>
              <td>
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    width="60"
                    height="60"
                    style={{ objectFit: "cover", borderRadius: 6 }}
                  />
                ) : (
                  "—"
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.points}</td>
              <td>{p.description || "—"}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <button className="btn btn-secondary" onClick={() => startEdit(p)}>
                  ✏️
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
