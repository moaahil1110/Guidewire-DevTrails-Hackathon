# InsureIt Backend Setup

## What is included
- FastAPI backend with `auth`, `premium`, `policy`, and `claims` endpoints
- PostgreSQL database via Docker Compose
- Seeded demo user and active Shield policy
- OpenWeatherMap trigger evaluation with mock fallback for demos

## Demo credentials
- Email: `ravi@insureit.demo`
- Password: `demo123`

## Quick start
1. Copy `.env.example` to `.env`
2. Add `OPENWEATHERMAP_API_KEY` if you want live weather data
3. Start PostgreSQL:
   `docker compose up -d db`
4. Create and activate a virtual environment:
   `python -m venv .venv`
   `. .\.venv\Scripts\Activate.ps1`
5. Install packages:
   `pip install -r requirements.txt`
6. Run the API:
   `uvicorn app.main:app --reload`

## Test flow
1. Open Swagger UI at `http://127.0.0.1:8000/docs`
2. Call `POST /auth/login` with the demo credentials
3. Copy the bearer token and click `Authorize`
4. Call `GET /auth/me`
5. Call `POST /premium/quote`
6. Call `GET /policy/active`
7. Demo weather auto-claim:
   Use `POST /weather/check-trigger` with:
   ```json
   {
     "lat": 12.9716,
     "lon": 77.5946,
     "blocked_hours": 3,
     "force_mock": true
   }
   ```
8. Demo manual disruption:
   Use `POST /claims/simulate-trigger` with:
   ```json
   {
     "disruption_type": "platform_downtime",
     "blocked_hours": 2.5,
     "trigger_source": "demo-video"
   }
   ```
9. Call `GET /claims` to show the auto-created payout records

## Notes
- If `OPENWEATHERMAP_API_KEY` is empty, `force_mock: true` gives a deterministic heavy-rain trigger for your demo.
- The payout formula is `avg_hourly_earnings * blocked_hours`, capped by the weekly policy payout limit.
- The database tables are auto-created on startup for MVP speed.
