import { useEffect, useMemo, useState } from "react";

import { api } from "../api/client";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, getDisplayedQuotePrice, getTierLabel } from "../lib/format";
import type { CoverageTier, PremiumQuote } from "../types";

const PLANS: Array<{
  id: CoverageTier;
  subtitle: string;
  points: string[];
}> = [
  {
    id: "basic",
    subtitle: "Weather-first protection for lighter risk zones.",
    points: ["Rain protection", "Fast digital claims", "Weekly coverage cycle"],
  },
  {
    id: "shield",
    subtitle: "Balanced cover for riders facing variable urban disruptions.",
    points: ["Priority claims", "Social disruption cover", "Recommended weekly balance"],
  },
  {
    id: "max",
    subtitle: "Higher limits for intense zones and extended working hours.",
    points: ["Platform downtime included", "Extended hours cover", "Highest payout ceiling"],
  },
];

const PAYMENT_METHODS = ["UPI", "Card", "Wallet"];

export function PlansPage() {
  const { token, user } = useAuth();
  const [quotes, setQuotes] = useState<Record<CoverageTier, PremiumQuote | undefined>>({
    basic: undefined,
    shield: undefined,
    max: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [purchaseTier, setPurchaseTier] = useState<CoverageTier | null>(null);
  const [selectedPayment, setSelectedPayment] = useState("UPI");
  const [purchasing, setPurchasing] = useState(false);
  const [successTier, setSuccessTier] = useState<CoverageTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        return;
      }

      setLoading(true);
      try {
        const results = await Promise.all(PLANS.map((plan) => api.quote(token, plan.id)));
        setQuotes({
          basic: results[0],
          shield: results[1],
          max: results[2],
        });
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [token]);

  const selectedQuote = useMemo(
    () => (purchaseTier ? quotes[purchaseTier] : undefined),
    [purchaseTier, quotes],
  );

  const confirmPurchase = async () => {
    if (!token || !purchaseTier) {
      return;
    }

    setPurchasing(true);
    setError(null);
    try {
      await api.purchasePolicy(token, purchaseTier);
      setSuccessTier(purchaseTier);
      setPurchaseTier(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Purchase failed.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="page-stack plan-page">
      <header className="plans-header">
        <div className="page-header__eyebrow">Weekly Plans</div>
        <h1>Choose Your Plan</h1>
        <p>
          Transparent weekly coverage tailored to your zone risk. Switch or cancel anytime.
        </p>
        <div className="plans-header__badges">
          <Badge label={`${user?.zone || "Unknown Zone"}, ${user?.city || "City"}`} variant="neutral" />
          <Badge label={`Risk ${user?.risk_score ?? "--"}`} variant="warning" />
        </div>
      </header>

      {loading ? (
        <Spinner label="Loading weekly quotes" />
      ) : (
        <section className="plan-grid">
          {PLANS.map((plan) => {
            const quote = quotes[plan.id];
            const featured = plan.id === "shield";
            return (
              <Card
                key={plan.id}
                className={`plan-card ${featured ? "plan-card--featured" : ""}`.trim()}
                shadow="md"
              >
                {featured ? <div className="plan-card__pill">Most Popular</div> : <div />}
                <h2>{getTierLabel(plan.id)}</h2>
                <p>{plan.subtitle}</p>
                <div className="plan-card__price">
                  <strong>{formatCurrency(getDisplayedQuotePrice(plan.id, quote))}</strong>
                  <span>per week</span>
                </div>
                <div className="plan-card__divider" />
                <div className="plan-card__points">
                  {plan.points.map((point) => (
                    <div className="plan-card__point" key={point}>
                      <span />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
                <div className="plan-card__payout">Max payout: {formatCurrency(quote?.max_weekly_payout)}</div>
                <Button
                  variant={featured ? "primary" : "outline"}
                  fullWidth
                  onClick={() => {
                    setSelectedPayment("UPI");
                    setPurchaseTier(plan.id);
                  }}
                >
                  Buy {getTierLabel(plan.id)} Plan
                </Button>
              </Card>
            );
          })}
        </section>
      )}

      <p className="fine-print">
        Coverage applies only to verified disruptions tied to the active policy configuration.
      </p>

      <Modal
        open={!!purchaseTier}
        onClose={() => setPurchaseTier(null)}
        title="Complete Purchase"
        width="md"
      >
        <div className="stack-md">
          <div className="modal-summary-card">
            <span>Selected plan</span>
            <strong>{purchaseTier ? getTierLabel(purchaseTier) : "--"}</strong>
            <p>{formatCurrency(getDisplayedQuotePrice(purchaseTier || "basic", selectedQuote))}</p>
          </div>

          <div className="stack-sm">
            <div className="form-field__label">Payment method</div>
            <div className="payment-pill-row">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`payment-pill ${
                    selectedPayment === method ? "payment-pill--active" : ""
                  }`.trim()}
                  onClick={() => setSelectedPayment(method)}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {error ? <div className="notice-banner">{error}</div> : null}

          <Button fullWidth loading={purchasing} onClick={confirmPurchase}>
            Confirm Purchase
          </Button>
        </div>
      </Modal>

      <Modal
        open={!!successTier}
        onClose={() => setSuccessTier(null)}
        title="Payment Confirmed"
        width="sm"
      >
        <div className="success-state">
          <div className="success-state__confetti" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="success-state__icon">✓</div>
          <strong>{successTier ? `${getTierLabel(successTier)} plan activated` : "Plan activated"}</strong>
          <p>
            The policy is live. A payment portal has been sent to the registered email for demo
            completion.
          </p>
          <Button fullWidth onClick={() => setSuccessTier(null)}>
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
}
