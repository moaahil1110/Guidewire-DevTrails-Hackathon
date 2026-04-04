import { type FormEvent, useEffect, useState } from "react";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../lib/format";

export function AccountPage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    city: "",
    zone: "",
    pincode: "",
    platform: "",
    avg_daily_earnings: "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    setForm({
      full_name: user.full_name,
      phone_number: user.phone_number,
      city: user.city,
      zone: user.zone,
      pincode: user.pincode,
      platform: user.platform,
      avg_daily_earnings: String(user.avg_daily_earnings),
    });
  }, [user, editing]);

  const detailGroups = [
    { label: "Email", value: user?.email || "--" },
    { label: "Phone", value: user?.phone_number || "--" },
    { label: "City", value: user?.city || "--" },
    { label: "Zone", value: user?.zone || "--" },
    { label: "Pincode", value: user?.pincode || "--" },
    { label: "Platform", value: user?.platform || "--" },
    {
      label: "Daily earnings",
      value: formatCurrency(user?.avg_daily_earnings),
    },
  ];

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        ...form,
        avg_daily_earnings: Number(form.avg_daily_earnings),
      });
      setEditing(false);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-layout">
      <aside className="account-panel">
        <Card className="account-profile-card" shadow="md">
          <div className="account-avatar">
            {user?.full_name
              ?.split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase() || "IR"}
          </div>
          <h1>{user?.full_name || "InsureIt Rider"}</h1>
          <p>
            {user?.platform || "Platform"} - {user?.zone || "Zone"}
          </p>
          <div className="account-risk-pill">Risk score {user?.risk_score ?? "--"}</div>
          <Button fullWidth onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        </Card>
      </aside>

      <section className="page-stack">
        {!editing ? (
          <>
            <Card shadow="md">
              <div className="card-section__header">
                <div>
                  <h3>Profile Details</h3>
                  <p>Operational rider information synced with the active account.</p>
                </div>
              </div>
              <div className="detail-grid">
                {detailGroups.map((item) => (
                  <div className="detail-grid__row" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </Card>

            <Card shadow="md">
              <div className="card-section__header">
                <div>
                  <h3>About InsureIt</h3>
                  <p>Parametric income insurance for last-mile riders.</p>
                </div>
              </div>
              <p className="about-copy">
                Once a verified disruption hits the working zone, the system triggers claim
                automation and payout confirmation without manual paperwork.
              </p>
              <div className="feature-pill-row">
                {["Weekly cover", "Auto payouts", "Claims simulator", "Zone pricing"].map((tag) => (
                  <span className="feature-pill" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <Card shadow="md">
            <div className="card-section__header">
              <div>
                <h3>Profile Details</h3>
                <p>Update rider information and working zone data inline.</p>
              </div>
            </div>
            <form className="stack-lg" onSubmit={handleSave}>
              {error ? <div className="notice-banner">{error}</div> : null}
              <div className="account-form-grid">
                <Input
                  label="Full Name"
                  value={form.full_name}
                  onChange={(event) => setField("full_name", event.target.value)}
                />
                <Input
                  label="Phone Number"
                  value={form.phone_number}
                  onChange={(event) => setField("phone_number", event.target.value)}
                />
                <Input
                  label="City"
                  value={form.city}
                  onChange={(event) => setField("city", event.target.value)}
                />
                <Input
                  label="Zone"
                  value={form.zone}
                  onChange={(event) => setField("zone", event.target.value)}
                />
                <Input
                  label="Pincode"
                  value={form.pincode}
                  onChange={(event) => setField("pincode", event.target.value)}
                />
                <Input
                  label="Platform"
                  value={form.platform}
                  onChange={(event) => setField("platform", event.target.value)}
                />
                <Input
                  label="Daily Earnings"
                  value={form.avg_daily_earnings}
                  onChange={(event) => setField("avg_daily_earnings", event.target.value)}
                />
              </div>
              <div className="account-form-actions">
                <Button type="submit" loading={saving}>
                  Save Changes
                </Button>
                <button
                  type="button"
                  className="account-cancel"
                  onClick={() => {
                    setEditing(false);
                    setError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}
      </section>
    </div>
  );
}
