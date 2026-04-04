import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, authError } = useAuth();
  const [email, setEmail] = useState("ravi@insureit.demo");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const target = location.state?.from?.pathname || "/";

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      navigate(target, { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setEmail("ravi@insureit.demo");
    setPassword("demo123");
    setLoading(true);
    setError(null);
    try {
      await signIn("ravi@insureit.demo", "demo123");
      navigate("/", { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Demo sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--split">
      <section className="auth-hero">
        <div className="auth-hero__pattern" aria-hidden="true" />
        <div className="auth-hero__inner">
          <div className="auth-brand">
            <div className="auth-brand__mark">IN</div>
            <div>
              <div className="auth-brand__name">InsureIt</div>
              <div className="auth-brand__tag">Income protection for delivery partners</div>
            </div>
          </div>

          <div className="auth-hero__copy">
            <span className="ui-badge ui-badge--success">Coverage Active</span>
            <h1 className="auth-hero__title">Protect every working hour.</h1>
            <p className="auth-hero__text">
              Monitor disruptions, preview payouts, and keep riders protected with a desktop
              workspace built for high-volume operational clarity.
            </p>
          </div>

          <div className="auth-metric-row">
            <div className="auth-metric">
              <strong>&lt;90s</strong>
              <span>Payout demo</span>
            </div>
            <div className="auth-metric">
              <strong>24×7</strong>
              <span>Coverage</span>
            </div>
            <div className="auth-metric">
              <strong>3 tiers</strong>
              <span>Plans</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <h2 className="auth-card__title">Sign In</h2>
          <p className="auth-card__subtitle">
            Use the seeded demo account or your registered rider profile.
          </p>

          {error || authError ? <div className="notice-banner">{error || authError}</div> : null}

          <form className="stack-md" onSubmit={handleLogin}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="rider@insureit.demo"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter password"
            />
            <Button type="submit" fullWidth loading={loading}>
              Enter Dashboard
            </Button>
          </form>

          <div className="stack-sm">
            <Button variant="ghost" fullWidth onClick={handleDemo} disabled={loading}>
              Use Demo Credentials
            </Button>
            <p className="auth-card__footer">
              Don&apos;t have an account? <Link to="/register">Create one</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
