import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import "../styles/theme.css";

export default function Dashboard({ user, role, userData }) {
  const [punten, setPunten] = useState(0);
  const [pendingPunten, setPendingPunten] = useState(0);
  const [registraties, setRegistraties] = useState([]);
  const [laatsteLogin, setLaatsteLogin] = useState(null);
  const [gebruikersAantal, setGebruikersAantal] = useState(0);

  useEffect(() => {
    if (!user) return;

    const puntenRef = doc(db, "punten", user.uid);
    const unsubPunten = onSnapshot(puntenRef, (snap) => {
      if (snap.exists()) {
        setPunten(snap.data().totaal || 0);
        setPendingPunten(snap.data().in_afwachting || 0);
      } else {
        setPunten(0);
        setPendingPunten(0);
      }
    });

    const q = query(
      collection(db, "registrations"),
      where("installer_uid", "==", user.uid)
    );
    const unsubRegs = onSnapshot(q, (snapshot) => {
      setRegistraties(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    setLaatsteLogin(user?.metadata?.lastSignInTime || "Onbekend");

    let unsubUsers;
    if (role === "admin") {
      unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        setGebruikersAantal(snap.size);
      });
    }

    return () => {
      unsubPunten();
      unsubRegs();
      if (unsubUsers) unsubUsers();
    };
  }, [user, role]);

  const goedgekeurd = registraties.filter((r) => r.status === "approved").length;
  const afwachting = registraties.filter((r) => r.status === "pending").length;

  const recentRegistraties = useMemo(() => {
    return [...registraties]
      .sort((a, b) => {
        const aTs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTs - aTs;
      })
      .slice(0, 5);
  }, [registraties]);

  const kicker = userData?.installer_full_name
    ? `Welkom terug, ${userData.installer_full_name}`
    : userData?.email
    ? `Welkom terug, ${userData.email}`
    : "Welkom terug";

  return (
    <AppShell
      user={user}
      role={role}
      title="Dashboard"
      kicker={kicker}
      description="Blijf op de hoogte van je punten, recente registraties en shop-activiteiten."
      actions={
        <div className="btn-group">
          <Link to="/registratie" className="btn btn-primary">
            ➕ Nieuwe registratie
          </Link>
          <Link to="/shop" className="btn btn-outline">
            🛍️ Open de shop
          </Link>
        </div>
      }
    >
      <section className="stat-grid">
        <article className="stat-card">
          <h3>Beschikbare punten</h3>
          <p className="stat-card__value">{punten}</p>
          <p className="stat-card__meta">Direct inwisselbaar in de shop</p>
        </article>

        <article className="stat-card">
          <h3>Punten in afwachting</h3>
          <p className="stat-card__value">{pendingPunten}</p>
          <p className="stat-card__meta">Worden toegevoegd zodra registraties zijn goedgekeurd</p>
        </article>

        <article className="stat-card">
          <h3>Registraties deze periode</h3>
          <p className="stat-card__value">{registraties.length}</p>
          <p className="stat-card__meta">
            ✅ {goedgekeurd} goedgekeurd &bull; ⏳ {afwachting} in afwachting
          </p>
        </article>

        {role === "admin" && (
          <article className="stat-card">
            <h3>Actieve gebruikers</h3>
            <p className="stat-card__value">{gebruikersAantal}</p>
            <p className="stat-card__meta">Alle geregistreerde installateurs</p>
          </article>
        )}
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Laatste registraties</h2>
            <p className="text-muted">
              Een beknopt overzicht van je meest recente inzendingen en hun status.
            </p>
          </div>
          <Link to="/registratie" className="btn btn-secondary">
            Nieuwe registratie
          </Link>
        </div>

        {recentRegistraties.length === 0 ? (
          <div className="empty-state">
            Je hebt nog geen registraties ingediend. Start met je eerste registratie!
          </div>
        ) : (
          <div className="activity-list">
            {recentRegistraties.map((reg) => {
              const datum = reg.createdAt?.toDate ? reg.createdAt.toDate() : null;
              return (
                <div key={reg.id} className="activity-item">
                  <div className="activity-item__meta">
                    <span className="activity-item__title">{reg.productMerk || "Onbekend product"}</span>
                    <span className="activity-item__subtitle">
                      Serienummer {reg.serienummer || "-"} •
                      {" "}
                      {datum
                        ? new Intl.DateTimeFormat("nl-NL", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }).format(datum)
                        : "Datum onbekend"}
                    </span>
                  </div>
                  <div>
                    <span className={`pill pill-${reg.status || "pending"}`}>
                      {reg.status || "pending"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Accountinformatie</h2>
            <p className="text-muted">
              Laatste aanmelding: {laatsteLogin ? new Date(laatsteLogin).toLocaleString("nl-NL") : "Onbekend"}
            </p>
          </div>
          <Link to="/instellingen" className="btn btn-outline">
            Profiel bewerken
          </Link>
        </div>

        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-item__meta">
              <span className="activity-item__title">Contact</span>
              <span className="activity-item__subtitle">
                {userData?.installer_full_name || "Naam onbekend"}
              </span>
            </div>
            <div className="text-muted">{user?.email}</div>
          </div>
          <div className="activity-item">
            <div className="activity-item__meta">
              <span className="activity-item__title">Bedrijf</span>
              <span className="activity-item__subtitle">
                {userData?.installer_company || "Nog niet ingevuld"}
              </span>
            </div>
            <div className="text-muted">
              {userData?.installer_phone ? `☎️ ${userData.installer_phone}` : "Vul je telefoonnummer in"}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
