# Force-Friction AI 🔒🧠

Force-Friction AI is a behavior-aware focus tool designed to break the cycle of doomscrolling through mindful friction. Unlike traditional site blockers that simply restrict access, Force-Friction asks **why** you're visiting a site and provides personalized, non-judgmental feedback based on your actual usage patterns.

## 🚀 Core Features (The USP)

- **AI Intent Check & 5-Minute Unlock**: Before opening addictive platforms (YouTube, Instagram, TikTok), the system asks for your intent (e.g., Work, Study, Boredom) and introduces a 5-second mindful friction lock before initiating a 5-minute unlock window.
- **Behavior-Aware Responses & Dynamic Tone**: 
  - **Dynamic Tone Adjustment**: The system adjusts its non-judgmental feedback tone based on your visit frequency—using a gentle nudge for low frequency (<5) and a direct intervention for high frequency (≥10).
  - **Productive Intent Validation**: Supports deep work with tiered feedback (Silent Allow, Positive Reinforcement, Mindful Escalation).
  - **Mindful Browsing Pause**: A data-backed awareness pause encouraging a reset after mindless browsing loops.
- **Session Reflection (Mindful Silence)**: Evaluates your session time after the unlock period expires. It remains silently out of your way for short, intentional sessions (<5 minutes), but generates brief, actionable reflection messages for longer, potentially distracting sessions.
- **Deep Analytics Dashboard (Bento Grid 2.0)**: Tracks visit counts, boredom-driven triggers, and session durations, visualizing your digital habits with charts and personalized insights within a sleek Bento Grid layout.
- **Cyber-Ink Aesthetic**: A cohesive, premium dark-mode design language applied across the web dashboard and browser extension overlay, featuring smooth micro-animations and a functional progress bar.

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python)
- **Database**: SQLite3
- **Frontend**: Chrome Extension (Manifest V3)
- **Analytics Dashboard**: Pure HTML/CSS/JS with Chart.js in a Bento Grid 2.0 layout
- **Styling**: Vanilla CSS utilizing a premium "Cyber-Ink" dark-mode aesthetic with smooth micro-animations

## 🏗️ System Architecture

Force-Friction AI operates as a client-server model locally on your machine:
1. **Chrome Extension (Frontend)**: Intercepts access to addictive sites (`content.js`), handles Single Page Application (SPA) navigations (`background.js`), and presents the mindful friction UI. It constantly polls the backend to verify the lock/unlock status.
2. **FastAPI Server (Backend)**: Evaluates user intent based on recent usage patterns (`main.py`), manages a global 5-minute unlock timer, and generates personalized, non-judgmental responses.
3. **SQLite Database**: Persistently logs user intents, session durations, and blocked attempts (`database.py`) to build usage history.
4. **Analytics Dashboard**: A local HTML interface (`dashboard.html`) that retrieves data from the backend to visualize digital habits, mood correlations, and focus statistics.

## 📂 Folder Architecture

```text
Force-Friction-AI/
├── .venv/               # Python virtual environment
├── analytics.db         # SQLite database storing usage logs and stats
├── background.js        # Chrome Extension background worker (SPA routing)
├── content.js           # Chrome Extension script (Injects UI, polls backend)
├── dashboard.html       # Analytics dashboard interface
├── database.py          # Database operations and schema logic
├── main.py              # FastAPI backend server and intent evaluation
├── manifest.json        # Chrome Extension configuration (Manifest V3)
├── README.md            # Project documentation
├── run.ps1              # PowerShell script to orchestrate backend and vision engine
└── vision_engine.py     # Local OpenCV script for face-lock verification
```

## 📥 Installation & Setup

### 1. Backend Setup
1. Ensure you have Python 3.8+ installed.
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn pydantic
   ```
3. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### 2. Extension Setup
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `Force-Friction-AI` project folder.

### 3. Analytics Dashboard
Navigate to `http://127.0.0.1:8000/dashboard` in your web browser to view your mood correlations, 7-day mood scores, and top addictive sites, served directly from the backend!

## 📜 Usage Flow

1. **The Gate**: You open an addictive site.
2. **The Intent**: A premium card asks: *"Why are you opening this?"*
3. **The Response**: 
   - **Productive (Study/Work)**: 
     - Session #1: Silent allow.
     - Session #5: *"Study session #5. You got this."*
     - Session #9: *"8+ study sessions open. Break or continue?"*
   - **Habit/Boredom**:
     - Visit #3: *"Visit #3 to instagram.com. Stay intentional."*
     - Visit #11: *"We've opened youtube.com 11x in 2h. 5-min reset or proceed?"*
