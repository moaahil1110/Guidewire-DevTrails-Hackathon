import { Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  const { signOut, user } = useAuth();

  return (
    <div className="app-shell">
      <Sidebar onSignOut={signOut} />
      <div className="app-shell__content">
        <TopBar fullName={user?.full_name || "InsureIt Rider"} riskScore={user?.risk_score ?? null} />
        <main className="app-shell__main">
          <div className="app-shell__inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
