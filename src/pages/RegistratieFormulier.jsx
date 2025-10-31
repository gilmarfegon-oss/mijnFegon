import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "../styles/theme.css";

export default function RegistratieFormulier({ user }) {
  const [formData, setFormData] = useState({
    klantNaam: "",
    klantAdres: "",
    klantPostcode: "",
    klantPlaats: "",
    productMerk: "",
    productType: "",
    serienummer: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const productMerken = [
    "Aquastar",
    "Digisofter",
    "Lavigo (voorheen Altech)",
    "Kalkfri",
    "Descale",
    "Softy",
    "Wave",
    "Talent",
    "Anders",
  ];

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!formData.productMerk || !formData.serienummer) {
        throw new Error("Vul minimaal productmerk en serienummer in.");
      }

      await addDoc(collection(db, "registrations"), {
        ...formData,
        installer_uid: user.uid,
        installer_email: user.email,
        points: 50,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setFormData({
        klantNaam: "",
        klantAdres: "",
        klantPostcode: "",
        klantPlaats: "",
        productMerk: "",
        productType: "",
        serienummer: "",
      });
    } catch (err) {
      console.error("❌ Fout bij registratie:", err);
      setError(
        "Er is iets misgegaan. Probeer het opnieuw of neem contact op met support."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>🧾 Nieuw apparaat registreren</h1>
        <p className="text-muted">
          Vul de gegevens van de eindgebruiker en het geïnstalleerde product in.  
          Na goedkeuring ontvang je automatisch je punten.
        </p>

        <form onSubmit={handleSubmit} className="grid" style={{ gap: "1rem" }}>
          <h3>Klantgegevens</h3>
          <input
            name="klantNaam"
            placeholder="Naam klant"
            value={formData.klantNaam}
            onChange={handleChange}
            required
          />
          <input
            name="klantAdres"
            placeholder="Adres"
            value={formData.klantAdres}
            onChange={handleChange}
            required
          />
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              name="klantPostcode"
              placeholder="Postcode"
              value={formData.klantPostcode}
              onChange={handleChange}
              required
            />
            <input
              name="klantPlaats"
              placeholder="Plaats"
              value={formData.klantPlaats}
              onChange={handleChange}
              required
            />
          </div>

          <h3>Productgegevens</h3>
          <select
            name="productMerk"
            value={formData.productMerk}
            onChange={handleChange}
            required
          >
            <option value="">Kies merk...</option>
            {productMerken.map((merk) => (
              <option key={merk} value={merk}>
                {merk}
              </option>
            ))}
          </select>
          <input
            name="productType"
            placeholder="Type (optioneel)"
            value={formData.productType}
            onChange={handleChange}
          />
          <input
            name="serienummer"
            placeholder="Serienummer"
            value={formData.serienummer}
            onChange={handleChange}
            required
          />

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Bezig met opslaan..." : "Registratie indienen"}
          </button>

          {success && (
            <p style={{ color: "green", marginTop: "1rem" }}>
              ✅ Registratie succesvol ingediend. Je aanvraag staat in afwachting van goedkeuring.
            </p>
          )}
          {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
