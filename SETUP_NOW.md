# InsureIt Setup Guide

## What is in the repo now

- `app/`: FastAPI backend for auth, premium quotes, policy purchase, live policy lookup, claim history, weather checks, and trigger simulation.
- `mobile-app/`: React Native frontend with 4 screens:
  - `Register`
  - `Policy`
  - `Premium`
  - `Claims`

## Backend setup

1. Create and activate a Python virtual environment.
2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Optional: create a `.env` from `.env.example` if you want a live OpenWeatherMap key.
4. Start the API:

```powershell
uvicorn app.main:app --reload
```

5. Backend runs at `http://127.0.0.1:8000`.

### Demo credentials

- Email: `ravi@insureit.demo`
- Password: `demo123`

## React Native frontend setup

1. Go to the mobile app directory:

```powershell
cd mobile-app
```

2. Install packages:

```powershell
npm install
```

3. Optionally copy `mobile-app/.env.example` and set the API base URL for your device:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://YOUR_LOCAL_IP:8000"
```

Notes:
- Android emulator can usually use `http://10.0.2.2:8000`.
- A physical device should use your computer's LAN IP, for example `http://192.168.1.15:8000`.

4. Start Expo:

```powershell
npm run start
```

## Demo flow

1. Open `Register` and sign in with the seeded demo account, or create a new user.
2. Open `Premium` and fetch policy quotes from the backend.
3. Purchase a policy tier if the user does not already have one.
4. Open `Policy` to confirm the active coverage.
5. Open `Claims` and use:
   - `Simulate platform disruption`
   - `Simulate weather trigger`
6. The app will call the backend, auto-create a paid claim, and show payout confirmation plus updated claim history.

## Current API wiring used by the frontend

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /premium/quote`
- `POST /policy/purchase`
- `GET /policy/active`
- `GET /claims`
- `POST /claims/simulate-trigger`
- `POST /weather/check-trigger`

## Packaging

After changes are complete, create a project zip from the repo root:

```powershell
Compress-Archive -Path app, mobile-app, requirements.txt, README.md, BACKEND_SETUP.md, SETUP_NOW.md, docker-compose.yml, start.ps1, .env.example, .gitignore -DestinationPath InsureIt-current-build.zip -Force
```
