# Force-Friction AI 🔒🧠

Force-Friction AI is a local focus tool that adds mindful friction to addictive browsing. Instead of blocking sites outright, it asks why you're opening them, evaluates your intent, and uses a webcam-based attention check to decide whether to grant temporary access.

## 🚀 What it does
- Intercepts visits to `youtube.com` and `instagram.com` through a Chrome extension.
- Asks the user for intent before opening the site.
- Logs intent and evaluates whether the visit is productive, habitual, or mindless.
- Uses a local vision engine to verify attention before unlocking access.
- Stores event data in `analytics.db` and serves a dashboard for usage analytics.

## 🛠️ Tech Stack
- Backend: `FastAPI` (`main.py`)
- Vision engine: `OpenCV` (`vision_engine.py`)
- Database: `SQLite` (`database.py`)
- Extension: Chrome Manifest V3 (`manifest.json`, `content.js`, `background.js`)
- Dashboard: `dashboard.html` with vanilla HTML/CSS/JS

## 🏗️ Project architecture
- The Chrome extension intercepts navigation to supported sites and sends intent data to the backend.
- The FastAPI backend evaluates intent, logs events to SQLite, and exposes lock state endpoints for the extension.
- The vision engine runs locally with the webcam and sends heartbeat and focus-state updates to the backend.
- Successful face-based focus validation triggers the backend to unlock access for the browser.
- The dashboard is served by the backend and displays analytics from `analytics.db`.

## 📂 Project structure
```text
Force-Friction-AI/
├── .venv/               # Python virtual environment
├── analytics.db         # SQLite database created automatically
├── background.js        # Chrome Extension background script
├── content.js           # Chrome Extension content script
├── dashboard.html       # Analytics dashboard UI
├── database.py          # SQLite persistence and analytics helpers
├── main.py              # FastAPI backend server
├── manifest.json        # Chrome extension manifest
├── README.md            # Project documentation
├── run.ps1              # Launcher script for Windows
└── vision_engine.py     # Webcam attention verification engine
```

## 📥 Installation

### 1. Create and activate the virtual environment
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install dependencies
```powershell
python -m pip install fastapi uvicorn pydantic requests opencv-python
```

### 3. Start the backend
```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

### 4. Start the vision engine
```powershell
.\.venv\Scripts\python.exe vision_engine.py
```

### 5. Load the Chrome extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `Force-Friction-AI` folder

### 6. Open the dashboard
Visit `http://127.0.0.1:8000/dashboard`

## ▶️ Run with `run.ps1`
After activating the venv, run `run.ps1` to start the backend and the vision engine in separate windows.

## 🔍 How it works
- The Chrome extension intercepts supported sites and sends user intent to the backend.
- The backend logs the intent and evaluates whether the visit should be allowed or held for friction.
- The vision engine validates attention and updates the backend via heartbeat and focus-state endpoints.
- Unlocks are granted only after a sustained focus streak.
- Session events are recorded in SQLite for dashboard analytics.

## 🌐 Available API endpoints
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/status` | GET | Returns current lock state and remaining time |
| `/api/focus-state` | GET | Returns current vision focus state and engine liveness |
| `/api/verify-focus` | GET | Verifies whether the vision engine reports active focus |
| `/api/unlock` | POST | Unlocks the system for the default unlock duration |
| `/api/log` | POST | Logs activity events |
| `/log-intent` | POST | Logs user intent and evaluates the site action |
| `/api/session-end` | POST | Logs session end and returns reflection/question prompts |
| `/api/analytics` | GET | Returns dashboard summary analytics |
| `/dashboard` | GET | Serves the analytics dashboard page |
| `/get-mood-stats` | GET | Returns mood analytics for the dashboard |

## ⚠️ Notes
- `database.py` auto-creates `analytics.db` on first run.
- The extension communicates with `http://127.0.0.1:8000/*`.
- The vision engine requires a working webcam and OpenCV.
- If you want a dependency file, add a `requirements.txt` listing `fastapi`, `uvicorn`, `pydantic`, `requests`, and `opencv-python`.

---

**Force-Friction AI** helps make browsing more intentional by combining browser friction, intent logging, and attention validation.
