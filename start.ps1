Copy-Item .env.example .env -ErrorAction SilentlyContinue
docker compose up -d db
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
