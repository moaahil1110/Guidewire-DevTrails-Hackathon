import { NavLink } from "react-router-dom";

import { Button } from "../ui/Button";

const NAV_ITEMS = [
  { to: "/", label: "Home", short: "HM" },
  { to: "/policy", label: "Policy", short: "PL" },
  { to: "/plans", label: "Plans", short: "PN" },
  { to: "/claims", label: "Claims", short: "CL" },
  { to: "/account", label: "Account", short: "AC" },
];

export function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <span className="app-sidebar__logo">InsureIt</span>
        <span className="app-sidebar__meta">Income protection hub</span>
      </div>

      <nav className="app-sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `app-sidebar__link ${isActive ? "app-sidebar__link--active" : ""}`.trim()
            }
          >
            <span className="app-sidebar__link-short">{item.short}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="app-sidebar__footer">
        <Button variant="outline" fullWidth onClick={onSignOut}>
          Sign out
        </Button>
      </div>
    </aside>
  );
}
