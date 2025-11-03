import React, { useCallback, useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProfielAanvullen from "./pages/ProfielAanvullen";
import Instellingen from "./pages/Instellingen";
import RegistratieFormulier from "./pages/RegistratieFormulier";
import Shop from "./pages/Shop";
import ShopAdmin from "./pages/ShopAdmin";
import RegistratiesAdmin from "./pages/RegistratiesAdmin";
import Admin from "./pages/Admin";
import Producten from "./pages/Producten";

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const loadUserData = useCallback(async (uid) => {
    if (!uid) {
      setUserData(null);
      return;
    }
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    setUserData(snap.exists() ? snap.data() : null);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser.uid);
      } else {
        setUserData(null);
      }
      setInitializing(false);
    });
    return () => unsubscribe();
  }, [loadUserData]);

  const userRole = userData?.role || "user";
  const profileCompleted = userData?.profile_completed;

  const ProtectedRoute = useCallback(
    ({ children, requireProfile = true, roles }) => {
      if (!user) {
        return <Navigate to="/" replace />;
      }
      if (requireProfile && !profileCompleted) {
        return <Navigate to="/profiel" replace />;
      }
      if (roles && roles.length > 0 && !roles.includes(userRole)) {
        return <Navigate to="/dashboard" replace />;
      }
      return children;
    },
    [user, profileCompleted, userRole]
  );

  if (initializing) {
    return (
      <div className="container center" style={{ minHeight: "100vh" }}>
        ⏳ Applicatie laden...
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={profileCompleted ? "/dashboard" : "/profiel"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/profiel"
          element={
            <ProtectedRoute requireProfile={false}>
              <ProfielAanvullen
                user={user}
                onComplete={() => loadUserData(user.uid)}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard user={user} role={userRole} userData={userData} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instellingen"
          element={
            <ProtectedRoute>
              <Instellingen user={user} role={userRole} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/registratie"
          element={
            <ProtectedRoute>
              <RegistratieFormulier user={user} role={userRole} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <Shop user={user} role={userRole} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shop-admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ShopAdmin user={user} role={userRole} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/registraties-admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <RegistratiesAdmin user={user} role={userRole} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Admin user={user} role={userRole} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/producten"
          element={
            <ProtectedRoute>
              <Producten user={user} role={userRole} />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/"} replace />}
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
