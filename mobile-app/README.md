# InsureIt Mobile App

React Native + Expo mobile frontend for the InsureIt hackathon project.

## What This App Does

The mobile app connects to the FastAPI backend in the same repository and supports:

- Login with the seeded demo user or a registered user
- New worker registration
- Home dashboard with policy and payout summary
- Premium quote lookup and policy purchase
- Active policy viewing
- Claim simulation and claim history
- Account/profile view with sign-out

## Prerequisites

- Node.js 18+
- npm
- Expo-compatible simulator or Expo Go
- Python environment for the backend

## Backend Setup

From the repository root:

```bash
cd /Users/hafizmohammedaahil/Documents/Hackathons/Guidewire-DevTrails/Guidewire-DevTrails-Hackathon
python -m uvicorn app.main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

Demo credentials:

```text
Email: ravi@insureit.demo
Password: demo123
```

## Frontend Setup

From `mobile-app/`:

```bash
npm install
cp .env.example .env
```

Then update `.env` if needed:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

Recommended values by environment:

- Android emulator: `http://10.0.2.2:8000`
- iOS simulator: `http://localhost:8000`
- Physical device: `http://<your-lan-ip>:8000`

## Run The App

```bash
cd /Users/hafizmohammedaahil/Documents/Hackathons/Guidewire-DevTrails/Guidewire-DevTrails-Hackathon/mobile-app
npm start
```

Optional:

```bash
npm run android
npm run ios
npm run web
```

## Login Contract

The mobile frontend sends JSON to:

```text
POST /auth/login
```

Payload:

```json
{
  "email": "ravi@insureit.demo",
  "password": "demo123"
}
```

This matches the current FastAPI backend implementation.

## Main Backend Endpoints Used

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /premium/quote`
- `POST /policy/purchase`
- `GET /policy/active`
- `GET /claims`
- `POST /claims/simulate-trigger`
- `POST /weather/check-trigger`

## Mobile Notes

- The weather trigger flow currently calls the backend with mock mode enabled for reliable demo behavior.
- If the backend is unreachable, the app will surface auth or API errors instead of silently failing.
- The app is currently configured as a light theme mobile experience.

## Recommended Demo Flow

1. Start the FastAPI backend.
2. Set `EXPO_PUBLIC_API_BASE_URL` correctly for your simulator/device.
3. Start Expo from `mobile-app/`.
4. Log in with the demo account.
5. Open `Premium` and view quotes.
6. Purchase a policy if needed.
7. Open `Policy` to confirm active coverage.
8. Open `Claims` and run disruption simulations.
9. Open `Home` and `Account` to show the supporting dashboard/profile views.
