import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AppShell from "../components/AppShell";
import "../styles/theme.css";

export default function Instellingen({ user, role }) {
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

  return (
    <AppShell
      user={user}
      role={role}
      title="Instellingen"
      kicker="Jouw profiel"
      description="Werk eenvoudig je contact- en bedrijfsgegevens bij. Deze informatie wordt gebruikt voor communicatie over registraties en shopbestellingen."
    >
      {loading ? (
        <div className="empty-state">Instellingen laden...</div>
      ) : (
        <section className="card">
          <div className="section-header">
            <div>
              <h2>Profielgegevens</h2>
              <p className="text-muted">
                Pas je gegevens aan en sla op om je profiel up-to-date te houden.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="form-grid" style={{ gap: "1.5rem" }}>
            <div className="form-row">
              <div>
                <label htmlFor="installer_full_name">Volledige naam</label>
                <input
                  id="installer_full_name"
                  type="text"
                  name="installer_full_name"
                  value={data.installer_full_name || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="installer_company">Bedrijfsnaam</label>
                <input
                  id="installer_company"
                  type="text"
                  name="installer_company"
                  value={data.installer_company || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label htmlFor="installer_phone">Telefoonnummer</label>
                <input
                  id="installer_phone"
                  type="text"
                  name="installer_phone"
                  value={data.installer_phone || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="installer_address">Adres</label>
                <input
                  id="installer_address"
                  type="text"
                  name="installer_address"
                  value={data.installer_address || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label htmlFor="installer_kvk">KvK-nummer</label>
                <input
                  id="installer_kvk"
                  type="text"
                  name="installer_kvk"
                  value={data.installer_kvk || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="btn-group">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Opslaan..." : "Wijzigingen opslaan"}
              </button>
            </div>
          </form>

          {success && (
            <div className="alert alert-success" style={{ marginTop: "1.5rem" }}>
              ✅ Gegevens succesvol opgeslagen!
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}
