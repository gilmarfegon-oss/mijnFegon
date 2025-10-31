import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import "../styles/theme.css";

export default function ProfielAanvullen({ user, onComplete }) {
  const [form, setForm] = useState({
    installer_full_name: "",
    installer_company: "",
    installer_phone: "",
    installer_kvk: "",
    installer_address: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchExisting() {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setForm((prev) => ({
          ...prev,
          installer_full_name: data.installer_full_name || "",
          installer_company: data.installer_company || "",
          installer_phone: data.installer_phone || "",
          installer_kvk: data.installer_kvk || "",
          installer_address: data.installer_address || "",
        }));
      }
      setInitialLoading(false);
    }

    fetchExisting();
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const ref = doc(db, "users", user.uid);
      const payload = {
        ...form,
        uid: user.uid,
        email: user.email,
        role: "user",
        points_total: 0,
        points_pending: 0,
        profile_completed: true,
      };

      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, {
          ...form,
          profile_completed: true,
        });
      } else {
        await setDoc(ref, {
          ...payload,
          createdAt: new Date(),
        });
      }

      setSuccess(true);
      onComplete?.();
    } catch (err) {
      console.error(err);
      setError("Er is iets misgegaan bij het opslaan van je gegevens.");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="container center" style={{ minHeight: "100vh" }}>
        ⏳ Gegevens laden...
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Welkom bij MijnFegon 👋</h1>
        <p className="text-muted" style={{ marginBottom: "1rem" }}>
          Vul onderstaande bedrijfsgegevens aan om toegang te krijgen tot het portaal.
        </p>

        <form onSubmit={handleSubmit} className="grid" style={{ gap: "1rem" }}>
          <input
            type="text"
            name="installer_full_name"
            placeholder="Volledige naam"
            value={form.installer_full_name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="installer_company"
            placeholder="Bedrijfsnaam"
            value={form.installer_company}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="installer_phone"
            placeholder="Telefoonnummer"
            value={form.installer_phone}
            onChange={handleChange}
          />
          <input
            type="text"
            name="installer_kvk"
            placeholder="KvK-nummer (optioneel)"
            value={form.installer_kvk}
            onChange={handleChange}
          />
          <input
            type="text"
            name="installer_address"
            placeholder="Adres (optioneel)"
            value={form.installer_address}
            onChange={handleChange}
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: "1rem" }}
          >
            {loading ? "Opslaan..." : "Opslaan en doorgaan"}
          </button>
        </form>

        {success && (
          <p style={{ color: "green", marginTop: "1rem" }}>
            ✅ Gegevens opgeslagen! Je kunt nu verder naar het dashboard.
          </p>
        )}
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </div>
    </div>
  );
}
