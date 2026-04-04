import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";
import {
  formatCurrency,
  formatDate,
  getCoverageDaysRemaining,
  getDisplayedPolicyPrice,
  getDisruptionLabel,
  getGreeting,
  getTierLabel,
} from "../lib/format";
import type { Claim, Policy } from "../types";

export function DashboardPage() {
  const { token, user } = useAuth();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        return;
      }

      setLoading(true);
      try {
        const [policyResult, claimsResult] = await Promise.allSettled([
          api.activePolicy(token),
          api.claims(token),
        ]);

        if (policyResult.status === "fulfilled") {
          setPolicy(policyResult.value);
        } else {
          setPolicy(null);
        }

        if (claimsResult.status === "fulfilled") {
          setClaims(claimsResult.value.slice(0, 3));
        } else {
          setClaims([]);
        }
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [token]);

  if (loading) {
    return <Spinner label="Loading dashboard" />;
  }

  return (
    <div className="page-stack">
      <section className="greeting-strip">
        <div>
          <div className="page-header__eyebrow">Live Protection Desk</div>
          <h1 className="dashboard-greeting">
            {getGreeting()}, {user?.full_name?.split(" ")[0] || "Ravi"}.
          </h1>
          <p className="dashboard-greeting__text">
            Your income is protected. Stay safe out there today.
          </p>
        </div>
        <Badge label="Coverage Active" variant="success" />
      </section>

      <section className="stats-row">
        <StatCard
          label="Daily earnings"
          value={formatCurrency(user?.avg_daily_earnings)}
          indicator="▲ Protected for weekly payouts"
          tone="success"
        />
        <StatCard
          label="Platform"
          value={user?.platform || "--"}
          indicator={`${user?.city || "City"} operations`}
          tone="info"
        />
        <StatCard
          label="Risk score"
          value={user?.risk_score != null ? String(user.risk_score) : "--"}
          indicator={`${user?.zone || "Zone"} pricing multiplier`}
          tone="warning"
        />
        <StatCard
          label="Coverage window"
          value={policy ? getCoverageDaysRemaining(policy) || "--" : "No active cover"}
          indicator={policy ? `${formatDate(policy.coverage_start)} to ${formatDate(policy.coverage_end)}` : "Purchase a plan to activate"}
          tone="neutral"
        />
      </section>

      <section className="dashboard-grid">
        <div className="stack-lg">
          <Card className="route-card" shadow="md">
            <div className="card-section__header">
              <div>
                <h3>Active Route</h3>
                <p>Operational delivery map for the current shift.</p>
              </div>
              <Badge label={`${user?.zone || "Unknown Zone"}`} variant="orange" />
            </div>
            <div className="route-map">
              <div className="route-map__grid" />
              <span className="route-pin route-pin--1" />
              <span className="route-pin route-pin--2" />
              <span className="route-pin route-pin--3" />
              <span className="route-link route-link--1" />
              <span className="route-link route-link--2" />
              <div className="route-map__footer">
                Claim readiness stays live for verified disruptions across the active zone.
              </div>
            </div>
          </Card>

          <Card shadow="md">
            <div className="card-section__header">
              <div>
                <h3>Recent Claims</h3>
                <p>Last three auto-triggered or simulated claim entries.</p>
              </div>
              <Link className="inline-link" to="/claims">
                View all claims
              </Link>
            </div>
            {claims.length ? (
              <div className="mini-claims">
                {claims.map((claim) => (
                  <div className="mini-claims__row" key={claim.id}>
                    <div>
                      <strong>{getDisruptionLabel(claim.disruption_type)}</strong>
                      <span>{formatDate(claim.created_at)}</span>
                    </div>
                    <div>
                      <strong>{formatCurrency(claim.payout_amount)}</strong>
                      <span>{claim.status === "paid" ? "Credited" : claim.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-copy">No recent claims yet. Run a disruption simulation to populate this panel.</p>
            )}
          </Card>
        </div>

        <div className="stack-lg">
          <Card className="policy-spotlight" shadow="md">
            <div className="card-section__header">
              <div>
                <h3>Active Policy</h3>
                <p>Current weekly protection and payout window.</p>
              </div>
              <Badge
                label={policy ? `${getTierLabel(policy.tier)} Plan` : "No Policy"}
                variant={policy ? "orange" : "neutral"}
              />
            </div>

            {policy ? (
              <div className="policy-spotlight__content">
                <div className="policy-spotlight__price">
                  <span>Premium</span>
                  <strong>{formatCurrency(getDisplayedPolicyPrice(policy))}</strong>
                  <small>per week</small>
                </div>
                <div className="policy-spotlight__meta">
                  <div>
                    <span>Coverage</span>
                    <strong>{formatDate(policy.coverage_start)} to {formatDate(policy.coverage_end)}</strong>
                  </div>
                  <div>
                    <span>Countdown</span>
                    <strong>{getCoverageDaysRemaining(policy)}</strong>
                  </div>
                  <div>
                    <span>Max payout</span>
                    <strong>{formatCurrency(policy.max_weekly_payout)}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="empty-copy">No active policy found. Pick a plan to activate weekly protection.</p>
            )}
          </Card>

          <Card shadow="md">
            <div className="card-section__header">
              <div>
                <h3>Quick Actions</h3>
                <p>Jump directly into the key insured workflows.</p>
              </div>
            </div>
            <div className="quick-action-grid">
              <Link className="quick-action" to="/policy">
                <strong>View Policy</strong>
                <span>Coverage rules, timeline, and payout logic.</span>
              </Link>
              <Link className="quick-action" to="/claims">
                <strong>Simulate Claim</strong>
                <span>Generate a disruption event and inspect review status.</span>
              </Link>
              <Link className="quick-action" to="/plans">
                <strong>Upgrade Plan</strong>
                <span>Compare tiers and weekly payouts before the next cycle.</span>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  indicator,
  tone,
}: {
  label: string;
  value: string;
  indicator: string;
  tone: "success" | "info" | "warning" | "neutral";
}) {
  return (
    <Card className="stat-card" shadow="md">
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
      <span className={`stat-card__indicator stat-card__indicator--${tone}`}>{indicator}</span>
    </Card>
  );
}
