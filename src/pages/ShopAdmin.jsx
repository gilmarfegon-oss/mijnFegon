import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import AppShell from "../components/AppShell";
import "../styles/theme.css";

export default function ShopAdmin({ user, role }) {
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
    if (!form.name || !form.points) {
      alert("Naam en punten zijn verplicht.");
      return;
    }
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

  return (
    <AppShell
      user={user}
      role={role}
      title="Shopbeheer"
      kicker="Beheer het aanbod"
      description="Voeg nieuwe beloningen toe, werk bestaande producten bij of verwijder verouderde items uit de shop."
    >
      <section className="card">
        <div className="section-header">
          <div>
            <h2>{editId ? "Product bewerken" : "Nieuw product"}</h2>
            <p className="text-muted">
              Vul de details in en sla op. Alle wijzigingen zijn direct zichtbaar voor installateurs.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-row">
            <div>
              <label htmlFor="name">Naam</label>
              <input
                id="name"
                placeholder="Naam"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="points">Punten</label>
              <input
                id="points"
                type="number"
                placeholder="Punten"
                value={form.points}
                onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                required
                min="0"
              />
            </div>
          </div>
          <div>
            <label htmlFor="image">Afbeeldings-URL</label>
            <input
              id="image"
              placeholder="https://..."
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="description">Beschrijving</label>
            <textarea
              id="description"
              placeholder="Beschrijving (optioneel)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="btn-group">
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
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Productoverzicht</h2>
          <p className="text-muted">
            Houd overzicht over alle producten en pas ze in één klik aan.
          </p>
        </div>

        {loading ? (
          <div className="empty-state">Producten laden...</div>
        ) : producten.length === 0 ? (
          <div className="empty-state">Er zijn nog geen producten toegevoegd.</div>
        ) : (
          <div className="table-card">
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
                          style={{ objectFit: "cover", borderRadius: 12 }}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>{p.points}</td>
                    <td style={{ maxWidth: 320 }}>{p.description || "—"}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary" onClick={() => startEdit(p)}>
                          Bewerken
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>
                          Verwijderen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
