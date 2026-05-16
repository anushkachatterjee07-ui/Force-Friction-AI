# Force-Friction AI 🔒🧠

Force-Friction AI is a behavior-aware focus tool designed to break the cycle of doomscrolling through mindful friction. Unlike traditional site blockers that simply restrict access, Force-Friction asks **why** you're visiting a site and provides personalized, non-judgmental feedback based on your actual usage patterns.

## 🚀 Core Features (The USP)

- **AI Intent Check**: Before opening addictive platforms (YouTube, Instagram, TikTok), the system asks for your intent (e.g., Work, Study, Boredom).
- **Behavior-Aware Responses**: 
  - **Productive Intent**: Instant access if you're there for work or learning.
  - **Doomscrolling Detection**: If you're visiting out of habit or boredom, the AI introduces a "Mindful Pause" with real-time stats (e.g., "We've opened this 12 times in the last 3 hours").
- **Mindful Friction**: Uses non-judgmental "we" phrasing and ends with a choice, empowering you to make a conscious decision rather than following a command.
- **Deep Analytics**: Tracks visit counts, boredom-driven triggers, and session durations to help you understand your digital habits.

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python)
- **Database**: SQLite3
- **Frontend**: Chrome Extension (Manifest V3)
- **Styling**: Vanilla CSS with a premium dark-mode aesthetic

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
   The backend will be available at `http://127.0.0.1:8000`.

### 2. Extension Setup
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right).
3. Click **Load unpacked** and select the `Force-Friction-AI` project folder.
4. The extension is now active on YouTube, Instagram, and TikTok.

## 🧩 Project Structure

- `main.py`: FastAPI application handling logic and state.
- `database.py`: SQLite integration for logging intents and usage stats.
- `content.js`: The "Friction Engine" that injects the UI and intercepts scrolling.
- `manifest.json`: Extension configuration and permissions.

## 📜 Usage Flow

1. **The Gate**: You open an addictive site.
2. **The Intent**: A premium dark-mode card appears asking: *"Why are you opening this?"*
3. **The Response**: 
   - Select **Study** -> The barrier disappears immediately.
   - Select **Habit** -> A message appears: *"We've visited this site 10 times in 2 hours. Do we want to continue or take a 5-minute breather?"*
4. **The Choice**: You decide whether to proceed or step away.

---
*Built to turn mindless scrolling into mindful living.*
