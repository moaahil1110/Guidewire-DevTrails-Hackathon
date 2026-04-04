import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";

const PLATFORMS = ["Zepto", "Blinkit"];

export function RegisterPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    city: "Bengaluru",
    zone: "",
    pincode: "",
    platform: "Zepto",
    avg_daily_earnings: "",
  });

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.full_name ||
      !form.email ||
      !form.phone_number ||
      !form.password ||
      !form.zone ||
      !form.pincode ||
      !form.avg_daily_earnings
    ) {
      setError("Please fill in all required rider and zone details.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register({
        ...form,
        avg_daily_earnings: Number(form.avg_daily_earnings),
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--centered">
      <div className="auth-register">
        <div className="auth-register__header">
          <div className="page-header__eyebrow">New Rider Onboarding</div>
          <h1 className="auth-card__title">Create your coverage profile.</h1>
          <p className="auth-card__subtitle">
            Build a delivery partner account, price risk in your zone, and move directly into
            plan selection.
          </p>
          <div className="auth-step-row">
            <span className="auth-step auth-step--active">Personal</span>
            <span className="auth-step auth-step--active">Location</span>
            <span className="auth-step auth-step--active">Work</span>
          </div>
        </div>

        <form className="auth-register__card stack-lg" onSubmit={handleSubmit}>
          {error ? <div className="notice-banner">{error}</div> : null}

          <div className="auth-register__grid">
            <Input
              label="Full Name"
              value={form.full_name}
              onChange={(event) => setField("full_name", event.target.value)}
              placeholder="Ravi Kumar"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              placeholder="ravi@example.com"
            />
            <Input
              label="Phone Number"
              value={form.phone_number}
              onChange={(event) => setField("phone_number", event.target.value)}
              placeholder="9876543210"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => setField("password", event.target.value)}
              placeholder="Minimum 6 characters"
            />
            <Input
              label="City"
              value={form.city}
              onChange={(event) => setField("city", event.target.value)}
              placeholder="Bengaluru"
            />
            <Input
              label="Zone / Area"
              value={form.zone}
              onChange={(event) => setField("zone", event.target.value)}
              placeholder="Koramangala 4th Block"
            />
            <Input
              label="Pincode"
              value={form.pincode}
              onChange={(event) => setField("pincode", event.target.value)}
              placeholder="560034"
            />
            <Input
              label="Daily Earnings"
              value={form.avg_daily_earnings}
              onChange={(event) => setField("avg_daily_earnings", event.target.value)}
              placeholder="850"
            />
          </div>

          <div className="stack-sm">
            <div className="form-field__label">Platform</div>
            <div className="platform-pill-row">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  className={`platform-pill ${
                    form.platform === platform ? "platform-pill--active" : ""
                  }`.trim()}
                  onClick={() => setField("platform", platform)}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Create Account
          </Button>

          <p className="auth-card__footer">
            Already registered? <Link to="/login">Back to sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
