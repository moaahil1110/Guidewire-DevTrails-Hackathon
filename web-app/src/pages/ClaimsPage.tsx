import { useEffect, useMemo, useState } from "react";

import { api } from "../api/client";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { StatusChip } from "../components/ui/StatusChip";
import { Table } from "../components/ui/Table";
import { useAuth } from "../context/AuthContext";
import {
  formatCurrency,
  formatDate,
  getClaimStatusLabel,
  getDisruptionLabel,
} from "../lib/format";
import type { Claim, DisruptionType } from "../types";

const DISRUPTIONS: Array<{
  id: DisruptionType;
  label: string;
  detail: string;
  hours: number;
  accent: string;
}> = [
  {
    id: "heavy_rain",
    label: "Heavy Rain",
    detail: "Parametric rainfall trigger for intense urban downpours.",
    hours: 2.5,
    accent: "var(--orange-600)",
  },
  {
    id: "extreme_heat",
    label: "Extreme Heat",
    detail: "Protection for outdoor work pauses during heat alerts.",
    hours: 3,
    accent: "var(--red-600)",
  },
  {
    id: "flood",
    label: "Flash Flood",
    detail: "Emergency cover for blocked routes and civic shutdowns.",
    hours: 6,
    accent: "var(--blue-600)",
  },
  {
    id: "curfew",
    label: "Local Curfew",
    detail: "Social disruption scenario with restricted movement.",
    hours: 5,
    accent: "var(--amber-600)",
  },
  {
    id: "platform_downtime",
    label: "Platform Down",
    detail: "Commercial downtime on the registered gig platform.",
    hours: 1,
    accent: "var(--green-600)",
  },
];

const REVIEW_DURATION_MS = 60_000;
const REVIEW_STORAGE_KEY = "insureit-web-claim-review-state";

type ReviewEntry = {
  claimId: number;
  payoutAmount: number;
  releaseAt: number;
};

export function ClaimsPage() {
  const { token } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [pending, setPending] = useState<(typeof DISRUPTIONS)[number] | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [reviewEntries, setReviewEntries] = useState<ReviewEntry[]>([]);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as ReviewEntry[];
      setReviewEntries(parsed.filter((item) => item.releaseAt > Date.now()));
    } catch {
      setReviewEntries([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviewEntries));
  }, [reviewEntries]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setReviewEntries((current) => current.filter((entry) => entry.releaseAt > now));
  }, [now]);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        return;
      }
      setLoading(true);
      try {
        const result = await api.claims(token);
        setClaims(result);
      } catch {
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [token]);

  const reviewMap = useMemo(
    () => new Map(reviewEntries.map((entry) => [entry.claimId, entry])),
    [reviewEntries],
  );
  const amountClaimed = claims.reduce((sum, claim) => sum + claim.payout_amount, 0);
  const amountInReview = reviewEntries.reduce((sum, entry) => sum + entry.payoutAmount, 0);
  const amountCredited = Math.max(amountClaimed - amountInReview, 0);

  const refreshClaims = async () => {
    if (!token) {
      return;
    }
    const result = await api.claims(token);
    setClaims(result);
  };

  const generateClaim = async () => {
    if (!token || !pending) {
      return;
    }

    setTriggering(pending.id);
    setError(null);
    const selected = pending;
    setPending(null);

    try {
      const result = await api.simulateTrigger(token, selected.id, selected.hours);
      if (result.claim) {
        setReviewEntries((current) => [
          {
            claimId: result.claim!.id,
            payoutAmount: result.claim!.payout_amount,
            releaseAt: Date.now() + REVIEW_DURATION_MS,
          },
          ...current.filter((entry) => entry.claimId !== result.claim!.id),
        ]);
      }
      await refreshClaims();
      setNoticeOpen(true);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not generate a claim. Make sure an active policy exists.",
      );
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header__copy">
          <div className="page-header__eyebrow">Live Claims Desk</div>
          <h1>Claims Management</h1>
          <p>Simulate disruptions, monitor review windows, and inspect payout outcomes.</p>
        </div>
        <Badge label="Live regional feed" variant="info" />
      </div>

      <section className="metrics-row metrics-row--claims">
        <MetricCard label="Claims in review" value={String(reviewEntries.length)} tone="warning" />
        <MetricCard label="Amount claimed" value={formatCurrency(amountClaimed)} tone="info" />
        <MetricCard label="Credited amount" value={formatCurrency(amountCredited)} tone="success" />
      </section>

      {error ? <div className="notice-banner">{error}</div> : null}

      <section className="claims-layout">
        <Card shadow="md">
          <div className="card-section__header">
            <div>
              <h3>Disruption Simulator</h3>
              <p>Run verified disruption scenarios against the active policy.</p>
            </div>
          </div>
          <div className="sim-grid">
            {DISRUPTIONS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`sim-card ${index === 4 ? "sim-card--wide" : ""}`.trim()}
                style={{ ["--sim-accent" as string]: item.accent }}
                onClick={() => setPending(item)}
                disabled={!!triggering}
              >
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
                <span>{triggering === item.id ? "Running..." : "Simulate →"}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card shadow="md">
          <div className="card-section__header">
            <div>
              <h3>Transaction History</h3>
              <p>Recent automated claim entries and payout references.</p>
            </div>
          </div>
          {loading ? (
            <Spinner label="Loading claims" />
          ) : (
            <Table
              rows={claims}
              emptyState={<p className="empty-copy">No claims yet. Run a simulation to populate the feed.</p>}
              columns={[
                { key: "type", label: "Type", render: (claim) => getDisruptionLabel(claim.disruption_type) },
                { key: "date", label: "Date", render: (claim) => formatDate(claim.created_at) },
                {
                  key: "reference",
                  label: "Reference",
                  render: (claim) => claim.payout_reference || `Claim ${claim.id}`,
                },
                {
                  key: "amount",
                  label: "Amount",
                  render: (claim) => formatCurrency(claim.payout_amount),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (claim) => {
                    const review = reviewMap.get(claim.id);
                    const label = getClaimStatusLabel(claim, review?.releaseAt, now);
                    return <StatusChip status={label} label={label} />;
                  },
                },
              ]}
            />
          )}
        </Card>
      </section>

      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="Confirm Trigger"
        width="md"
      >
        <div className="stack-md">
          <p className="auth-card__subtitle">
            Simulate a verified disruption event and generate an automatic claim against the active
            policy.
          </p>
          <div className="trigger-summary">
            <div>
              <span>Scenario</span>
              <strong>{pending?.label || "--"}</strong>
            </div>
            <div>
              <span>Blocked hours</span>
              <strong>{pending ? `${pending.hours}` : "--"}</strong>
            </div>
            <div>
              <span>Source</span>
              <strong>web-dashboard</strong>
            </div>
          </div>
          <Button fullWidth onClick={generateClaim}>
            Generate Claim
          </Button>
        </div>
      </Modal>

      <Modal
        open={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        title="Claim Under Review"
        width="sm"
      >
        <div className="review-notice">
          <Badge label="Under Review" variant="warning" />
          <p>
            Your claim is currently under review and will be credited once it is verified.
          </p>
          <strong>60-second countdown active</strong>
          <Button fullWidth onClick={() => setNoticeOpen(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "warning" | "info" | "success";
}) {
  return (
    <Card className="metric-card" shadow="md">
      <span>{label}</span>
      <strong>{value}</strong>
      <Badge label={tone === "warning" ? "Live review" : tone === "info" ? "Tracked" : "Settled"} variant={tone} />
    </Card>
  );
}