4. **The Choice**: You decide whether to proceed or step away.

---
*Built to turn mindless scrolling into mindful living.*

## Hackathon Judges Supplement: Technical Deep Dive

### 1. Technical Architecture

```text
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                                CLIENT LAYER (Browser Host)                                              │
 │  ┌─────────────────────────────────────────────────────────────────┐   ┌─────────────────────────────────────────────┐  │
 │  │                     CHROME EXTENSION FRONTEND                   │   │             ANALYTICS DASHBOARD             │  │
 │  │                 (Manifest V3 / DOM Interceptor)                 │   │              (Pure HTML5/CSS/JS)            │  │
 │  │                                                                 │   │                                             │  │
 │  │  • Intercepts DOM on YouTube/Instagram before loading page      │   │  • Assembles data visualizations via        │  │
 │  │  • Injects modern, unclosable focus-friction modal overlay      │   │    Chart.js rendering canvas elements       │  │
 │  │  • Fetches teammate lock state updates ("Binary Souls")         │   │  • Displays behavioral statistics, mood     │  │
 │  │  • Captures study-btn, break-btn, and bored-btn click events    │   │    trends, and daily distraction loops      │  │
 │  └────────────────────────────────┬────────────────────────────────┘   └──────────────────────▲──────────────────────┘  │
 └───────────────────────────────────┼───────────────────────────────────────────────────────────┼─────────────────────────┘
                                     │                                                           │
         1. [GET]  /api/status       │ ──► (Inquire global locked/unlocked state & time window)  │ 6. [GET] /api/analytics
         ────────────────────────────┼───────────────────────────────────────────────────────────┘ ──► (Fetch logs summary)
         2. [POST] /log-intent       │ ──► (Submit user reason & evaluate friction levels)
         ────────────────────────────┼───────────────────────────────────────────────────────────┐
         3. [POST] /api/unlock       │ ──► (Instant bypass click triggers unlock on server)      │
         ────────────────────────────┼─────────────────────────────────────────────────────┐     │
         4. [POST] /api/session-end  │ ──► (Logs active duration & triggers post-reflection)│     │
         ────────────────────────────┼──────────────────────────────┐                      │     │
         5. [GET]  /api/team/stats   │ ──► (Social accountability)  │                      │     │
                                     ▼                              ▼                      ▼     ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                           APPLICATION ROUTING LAYER (FastAPI)                                           │
 │  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
 │  │                                                main.py (Web Server)                                               │  │
 │  │                                                                                                                   │  │
 │  │  • State Tracker: Manages transient system memory (IS_LOCKED state status, UNLOCK_EXPIRY UTC timestamp logs)      │  │
 │  │  • Intent Engine: Analyzes user-defined reason against historical metrics to evaluate current behavior category   │  │
 │  │  • Copy Generator: Employs gentle "we" phrasing to shape empathetic, non-judgmental guidance messages             │  │
 │  │  • Social Controller: Orchestrates state syncing for team mode ("Binary Souls" status configurations)            │  │
 │  └──────────────────────────▲─────────────────────────────────────────────────────────────────┬─────────────────────┘  │
 └─────────────────────────────┼─────────────────────────────────────────────────────────────────┼─────────────────────────┘
                               │                                                                 │
                               │ 7. [POST] /api/unlock                                           │ 9. Internal DB Methods
                               │    ◄── (Trigger unlock on 5s contiguous webcam face lock)       │    (database.py calls:
                               │                                                                 │     log_intent, log_event,
                               │ 8. [POST] /api/log                                              │     get_analytics_summary)
                               │    ◄── (Transmit system telemetry verification logs)            │
                               │                                                                 ▼
 ┌─────────────────────────────┴─────────────────────────────────────┐   ┌───────────────────────┴───────────────────────┐
 │               ASYNCHRONOUS ML PROCESSING PIPELINE                 │   │             DATABASE PERSISTENCE              │
 │  ┌─────────────────────────────────────────────────────────────┐  │   │  ┌──────────────────────────────────────────┐  │
 │  │             OPENCV VISION ENGINE (vision_engine.py)         │  │   │  │              SQLite3 DATABASE            │  │
 │  │                                                             │  │   │  │               (analytics.db)             │  │
 │  │  • Frame Capture: cv2.VideoCapture(0) camera loop           │  │   │  │                                          │  │
 │  │  • Image Preprocessing: Horizontal flip & grayscale transform │  │   │  │  • intent_logs table: User reasons & logs│  │
 │  │  • Haar Cascade: haarcascade_frontalface_default face match │  │   │  │  • session_logs table: Active durations  │  │
 │  │  • Temporal Streak: Calculates contiguous 5.0-second focus  │  │   │  │  • activity_logs table: Lock state history│  │
 │  └─────────────────────────────────────────────────────────────┘  │   │  └──────────────────────────────────────────┘  │
 └───────────────────────────────────────────────────────────────────┘   └───────────────────────────────────────────────┘
```

