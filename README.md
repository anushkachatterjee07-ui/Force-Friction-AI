# Force-Friction AI 🔒🧠

Force-Friction AI is a behavior-aware focus tool designed to break the cycle of doomscrolling through mindful friction. Unlike traditional site blockers that simply restrict access, Force-Friction asks **why** you're visiting a site and provides personalized, non-judgmental feedback based on your actual usage patterns.

## 🚀 Core Features (The USP)

- **AI Intent Check**: Before opening addictive platforms (YouTube, Instagram, TikTok), the system asks for your intent (e.g., Work, Study, Boredom).
- **Behavior-Aware Responses**: 
  - **Productive Intent Validation**: Supporting deep work with tiered feedback.
    - *Silent Allow*: Instant access for the first few sessions.
    - *Positive Reinforcement*: Encouraging nudges for ongoing sessions.
    - *Mindful Escalation*: Friction if too many sessions are opened, suggesting a potential break.
  - **Doomscrolling Detection**: 
    - *Behavioral Nudge*: Subtle reminders for early-stage habit loops.
    - *Mindful Friction*: Data-backed awareness pauses for high-frequency visits.
- **Non-Judgmental Feedback**: Uses "we" phrasing and ends with a choice, empowering you to make a conscious decision rather than following a command.
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

### 2. Extension Setup
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `Force-Friction-AI` project folder.

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
