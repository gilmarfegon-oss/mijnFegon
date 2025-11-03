import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import AppShell from "../components/AppShell";
import "../styles/theme.css";

export default function RegistratieFormulier({ user, role }) {
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
    <AppShell
      user={user}
      role={role}
      title="Nieuwe registratie"
      kicker="Claim je punten"
      description="Dien je installatie snel in. Na goedkeuring worden de punten automatisch toegevoegd aan je saldo."
    >
      <section className="card">
        <div className="section-header">
          <div>
            <h2>Klantgegevens</h2>
            <p className="text-muted">
              Vul de gegevens van de eindgebruiker volledig en correct in.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="form-grid" style={{ gap: "1.5rem" }}>
          <div className="form-row">
            <div>
              <label htmlFor="klantNaam">Naam klant</label>
              <input
                id="klantNaam"
                name="klantNaam"
                placeholder="Naam klant"
                value={formData.klantNaam}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="klantAdres">Adres</label>
              <input
                id="klantAdres"
                name="klantAdres"
                placeholder="Adres"
                value={formData.klantAdres}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label htmlFor="klantPostcode">Postcode</label>
              <input
                id="klantPostcode"
                name="klantPostcode"
                placeholder="1234 AB"
                value={formData.klantPostcode}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="klantPlaats">Plaats</label>
              <input
                id="klantPlaats"
                name="klantPlaats"
                placeholder="Plaats"
                value={formData.klantPlaats}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="section-header" style={{ paddingTop: "1rem" }}>
            <div>
              <h2>Productgegevens</h2>
              <p className="text-muted">Selecteer het geplaatste product en vul de details in.</p>
            </div>
          </div>

          <div className="form-row">
            <div>
              <label htmlFor="productMerk">Productmerk</label>
              <select
                id="productMerk"
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
            </div>
            <div>
              <label htmlFor="productType">Producttype</label>
              <input
                id="productType"
                name="productType"
                placeholder="Type (optioneel)"
                value={formData.productType}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label htmlFor="serienummer">Serienummer</label>
              <input
                id="serienummer"
                name="serienummer"
                placeholder="Serienummer"
                value={formData.serienummer}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Bezig met opslaan..." : "Registratie indienen"}
            </button>
          </div>
        </form>

        {success && (
          <div className="alert alert-success" style={{ marginTop: "1.5rem" }}>
            ✅ Registratie succesvol ingediend. Je aanvraag staat in afwachting van goedkeuring.
          </div>
        )}
        {error && (
          <div className="alert alert-error" style={{ marginTop: "1.5rem" }}>
            {error}
          </div>
        )}
      </section>
    </AppShell>
  );
}
