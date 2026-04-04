import { useLocation } from "react-router-dom";

import { Badge } from "../ui/Badge";

const TITLE_MAP: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Live rider operations" },
  "/policy": { title: "My Policy", subtitle: "Coverage and payout rules" },
  "/plans": { title: "Choose Your Plan", subtitle: "Weekly plans and pricing" },
  "/claims": { title: "Claims Management", subtitle: "Simulation and review" },
  "/account": { title: "Account", subtitle: "Profile and preferences" },
};

export function TopBar({
  fullName,
  riskScore,
}: {
  fullName: string;
  riskScore: number | null;
}) {
  const location = useLocation();
  const current = TITLE_MAP[location.pathname] || TITLE_MAP["/"];
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="topbar">
      <div>
        <div className="topbar__breadcrumb">InsureIt / {current.title}</div>
        <div className="topbar__title">{current.subtitle}</div>
      </div>

      <div className="topbar__actions">
        <Badge label={riskScore !== null ? `Risk ${riskScore}` : "Live backend"} variant="success" />
        <div className="topbar__profile">
          <div className="topbar__avatar">{initials || "IR"}</div>
          <div>
            <div className="topbar__name">{fullName}</div>
            <div className="topbar__menu">Account ▾</div>
          </div>
        </div>
      </div>
    </header>
  );
}
