import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import "../styles/theme.css";

export default function Admin({ user }) {
  const [users, setUsers] = useState([]);
  const [registraties, setRegistraties] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubRegs = onSnapshot(collection(db, "registrations"), (snap) => {
      setRegistraties(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    setLoading(false);
    return () => {
      unsubUsers();
      unsubRegs();
    };
  }, []);

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase())
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
    const file = e.target.files[0];
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
      product: r.productType || "",
      status: r.status || "pending",
      punten: r.points || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registraties");
    XLSX.writeFile(wb, "registraties_export.xlsx");
  };

  const handleImportRegistraties = (e) => {
    const file = e.target.files[0];
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
    const snap = await getDocs(collection(db, "punten"));
    let huidige = 0;
    snap.forEach((s) => {
      if (s.id === uid) huidige = s.data().totaal || 0;
    });
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

  if (loading)
    return <p style={{ padding: 20 }}>⏳ Gegevens laden...</p>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1>🧑‍💼 Adminpaneel</h1>
          <p>
            Ingelogd als <strong>{user.email}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link to="/registraties-admin" className="btn btn-secondary">
            Registraties beheren
          </Link>
          <button onClick={() => signOut(auth)} style={styles.logout}>
            Uitloggen
          </button>
        </div>
      </header>

      <section style={styles.toolbar}>
        <input
          type="text"
          placeholder="Zoek gebruiker..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />
        <div>
          <button onClick={handleExportUsers} style={styles.btn}>
            ⬇️ Export Users
          </button>
          <label style={styles.importLabel}>
            📤 Import Users
            <input type="file" onChange={handleImportUsers} hidden />
          </label>
          <button onClick={handleExportRegistraties} style={styles.btn}>
            ⬇️ Export Registraties
          </button>
          <label style={styles.importLabel}>
            📤 Import Registraties
            <input type="file" onChange={handleImportRegistraties} hidden />
          </label>
        </div>
      </section>

      <h2>👥 Gebruikers</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol</th>
            <th>Punten</th>
            <th>Acties</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.points_total || 0}</td>
              <td>
                <button onClick={() => wijzigPunten(u.id, 10)}>+10</button>
                <button onClick={() => wijzigPunten(u.id, -10)}>-10</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>🧾 Registraties</h2>
      <table style={styles.table}>
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
          {registraties.map((r) => (
            <tr key={r.id}>
              <td>{r.installer_email}</td>
              <td>{r.klantNaam}</td>
              <td>{r.productType}</td>
              <td>{r.status}</td>
              <td>{r.points}</td>
              <td>
                <button onClick={() => updateStatus(r.id, "approved")}>✅</button>
                <button
                  onClick={() =>
                    updateStatus(
                      r.id,
                      "rejected",
                      prompt("Reden van afkeuring:") || "Afgekeurd"
                    )
                  }
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "system-ui, sans-serif",
    padding: "2rem",
    background: "#f4f6fb",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "white",
    padding: "1rem 1.5rem",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  search: {
    padding: "0.6rem",
    borderRadius: 8,
    border: "1px solid #ccc",
    width: "200px",
  },
  btn: {
    background: "#0066ff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "0.5rem 0.8rem",
    margin: "0 0.3rem",
    cursor: "pointer",
  },
  importLabel: {
    background: "#fff",
    color: "#0066ff",
    border: "2px solid #0066ff",
    borderRadius: 8,
    padding: "0.5rem 0.8rem",
    marginLeft: "0.5rem",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    marginBottom: "2rem",
  },
  logout: {
    background: "#ff4d4f",
    color: "white",
    border: "none",
    borderRadius: 6,
    padding: "0.5rem 1rem",
    cursor: "pointer",
  },
};
