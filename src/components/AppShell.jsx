import React from "react";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/registratie", label: "Registraties", icon: "🧾" },
  { to: "/shop", label: "Shop", icon: "🛍️" },
  { to: "/instellingen", label: "Instellingen", icon: "⚙️" },
  { to: "/producten", label: "Mijn producten", icon: "📦" },
  { to: "/registraties-admin", label: "Registratiebeheer", icon: "📋", roles: ["admin"] },
  { to: "/shop-admin", label: "Shopbeheer", icon: "🛒", roles: ["admin"] },
  { to: "/admin", label: "Adminpaneel", icon: "🧑‍💼", roles: ["admin"] },
];

export default function AppShell({
  user,
  role = "user",
  title,
  kicker,
  description,
  actions,
  children,
}) {
  const location = useLocation();

  const allowedNav = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar" aria-label="Hoofd navigatie">
        <div className="app-shell__brand">
          <span className="app-shell__logo" aria-hidden="true">
            <span>F</span>
          </span>
          <div>
            <p className="app-shell__brand-title">MijnFegon</p>
            <p className="app-shell__brand-sub">Installateur portaal</p>
          </div>
        </div>

        <nav className="app-shell__nav">
          {allowedNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`app-shell__nav-link${
                location.pathname === item.to ? " active" : ""
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="app-shell__sidebar-footer">
          <div className="app-shell__user">
            <div className="app-shell__avatar" aria-hidden="true">
              {(user?.email || "").slice(0, 1).toUpperCase() || "?"}
            </div>
            <div>
              <p className="app-shell__user-name">{user?.email}</p>
              <p className="app-shell__user-role">{role === "admin" ? "Beheerder" : "Installateur"}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary app-shell__signout"
            onClick={() => signOut(auth)}
          >
            Afmelden
          </button>
        </div>
      </aside>

      <main className="app-shell__main">
        <header className="page-header">
          <div>
            {kicker && <p className="page-kicker">{kicker}</p>}
            <h1 className="page-title">{title}</h1>
            {description && <p className="page-description">{description}</p>}
          </div>
          {actions && <div className="page-actions">{actions}</div>}
        </header>

        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
