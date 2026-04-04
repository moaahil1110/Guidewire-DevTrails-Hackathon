import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { Table } from "../components/ui/Table";
import { useAuth } from "../context/AuthContext";
import {
  formatCurrency,
  formatDate,
  getCoverageDaysRemaining,
  getDisplayedPolicyPrice,
  getTierLabel,
} from "../lib/format";
import type { Policy } from "../types";

type PolicyHistoryItem = {
  label: string;
  date: string;
  amount: string;
};

export function PolicyPage() {
  const { token } = useAuth();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        return;
      }
      setLoading(true);
      try {
        const result = await api.activePolicy(token);
        setPolicy(result);
      } catch {
        setPolicy(null);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [token]);

  const coverageRows = useMemo(() => {
    const active = !!policy;
    return [
      {
        icon: "☔",
        disruption: "Heavy Rain",
        coverage: "Parametric rainfall trigger",
        maxHours: policy?.extended_hours ? "Up to 8 hrs" : "Up to 4 hrs",
        status: active ? "Included" : "Excluded",
        included: active,
      },
      {
        icon: "☀",
        disruption: "Extreme Heat",
        coverage: "Outdoor work pause protection",
        maxHours: policy?.extended_hours ? "Up to 8 hrs" : "Up to 4 hrs",
        status: active ? "Included" : "Excluded",
        included: active,
      },
      {
        icon: "🌊",
        disruption: "Flash Flood",
        coverage: "Blocked route and local civic shutdowns",
        maxHours: policy?.extended_hours ? "Up to 8 hrs" : "Up to 6 hrs",
        status: active ? "Included" : "Excluded",
        included: active,
      },
      {
        icon: "🚧",
        disruption: "Local Curfew / Bandh",
        coverage: policy?.social_disruption_cover ? "Social disruption cover" : "Not enabled on this tier",
        maxHours: policy?.social_disruption_cover ? "Up to 5 hrs" : "--",
        status: policy?.social_disruption_cover ? "Included" : "Excluded",
        included: !!policy?.social_disruption_cover,
      },
    ];
  }, [policy]);

  const history: PolicyHistoryItem[] = policy
    ? [
        {
          label: `${getTierLabel(policy.tier)} Plan`,
          date: formatDate(policy.created_at),
          amount: formatCurrency(getDisplayedPolicyPrice(policy)),
        },
        {
          label: "Current cycle",
          date: `${formatDate(policy.coverage_start)} to ${formatDate(policy.coverage_end)}`,
          amount: getCoverageDaysRemaining(policy) || "--",
        },
      ]
    : [];

  if (loading) {
    return <Spinner label="Loading policy" />;
  }

  if (!policy) {
    return (
      <div className="page-stack">
        <div className="page-header">
          <div className="page-header__copy">
            <div className="page-header__eyebrow">Coverage Overview</div>
            <h1>My Policy</h1>
            <p>No active policy found for this rider account.</p>
          </div>
        </div>
        <Card shadow="md">
          <p className="empty-copy">
            Buy a plan first to unlock disruption-triggered claims and payout automation.
          </p>
          <Link className="inline-link" to="/plans">
            Browse plans
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header__copy">
          <div className="page-header__eyebrow">Coverage Overview</div>
          <h1>My Policy</h1>
          <p>{getTierLabel(policy.tier)} Plan - Active</p>
        </div>
        <div className="policy-header-price">
          <span>Weekly premium</span>
          <strong>{formatCurrency(getDisplayedPolicyPrice(policy))}</strong>
        </div>
      </div>

      <Card className="policy-hero" shadow="md">
        <div className="policy-hero__top">
          <div>
            <h2>{getTierLabel(policy.tier)} Plan</h2>
            <div className="policy-hero__badges">
              <Badge label="Active" variant="success" />
              <Badge label={getCoverageDaysRemaining(policy) || "--"} variant="orange" />
            </div>
          </div>
          <div className="policy-hero__period">
            <span>Coverage period</span>
            <strong>{formatDate(policy.coverage_start)} to {formatDate(policy.coverage_end)}</strong>
          </div>
        </div>

        <div className="policy-hero__stats">
          <PolicyHeroStat label="Max weekly payout" value={formatCurrency(policy.max_weekly_payout)} />
          <PolicyHeroStat label="Premium" value={formatCurrency(getDisplayedPolicyPrice(policy))} />
          <PolicyHeroStat label="Zone multiplier" value={`${policy.extended_hours ? "1.08x" : "1.00x"} ops`} />
        </div>
      </Card>

      <section className="policy-layout">
        <Card shadow="md">
          <div className="card-section__header">
            <div>
              <h3>What&apos;s covered</h3>
              <p>Coverage lines tied directly to this active policy tier.</p>
            </div>
          </div>
          <Table
            columns={[
              {
                key: "disruption",
                label: "Disruption Type",
                render: (row) => (
                  <div className="policy-table__disruption">
                    <span>{row.icon}</span>
                    <strong>{row.disruption}</strong>
                  </div>
                ),
              },
              { key: "coverage", label: "Coverage", render: (row) => row.coverage },
              { key: "maxHours", label: "Max Hours", render: (row) => row.maxHours },
              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <Badge label={row.status} variant={row.included ? "success" : "error"} />
                ),
              },
            ]}
            rows={coverageRows}
          />
        </Card>

        <div className="stack-lg">
          <Card shadow="md">
            <div className="card-section__header">
              <div>
                <h3>How payouts work</h3>
                <p>Auto-triggered claim flow for verified events.</p>
              </div>
            </div>
            <div className="timeline">
              <TimelineStep
                number="01"
                title="Disruption detected"
                text="Weather or regional trigger data crosses a policy threshold."
              />
              <TimelineStep
                number="02"
                title="AI validates + cross-references"
                text="The system verifies the event against configured disruption logic."
              />
              <TimelineStep
                number="03"
                title="UPI payout credited (<90 seconds)"
                text="Approved claims are routed as payout entries without manual paperwork."
              />
            </div>
          </Card>

          <Card shadow="md">
            <div className="card-section__header">
              <div>
                <h3>Policy History</h3>
                <p>Most recent policy records and cycle details.</p>
              </div>
            </div>
            <div className="history-list">
              {history.map((item) => (
                <div className="history-list__row" key={item.label}>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.date}</span>
                  </div>
                  <strong>{item.amount}</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function PolicyHeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="policy-hero__stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TimelineStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="timeline__step">
      <div className="timeline__number">{number}</div>
      <div className="timeline__content">
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}
