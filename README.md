# InsureIt 🛡️
### AI-Powered Parametric Income Insurance for India's Q-Commerce Delivery Partners

> **DEVTrails 2026 | Guidewire University Hackathon**  
> Persona: Grocery & Q-Commerce Delivery Partners (Zepto / Blinkit)  
> Platform: Mobile Application (Android-first)

---

## Table of Contents
1. [Problem Statement](#1-problem-statement)
2. [Our Solution](#2-our-solution)
3. [What Makes InsureIt Different](#3-what-makes-insureit-different)
4. [Our Persona & Scenarios](#4-our-persona--scenarios)
5. [Application Workflow](#5-application-workflow)
6. [Weekly Premium Model & Parametric Triggers](#6-weekly-premium-model--parametric-triggers)
7. [Platform Justification](#7-platform-justification-mobile)
8. [AI/ML Integration Plan](#8-aiml-integration-plan)
9. [Tech Stack & Development Plan](#9-tech-stack--development-plan)
10. [Adversarial Defense & Anti-Spoofing Strategy *(Market Crash Response)*](#10-adversarial-defense--anti-spoofing-strategy-market-crash-response)

---

## 1. Problem Statement

India's Q-Commerce delivery partners (Zepto, Blinkit) operate on a promise: deliver groceries in 10 minutes, regardless of conditions. Unlike food delivery, Q-Commerce workers face unique high-frequency, short-burst disruptions — a 20-minute cloudburst, a sudden zone curfew, or a neighborhood shutdown — that can silently wipe out their entire day's earnings with zero recourse.

Currently, no financial safety net exists for these workers. When a red-alert weather event hits, they lose income but have no mechanism to claim it. **InsureIt** solves this by providing automated, zero-touch income protection triggered by verified real-world events.

**Coverage scope:** Loss of working income only. We strictly exclude health, life, accident, and vehicle repair coverage.

---

## 2. Our Solution

**InsureIt** is a mobile-first, AI-powered parametric income insurance platform built exclusively for Q-Commerce delivery partners.

Instead of traditional insurance — where workers file claims, submit documents, and wait weeks — InsureIt works the other way around: **the platform detects the disruption and pays the worker automatically, before they even ask.**

Here's the core loop:
- Worker pays a small **weekly premium** (starting ₹29/week) that matches their earnings cycle
- InsureIt monitors their zone in real time using weather APIs, civic feeds, and traffic data
- When a verified disruption hits (heavy rain, curfew, extreme heat), the system **auto-triggers a claim**
- Multi-signal AI fraud detection validates the claim in seconds
- **UPI payout lands in under 90 seconds** — no forms, no documents, zero friction

InsureIt covers only what it promises: **lost income during external disruptions.** No health, no vehicle repair, no life coverage — just a direct, reliable safety net for the hours a worker cannot work through no fault of their own.

---

## 3. What Makes InsureIt Different

**1. Multi-signal fraud detection — beyond GPS**
InsureIt treats GPS as just one of 10+ independent signals. Cell tower triangulation, device barometric pressure, accelerometer motion patterns, Wi-Fi SSID fingerprinting, and platform shift status are all cross-referenced simultaneously. A spoofer can fake a GPS coordinate. They cannot simultaneously fake all of these.

**2. Coordinated ring detection**
InsureIt detects syndicates, not just individuals. If 15+ claims arrive from the same pincode within a 15-minute window during a moderate-risk event, the entire batch is paused and graph-analyzed for shared device fingerprints, IP subnets, and coordinated submission timing — catching organized fraud at the network level.

**3. False positive protection**
A genuine worker in a heavy rainstorm will have unstable GPS, poor cell signal, and a spotty network — the exact conditions that look suspicious to a naive fraud system. InsureIt's three-tier claim resolution ensures signal degradation due to bad weather never results in an unfair rejection.

**4. Predictive weekly premium**
The premium model adjusts the upcoming week's price based on the 7-day weather forecast for the worker's specific zone — not just historical averages. Workers are informed of their premium upfront before the week begins, never surprised mid-coverage.

---

## 4. Our Persona & Scenarios

### Target Persona
**Ravi, 26 — Zepto Delivery Partner, Bengaluru**
- Earns ₹600–900/day, working 8–10 hour shifts
- No fixed salary; income is entirely delivery-count dependent
- Operates a single zone (2–3 km radius dark store coverage)
- Owns a two-wheeler; pays ₹80–120/day in petrol
- Cannot afford more than ₹50–70/week in insurance premium

### Scenario 1: Flash Flood (Environmental)
Heavy rain triggers a red-alert in Ravi's zone. Zepto pauses deliveries for 3 hours. Ravi is stuck. Without InsureIt, he loses ₹200–250. With InsureIt, the platform's weather API detects rainfall > 65mm/hour in his pincode, auto-triggers a claim, and credits ₹200 to his UPI within minutes — no form submission required.

### Scenario 2: Local Strike / Curfew (Social)
An unplanned bandh shuts down roads in Ravi's zone for 5 hours. With InsureIt, civic event APIs and traffic disruption signals trigger automatic coverage for lost working hours. Payout is proportional to his average hourly income.

### Scenario 3: Extreme Heat Advisory (Environmental)
A government-issued heat advisory (>42°C, Feels Like >48°C) forces Zepto to pause outdoor deliveries between 12 PM–4 PM. InsureIt detects this via weather APIs + official advisory feeds and automatically credits partial income for the blocked hours.

---

## 5. Application Workflow
```
┌─────────────────────────────────────────────────────────────┐
│                    INSUREIT MOBILE APP                      │
└─────────────────────────────────────────────────────────────┘

[ONBOARDING]
  ↓
Worker downloads app → Mobile number OTP login
  ↓
Profile setup: Name, City, Zone, Platform (Zepto/Blinkit), Avg. weekly earnings
  ↓
AI Risk Profiling: Zone history + platform data → Risk score assigned
  ↓
Weekly Premium Quote shown → Worker selects coverage tier
  ↓
Payment via UPI / Platform wallet deduction (weekly auto-debit)

[ACTIVE COVERAGE WEEK]
  ↓
Background: InsureIt monitors weather APIs + civic feeds in worker's zone
  ↓
Disruption detected → Cross-verified against multi-source signals
  ↓
Fraud engine runs → Claim approved / flagged / rejected
  ↓
If approved: UPI payout within 90 seconds — no manual claim needed

[WORKER DASHBOARD]
  ↓
View: Active policy, coverage hours this week, past payouts, fraud score
```

---

## 6. Weekly Premium Model & Parametric Triggers

### Why Weekly Pricing?
Q-Commerce workers operate week-to-week. They do not commit to monthly budgets. Weekly premiums mirror their earnings cycle (weekly platform payouts) and make insurance psychologically accessible: "₹49 this week for ₹800 protection."

### Premium Tiers (Weekly)

| Tier | Weekly Premium | Max Weekly Payout | Coverage |
|------|---------------|-------------------|----------|
| Basic | ₹29 | ₹300 | Weather only |
| Shield | ₹49 | ₹600 | Weather + Social disruptions |
| Max | ₹79 | ₹1,000 | All triggers + extended hours |

### Dynamic Premium Calculation
The AI model adjusts base premiums using:
- **Zone risk score** (historical flood/disruption frequency for the worker's pincode)
- **Season** (monsoon months attract a 15–25% premium uplift)
- **Worker tenure** (longer claim-free history = lower premium)
- **7-day forecast** (upcoming high-risk weather week increases premium proactively)
- **Platform activity** (inactive workers are not charged; coverage only applies to active shifts)

### Parametric Triggers (No Manual Claim Required)

| Trigger | Data Source | Threshold | Payout Basis |
|---------|-------------|-----------|--------------|
| Heavy Rain | OpenWeatherMap + IMD | >65mm/hr or Red Alert | ₹/blocked hour |
| Extreme Heat | OpenWeatherMap + NDMA | >42°C + advisory issued | ₹/blocked hour |
| Flood / Waterlogging | IMD + civic flood APIs | Zone-level red alert | Flat daily rate |
| Local Curfew / Bandh | News APIs + traffic data | Zone-level access block | ₹/blocked hour |
| Platform Downtime | Simulated platform API | >30 min outage in zone | ₹/blocked hour |

**Key Rule:** Payouts are calculated as `(Average Hourly Earnings) × (Verified Blocked Hours)`, capped at the weekly payout limit.

---

## 7. Platform Justification: Mobile

Q-Commerce delivery partners are mobile-first users. They do not use laptops or desktops — every interaction happens on their smartphone, often mid-shift. A mobile application is the only viable delivery mechanism because:

1. **GPS & Sensor Access:** The mobile device provides real-time location, accelerometer, and network signals — all essential for fraud detection and disruption verification.
2. **UPI Integration:** Direct, in-app UPI payout is seamless on mobile.
3. **Push Notifications:** Workers receive instant alerts when a disruption is detected, and confirmation when a payout is credited.
4. **Low-bandwidth design:** Optimized for 2G/4G connectivity with offline-tolerant architecture.
5. **WhatsApp/SMS fallback:** Workers who face network drops during a disruption can receive payout confirmation via SMS — no internet required to receive the money.

---

## 8. AI/ML Integration Plan

### 8.1 Risk Profiling (Onboarding)
- **Model:** Gradient Boosted Trees (XGBoost)
- **Inputs:** Worker's zone pincode, historical disruption frequency, platform (Zepto/Blinkit), average working hours, season
- **Output:** Zone Risk Score (0–100) → maps to base premium multiplier
- **Training data:** Historical IMD weather data + public civic disruption records by pincode

### 8.2 Dynamic Premium Calculation
- **Model:** Rule-based engine + regression model
- **Adjusts weekly premium in real time** based on upcoming 7-day weather forecast for the worker's zone
- Example: If a 90% probability heavy rain week is forecast, Shield tier premium increases from ₹49 → ₹59 automatically

### 8.3 Fraud Detection (Claim Validation)
- **Model:** Anomaly Detection (Isolation Forest + rule-based cross-checks)
- **Inputs:** See Section 10 (Anti-Spoofing) for full data signal list
- **Output:** Fraud confidence score (0–1) → determines auto-approve / manual review / reject
- Score < 0.3 → auto-approved
- Score 0.3–0.7 → queued for lightweight human review
- Score > 0.7 → rejected with appeal option

### 8.4 Payout Prediction (Insurer Dashboard)
- **Model:** Time-series forecasting (Prophet / LSTM)
- **Predicts next week's expected claims volume** based on weather forecasts + historical claim patterns
- Helps the insurer maintain liquidity reserves

---

## 9. Tech Stack & Development Plan

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Frontend | React Native (Android-first) |
| Backend API | FastAPI (Python) |
| Database | PostgreSQL (worker profiles, policies, claims) |
| ML Models | scikit-learn, XGBoost, Prophet |
| Weather APIs | OpenWeatherMap API (free tier), IMD public feeds |
| Payments (Mock) | Razorpay Test Mode / UPI Simulator |
| Auth | Firebase Authentication (OTP-based) |
| Hosting | AWS EC2 + S3 (or Render for MVP) |
| Fraud Pipeline | Python microservice (async, FastAPI worker) |

### Development Plan

| Phase | Weeks | Focus |
|-------|-------|-------|
| Phase 1 | 1–2 | Architecture design, README, risk model prototype, UI wireframes |
| Phase 2 | 3–4 | Registration flow, policy management, dynamic premium engine, claims management |
| Phase 3 | 5–6 | Advanced fraud detection, simulated payouts, analytics dashboard, final pitch |

---

## 10. Adversarial Defense & Anti-Spoofing Strategy *(Market Crash Response)*

> **Context:** A coordinated syndicate of 500 delivery workers exploited a parametric insurance platform by using GPS-spoofing applications to fake their location inside red-alert weather zones — triggering mass false payouts while sitting safely at home. InsureIt's architecture is designed from the ground up to make this attack class economically and technically infeasible.

### 10.1 The Differentiation — Genuine Stranded Worker vs. GPS Spoofer

A genuine delivery partner caught in a disruption exhibits a coherent, explainable behavioral signature across multiple independent data streams. A spoofer can fake GPS coordinates but cannot simultaneously fake all of the following:

**Signal Cluster A — Device Telemetry (Unfakeable without root access)**
- **Accelerometer & gyroscope patterns:** A worker genuinely on a waterlogged street shows low-frequency, irregular motion typical of a stationary or slow-moving person outdoors. A spoofer at home shows the characteristic stillness of a resting person, or motion inconsistent with being outdoors.
- **Barometric pressure sensor:** Outdoor environments (especially during storms) show measurable pressure fluctuations. Indoor environments are stable. Cross-referencing the device barometer with expected outdoor pressure during a weather event adds a passive, unfakeable signal.
- **Battery drain pattern:** Active GPS navigation in field conditions drains battery faster than a phone lying on a table at home. Anomalous low-drain during an "outdoor" claim is a soft fraud signal.

**Signal Cluster B — Network & Connectivity Signals**
- **Cell tower triangulation:** Even if GPS coordinates are spoofed, the phone connects to real cell towers. InsureIt cross-references the reported GPS location against the actual cell tower ID the device is connected to. If the claimed location is Zone X but the cell tower serves Zone Y (3 km away), this is a strong fraud signal.
- **IP geolocation:** The device's IP address via mobile data provides a coarse but independent location estimate. A VPN being active during a claim is itself flagged as a soft fraud signal.
- **Wi-Fi SSID fingerprint:** If the device is connected to a known home Wi-Fi network during the claim, this strongly indicates the worker is at home, not in the field.

**Signal Cluster C — Behavioral & Historical Signals**
- **Platform activity API (simulated):** The worker's delivery platform shows their last active delivery timestamp and current shift status. A worker flagged as "offline" on the platform at the same time they claim to be stranded is immediately cross-checked.
- **Historical claim pattern:** InsureIt's ML model scores each claim against the worker's personal claim history. First-time claims in a new zone, sudden spikes in claim frequency, or claims that consistently coincide with maximum payout thresholds are anomaly signals.
- **Zone-level claim density:** If 15+ workers in a single pincode simultaneously file claims within a 10-minute window and the weather data only partially supports the claim, this triggers a coordinated fraud flag at the ring level — not just the individual level.

### 10.2 The Data — Catching a Coordinated Fraud Ring

Individual fraud detection is table stakes. Coordinated rings require graph-level analysis.

**Data Points Collected Per Claim:**

| Signal | Source | Why it Matters |
|--------|---------|----------------|
| GPS coordinates | Device (flagged if spoofed) | Primary location claim |
| Cell tower ID | Telecom network | Independent location ground truth |
| Device accelerometer | On-device sensor | Motion consistency check |
| Barometric pressure | On-device sensor | Indoor/outdoor differentiation |
| Wi-Fi SSID hash | Network metadata | Home vs field detection |
| IP address | Network layer | Coarse geo-verification |
| Platform shift status | Simulated platform API | Is worker actually working? |
| Claim submission timestamp | App server | Time correlation with weather event |
| Historical claim frequency | InsureIt DB | Personal baseline comparison |
| Zone-level claim density | InsureIt DB | Ring detection |
| Device fingerprint | App SDK | Detects multiple accounts on same device |

**Ring Detection Logic:**
- If ≥ 15 claims from the same pincode arrive within a 15-minute window during a moderate-risk weather event → entire batch is paused and routed to enhanced review
- Graph analysis: workers who share device fingerprints, same IP subnet, or submitted claims within seconds of each other are clustered and reviewed as a coordinated group

### 10.3 The UX Balance — Flagging Bad Actors Without Punishing Honest Workers

The hardest problem is not detection — it's the false positive rate. A genuine worker in a heavy rainstorm may have poor GPS signal, spotty cell connectivity, and an unstable network. Penalizing them is unacceptable.

**InsureIt's Three-Tier Claim Resolution:**

**Tier 1 — Auto-Approved (Fraud Score < 0.3)**
- All signals align: GPS consistent with cell tower, weather data confirms red alert, platform shows active shift, no anomaly in history
- Payout credited within 90 seconds, no worker action required
- Worker receives push notification + SMS: "₹X credited. Stay safe."

**Tier 2 — Soft Review (Fraud Score 0.3–0.7)**
- One or two signals are ambiguous (e.g., GPS slightly inconsistent with cell tower — understandable in bad weather)
- Worker receives a single, low-friction verification step: **"We noticed your network was unstable. Tap to confirm you were in [Zone Name] during the disruption."**
- No photo upload, no documentation. A single tap confirmation is sufficient for borderline cases
- If worker does not respond within 2 hours, claim is temporarily held (not rejected) and reviewed manually within 24 hours

**Tier 3 — Rejected with Appeal (Fraud Score > 0.7)**
- Strong conflicting signals (e.g., home Wi-Fi detected + cell tower mismatch + no active platform shift)
- Worker is notified immediately with a clear appeal option
- Workers with a clean history (>3 months, no prior flags) receive automatic benefit-of-doubt: their first high-score claim is escalated to review rather than outright rejected

**What We Never Do:**
- Never require workers to upload photos or proof documents
- Never reject a claim solely because of GPS instability (rain causes real GPS drift)
- Never punish a worker for a network drop — that is the expected condition during the exact events we insure against

---

## Phase 1 Submission Checklist
- [x] Persona defined: Q-Commerce (Zepto / Blinkit)
- [x] Persona-based scenarios documented
- [x] Application workflow outlined
- [x] Weekly premium model defined
- [x] Parametric triggers specified
- [x] Platform choice justified (Mobile)
- [x] AI/ML integration plan detailed
- [x] Tech stack outlined
- [x] What Makes InsureIt Different — novelty section added
- [x] Adversarial Defense & Anti-Spoofing Strategy added *(Market Crash Response)*
- [ ] GitHub repository live with this README
- [ ] 2-minute video uploaded (publicly accessible link)

---

*InsureIt — Built for the last mile. Powered by AI. Trusted by the worker.*