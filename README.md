# **Koto**
An Open-Source flashcard application for studying with flashcards using a spaced repetition system (SRS). Cards you struggle with appear more often; cards you know well appear less. The goal is efficent, long-term retention.
### **Status**
This project is currently under development. Backend is in progress. Frontend and Databrick integration are planned next.
### **Features**
* **Decks & Cards**: Create decks, add flashcards with a term and definition
* **Spaced Repetition Scheduling**: SuperMemo (SM-2) or similar algorithm to schedule card reviews
* **User Accounts**: Register, login, and keep your decks private
* **Review History**: Track every review session per card
* **Analytics (via Databricks)**: Retention curves, deck difficulty scoring, study breaks
* **Web Frontend**: Clean React UI for studying on any computer
### **Learning Goals**
I built this project from scratch to learn:

* Full-stack web development (FastAPI + React)
* Database desgin with SQLAlchemy and PostgreSQL
* REST API design and JWT authentication
* React componenent architecture and state management
* Data engineering fundamentals with Databricks and PySpark
* Self-hosted deployment with a Raspberry Pi
### **Setup**
1. Build the Rust SM-2 module (required before the backend will start):
   ```
   cd koto_srs
   maturin develop --release   # or: pipx run maturin build --release + pip install the wheel
   cd ..
   ```
   This is a compiled PyO3 extension, so it is built from source and intentionally NOT listed in requirements.txt. The installed wheel is version- and platform-specific (e.g. cp313-win_amd64) — build it in the venv you'll run the app in.
2. Install Python deps:
   ```
   pip install -r requirements.txt
   ```
3. Configure the environment: copy the `.env` keys (DATABASE_URL, SECRET_KEY, ALGORITHM) — `.env` is gitignored, never commit it.
4. Run the backend: `uvicorn main:app --reload` from `backend/` and the frontend from `frontend/`.
### **Tests**
* Rust SM-2 algorithm: `cd koto_srs; cargo test`
* Python API (runs against a temporary SQLite DB): `python -m pytest backend -q`