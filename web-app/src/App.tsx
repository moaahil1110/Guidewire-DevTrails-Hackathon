import type { ReactElement } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AppShell } from "./components/layout/AppShell";
import { useAuth } from "./context/AuthContext";
import { AccountPage } from "./pages/AccountPage";
import { ClaimsPage } from "./pages/ClaimsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { PlansPage } from "./pages/PlansPage";
import { PolicyPage } from "./pages/PolicyPage";
import { RegisterPage } from "./pages/RegisterPage";

function ProtectedRoute() {
  const { token, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <div className="app-boot">Loading InsureIt dashboard…</div>;
  }

  return token ? <AppShell /> : <Navigate to="/login" replace />;
}

function AuthRoute({ children }: { children: ReactElement }) {
  const { token, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return <div className="app-boot">Loading InsureIt dashboard…</div>;
  }

  if (token) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <RegisterPage />
          </AuthRoute>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
