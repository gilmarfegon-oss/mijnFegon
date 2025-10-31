import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import "../styles/theme.css";

export default function Instellingen({ user }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadUser() {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setData(snap.data());
      }
      setLoading(false);
    }
    loadUser();
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, data);
      setSuccess(true);
    } catch (err) {
      alert("❌ Fout bij opslaan van instellingen.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="container center">
        ⏳ Instellingen laden...
      </div>
    );

  return (
    <div className="container">
      <nav className="app-nav">
        <Link to="/dashboard">← Terug</Link>
        <Link to="/registratie">Nieuw apparaat</Link>
        <button
          onClick={() => signOut(auth)}
          className="btn btn-danger"
          style={{ marginLeft: "auto" }}
        >
          Uitloggen
        </button>
      </nav>

      <div className="card">
        <h1>⚙️ Instellingen</h1>
        <p className="text-muted">
          Pas hier je bedrijfs- en contactgegevens aan. Wijzigingen worden direct opgeslagen in je profiel.
        </p>

        <form onSubmit={handleSave} className="grid" style={{ gap: "1rem" }}>
          <input
            type="text"
            name="installer_full_name"
            placeholder="Volledige naam"
            value={data.installer_full_name || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="installer_company"
            placeholder="Bedrijfsnaam"
            value={data.installer_company || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="installer_phone"
            placeholder="Telefoonnummer"
            value={data.installer_phone || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="installer_address"
            placeholder="Adres"
            value={data.installer_address || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="installer_kvk"
            placeholder="KvK-nummer"
            value={data.installer_kvk || ""}
            onChange={handleChange}
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={saving}
            style={{ marginTop: "1rem" }}
          >
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </form>

        {success && (
          <p style={{ color: "green", marginTop: "1rem" }}>
            ✅ Gegevens succesvol opgeslagen!
          </p>
        )}
      </div>
    </div>
  );
}
