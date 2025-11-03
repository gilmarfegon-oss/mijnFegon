import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDoc,
  updateDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import * as XLSX from "xlsx";
import AppShell from "../components/AppShell";
import "../styles/theme.css";

export default function Admin({ user, role }) {
  const [users, setUsers] = useState([]);
  const [registraties, setRegistraties] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const unsubRegs = onSnapshot(collection(db, "registrations"), (snap) => {
      setRegistraties(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubRegs();
    };
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter((u) =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.installer_full_name?.toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  const handleExportUsers = () => {
    const data = users.map((u) => ({
      uid: u.uid,
      naam: u.installer_full_name || "",
      email: u.email,
      bedrijf: u.installer_company || "",
      telefoon: u.installer_phone || "",
      punten: u.points_total || 0,
      role: u.role || "user",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gebruikers");
    XLSX.writeFile(wb, "gebruikers_export.xlsx");
  };

  const handleImportUsers = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      for (const row of json) {
        if (!row.email) continue;
        const ref = doc(db, "users", row.uid || crypto.randomUUID());
        await setDoc(
          ref,
          {
            email: row.email,
            installer_full_name: row.naam || "",
            installer_company: row.bedrijf || "",
            installer_phone: row.telefoon || "",
            points_total: Number(row.punten) || 0,
            role: row.role || "user",
          },
          { merge: true }
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportRegistraties = () => {
    const data = registraties.map((r) => ({
      id: r.id,
      installateur: r.installer_email || "",
      klant: r.klantNaam || "",
      product: r.productType || r.productMerk || "",
      status: r.status || "pending",
      punten: r.points || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registraties");
    XLSX.writeFile(wb, "registraties_export.xlsx");
  };

  const handleImportRegistraties = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      for (const row of json) {
        const regRef = doc(db, "registrations", row.id || crypto.randomUUID());
        await setDoc(
          regRef,
          {
            installer_email: row.installateur || "",
            klantNaam: row.klant || "",
            productType: row.product || "",
            status: row.status || "pending",
            points: Number(row.punten) || 0,
          },
          { merge: true }
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const wijzigPunten = async (uid, delta) => {
    const ref = doc(db, "punten", uid);
    const snap = await getDoc(ref);
    const huidige = snap.exists() ? snap.data().totaal || 0 : 0;
    await setDoc(ref, { totaal: huidige + delta }, { merge: true });
  };

  const updateStatus = async (id, nieuwStatus, feedback = "") => {
    const ref = doc(db, "registrations", id);
    await updateDoc(ref, { status: nieuwStatus, feedback });

    const reg = registraties.find((r) => r.id === id);
    if (reg && reg.installer_uid) {
      const puntenRef = doc(db, "users", reg.installer_uid);
      const userSnap = await getDoc(puntenRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const delta =
          nieuwStatus === "approved"
            ? reg.points || 0
            : nieuwStatus === "rejected" && reg.status === "approved"
            ? -(reg.points || 0)
            : 0;
        if (delta !== 0) {
          await updateDoc(puntenRef, {
            points_total: (data.points_total || 0) + delta,
          });
        }
      }
    }
  };

  return (
    <AppShell
      user={user}
      role={role}
      title="Adminpaneel"
      kicker="Organiseer & beheer"
      description="Beheer gebruikersaccounts, exporteer rapportages en houd toezicht op alle binnengekomen registraties."
    >
      {loading && <div className="alert alert-success">Gegevens laden...</div>}

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Gebruikersbeheer</h2>
            <p className="text-muted">
              Zoek op naam of e-mail, exporteer de lijst of voer wijzigingen door in puntensaldi.
            </p>
          </div>
          <div className="btn-group">
            <button onClick={handleExportUsers} className="btn btn-outline" type="button">
              ⬇️ Exporteren
            </button>
            <label className="btn btn-secondary file-input">
              📤 Importeren
              <input type="file" onChange={handleImportUsers} />
            </label>
          </div>
        </div>

        <div className="section-header" style={{ marginBottom: "1.25rem" }}>
          <input
            type="text"
            placeholder="Zoek op naam of e-mail"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Naam</th>
                <th>Rol</th>
                <th>Punten</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="center text-muted">
                    Geen gebruikers gevonden.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.installer_full_name || "-"}</td>
                    <td>{u.role || "user"}</td>
                    <td>{u.points_total || 0}</td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => wijzigPunten(u.id, 10)} className="btn btn-secondary">
                          +10
                        </button>
                        <button onClick={() => wijzigPunten(u.id, -10)} className="btn btn-danger">
                          -10
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Registraties overzicht</h2>
            <p className="text-muted">
              Exporteer of wijzig de status van registraties rechtstreeks vanuit dit overzicht.
            </p>
          </div>
          <div className="btn-group">
            <button onClick={handleExportRegistraties} className="btn btn-outline" type="button">
              ⬇️ Exporteren
            </button>
            <label className="btn btn-secondary file-input">
              📤 Importeren
              <input type="file" onChange={handleImportRegistraties} />
            </label>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Installateur</th>
                <th>Klant</th>
                <th>Product</th>
                <th>Status</th>
                <th>Punten</th>
                <th>Actie</th>
              </tr>
            </thead>
            <tbody>
              {registraties.length === 0 ? (
                <tr>
                  <td colSpan="6" className="center text-muted">
                    Geen registraties gevonden.
                  </td>
                </tr>
              ) : (
                registraties.map((r) => (
                  <tr key={r.id}>
                    <td>{r.installer_email}</td>
                    <td>{r.klantNaam}</td>
                    <td>{r.productType || r.productMerk}</td>
                    <td>{r.status}</td>
                    <td>{r.points}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-success"
                          onClick={() => updateStatus(r.id, "approved")}
                        >
                          Goedkeuren
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() =>
                            updateStatus(
                              r.id,
                              "rejected",
                              prompt("Reden van afkeuring:") || "Afgekeurd"
                            )
                          }
                        >
                          Afkeuren
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
