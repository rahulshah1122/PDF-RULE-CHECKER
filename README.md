# PDF-RULE-CHECKER

A small project to upload a PDF and check it against user-defined rules.

## Repository layout

- `Backend/` - Python backend (FastAPI) with `main.py` and `requirements.txt`
- `Frontend/` - React app with `package.json` and source in `src/`

## Prerequisites

- Node.js (v14+ recommended) and npm
- Python 3.8+
- Git (optional)

## Backend (development)

1. Open a terminal and change into the backend folder:

   ```powershell
   cd Backend
   ```

2. Create and activate a virtual environment (Windows PowerShell):

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   On macOS/Linux:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:

   # PDF-RULE-CHECKER

   Minimal instructions (only items used by this assignment)

   ## What this project uses

   - Backend: Python 3 + FastAPI, `uvicorn` for development server
   - PDF parsing: `PyPDF2`
   - Environment variables: `python-dotenv` (loads `Backend/.env`)
   - HTTP client: `httpx` (used in `Backend/main.py` to call Perplexity API)
   - Frontend: React (Create React App), started with `npm start`

   ## Repository layout

   - `Backend/` — FastAPI app (`main.py`) and `requirements.txt`
   - `Frontend/` — React app (`src/`, `package.json`)

   ## Prerequisites

   - Python 3.8+
   - Node.js + npm

   ## Backend: setup & run

   1. From project root, open a terminal and change to the backend directory:

   ```powershell
   cd Backend
   ```

   2. Create and activate a virtual environment (Windows PowerShell):

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   On macOS/Linux:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

   3. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

   4. Create `Backend/.env` with the Perplexity API key (this project calls Perplexity):

   ```text
   # Backend/.env
   PERPLEXITY_API_KEY=sk-...        # required
   PERPLEXITY_API_URL=               # optional; default used if empty
   CORS_ORIGINS=http://localhost:3000 # optional, if you want to restrict origins
   ```

   5. Run the backend server:

   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

   The backend exposes `POST /check-pdf/` which the frontend calls.

   ## Frontend: setup & run

   1. Change to the frontend folder and install dependencies:

   ```bash
   cd Frontend
   npm install
   ```

   2. Start the dev server:

   ```bash
   npm start
   ```

   Open `http://localhost:3000` and use the UI to upload a PDF and check rules.

   ## Notes & troubleshooting

   - If the backend returns `Perplexity not configured` error, ensure `Backend/.env` contains `PERPLEXITY_API_KEY` and restart the backend.
   - If the frontend cannot reach the backend, confirm the backend is running on `http://localhost:8000` and check CORS settings in `Backend/main.py`.
   - This README only documents tools and env vars actually used in the current codebase.
If your backend reads environment variables with a different naming convention, adjust the keys above to match the code in `Backend/main.py`.



## Security & Deployment