### 2. System Lifecycle

1. **DOM Interception**: The Chrome Extension monitors navigation events. When a user navigates to a distracting domain (e.g., YouTube or Instagram), the extension intercepts the DOM immediately before the page can fully render.
2. **Core Blocker Injection**: The content script injects the `heavyForceBlock` component—an un-closable, full-screen overlay with a heavy blur effect and a "Focus-Friction Active" warning, completely restricting interaction with the underlying content.
3. **Async Computer Vision Face-Lock Verification**: The extension asynchronously pings the FastAPI backend. The backend triggers the OpenCV engine, which runs a non-blocking facial recognition and posture analysis check to verify if the user is actively at their desk and focused (Face-Lock).
4. **State Mutation**: Based on the OpenCV results, the FastAPI backend mutates the local user's focus state (e.g., locked in vs. distracted) and persists this updated state into the SQLite database.
5. **Social Duo Mode Sync**: The system triggers a real-time sync with the database, updating the injected "Binary Souls" accountability UI block with the latest team status. The UI dynamically shifts to show either "🟢 FOCUSED" or "⚠️ IN A LOOP" to enforce social accountability.

### 3. Setup & Deployment Guide

#### Backend Setup (FastAPI & OpenCV)
```bash
# 1. Create a Python virtual environment
python -m venv venv

# 2. Activate the virtual environment
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# 3. Install core dependencies
pip install fastapi uvicorn opencv-python

# 4. Boot the FastAPI backend server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### Chrome Extension Setup (Manual Unpacked)
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle on **Developer mode** in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the project directory containing the `manifest.json` file.
5. The extension is now loaded and will immediately begin intercepting target domains.

### 4. API Reference

| Endpoint | HTTP Verb | Required Payload (JSON) | Success Response Schema | Description |
|---|---|---|---|---|
| `/api/status` | `GET` | *None* | `{"status": "LOCKED" \| "UNLOCKED", "time_remaining": int}` | Fetches the current system lock state and remaining unlock time window. |
| `/api/team/stats` | `GET` | *None* | `{"partner_status": "FOCUSED"}` | Retrieves the real-time focus status of the paired teammate (Binary Souls). |
| `/api/team/pair` | `POST` | `{"partner_id": "string"}` | `{"success": true, "team_id": "string"}` | Pairs two users together for social accountability and syncs states. |
| `/api/lock` | `POST` | *None* | `{"success": true, "message": "System locked immediately"}` | Manually forces an immediate lock state, overriding any active timers. |
| `/api/unlock` | `POST` | *None* | `{"success": true, "message": "string", "expiry": "ISO8601"}` | Unlocks the system for exactly 2 minutes after a successful Face-Lock. |
| `/api/log` | `POST` | `{"event_type": "string", "platform": "string"}` | `{"success": true, "message": "Event logged successfully"}` | Persists interactions, blocked attempts, and CV unlock triggers to the SQLite DB. |

### 5. Computer Vision Pipeline

The Focus Friction AI leverages a localized computer vision script (`vision_engine.py`) to verify user presence and intent natively, ensuring privacy and eliminating cloud compute latency. 

1. **Frame Matrix Acquisition**: The engine initializes the primary webcam (`cv2.VideoCapture(0)`). Each incoming frame is captured as a BGR matrix, horizontally flipped to create a natural mirror effect, and instantly down-converted to a grayscale matrix (`cv2.cvtColor`) to heavily reduce processing overhead.
2. **Haar Cascade Detection**: OpenCV's `haarcascade_frontalface_default.xml` classifier (`detectMultiScale`) is applied against the grayscale matrix frame-by-frame to identify facial structures. 
3. **Temporal Face-Lock Tracking**: The engine enforces a strict `TARGET_STREAK` (5.0 seconds). When a face is detected, a `streak_active` state is toggled and a timer begins. If the face is lost or obstructed before the timer finishes, the streak is instantly reset to zero (`color = (0, 0, 255)`).
4. **State Mutation & Async Trigger**: Once a continuous 5-second Face-Lock is achieved, the script executes non-blocking background `requests.post()` calls to `/api/unlock` and `/api/log`. This mutates the backend state allowing browser access, logs the successful verification event, and triggers an immediate "UNLOCKED!" visual overlay confirmation on the local CV diagnostic feed.
