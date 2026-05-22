from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
import database

app = FastAPI(title="Force Friction AI - Backend")

# Configure CORS to allow our local Chrome Extension to make fetch calls
# without encountering browser CORS errors.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# In-memory application state tracking
# Note: For production with multiple workers, use a database or Redis instead.
IS_LOCKED = True
UNLOCK_EXPIRY = None
FOCUS_STATE = "active"
LAST_HEARTBEAT = datetime.now(timezone.utc)  # Track vision engine heartbeat
HEARTBEAT_TIMEOUT = 5  # seconds - if no heartbeat in 5s, engine is dead

# Binary Souls team state
team_state = {"partner_status": "FOCUSED"}

def is_vision_engine_alive():
    """Check if the vision engine is sending heartbeats regularly."""
    global LAST_HEARTBEAT
    elapsed = (datetime.now(timezone.utc) - LAST_HEARTBEAT).total_seconds()
    return elapsed < HEARTBEAT_TIMEOUT

@app.get("/api/status")
async def get_status():
    """
    Check the current lock status.
    If currently unlocked, it verifies if the 15-minute window has expired.
    """
    global IS_LOCKED, UNLOCK_EXPIRY
    
    if not IS_LOCKED:
        current_time = datetime.now(timezone.utc)
        
        # Check if the unlock period has expired
        if UNLOCK_EXPIRY and current_time >= UNLOCK_EXPIRY:
            # Time has run out, automatically reset to locked state
            IS_LOCKED = True
            UNLOCK_EXPIRY = None
            return {"status": "LOCKED"}
        else:
            # Still unlocked, calculate remaining time in seconds
            time_remaining = int((UNLOCK_EXPIRY - current_time).total_seconds())
            return {
                "status": "UNLOCKED", 
                "time_remaining": max(0, time_remaining)
            }
            
    # Default locked state
    return {"status": "LOCKED"}

@app.get("/api/team/stats")
async def get_team_stats():
    """
    Get the real-time focus status of the team/partner.
    """
    return team_state

class FocusStateRequest(BaseModel):
    state: str

@app.get("/api/focus-state")
async def get_focus_state():
    """
    Retrieve the current focus validation state reported by the vision engine.
    Includes heartbeat status to alert extension if engine is offline.
    """
    engine_alive = is_vision_engine_alive()
    return {
        "focus_state": FOCUS_STATE,
        "warning_active": FOCUS_STATE == "warning",
        "locked": FOCUS_STATE == "locked",
        "engine_alive": engine_alive
    }

@app.get("/api/verify-focus")
async def verify_focus():
    """
    Verify whether the attention engine currently reports a focused state.
    Also checks that the vision engine is alive (sending heartbeats).
    If heartbeat is missing, rejection prevents blind unlocks.
    """
    engine_alive = is_vision_engine_alive()
    return {
        "verified": FOCUS_STATE == "active" and engine_alive,
        "focus_state": FOCUS_STATE,
        "engine_alive": engine_alive,
        "reason": "Engine offline" if not engine_alive else None
    }

@app.post("/api/focus-state")
async def update_focus_state(request: FocusStateRequest):
    """
    Receive asynchronous focus state updates from the vision engine.
    """
    global FOCUS_STATE, IS_LOCKED, UNLOCK_EXPIRY
    new_state = request.state.lower()
    if new_state not in {"active", "stale", "warning", "locked"}:
        return {"success": False, "message": "Invalid focus state"}

    FOCUS_STATE = new_state
    if new_state == "locked":
        IS_LOCKED = True
        UNLOCK_EXPIRY = None
        database.log_event("FOCUS_LOCKOUT", "Vision Engine", "Focus missing for 7 seconds")

    return {"success": True, "focus_state": FOCUS_STATE}

@app.post("/api/heartbeat")
async def heartbeat():
    """
    Receive heartbeat from vision engine to confirm it's alive.
    Called every 1-2 seconds to maintain system liveness.
    """
    global LAST_HEARTBEAT
    LAST_HEARTBEAT = datetime.now(timezone.utc)
    return {"success": True, "timestamp": LAST_HEARTBEAT.isoformat()}

@app.post("/api/unlock")
async def unlock(minutes: int = 5):
    """
    Unlock the system for a specified number of minutes (default 5).
    """
    global IS_LOCKED, UNLOCK_EXPIRY
    
    IS_LOCKED = False
    # Set expiry to exactly `minutes` into the future from current UTC time
    UNLOCK_EXPIRY = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    
    # Log the successful unlock event
    database.log_event("SUCCESSFUL_UNLOCK", "System")
    
    return {
        "success": True, 
        "message": f"System unlocked for {minutes} minutes",
        "expiry": UNLOCK_EXPIRY.isoformat()
    }

class LogRequest(BaseModel):
    event_type: str
    platform: str
    reason: str = None

@app.post("/api/log")
async def log_activity(request: LogRequest):
    """
    Log an event like a blocked attempt.
    """
    database.log_event(request.event_type, request.platform, request.reason)
    return {"success": True, "message": "Event logged successfully"}

@app.get("/api/log")
async def get_raw_logs():
    """
    Retrieve raw session log analytics for the dashboard.
    """
    return database.get_all_logs()

@app.get("/api/analytics")
async def get_analytics():
    """
    Retrieve summarized analytics for the dashboard.
    """
    return database.get_analytics_summary()

class IntentRequest(BaseModel):
    site: str
    reason: str
    timestamp: str

class SessionEndRequest(BaseModel):
    site: str
    reason: str
    duration_mins: int
    intent: str

def reflect_on_session(site: str, reason: str, duration_mins: int, intent: str) -> str:
    """
    Reflect on session time and return a 1-sentence non-judgmental message.
    """
    if duration_mins < 5:
        return ""
        
    if intent == "productive" and duration_mins >= 25:
        return f"{duration_mins}min of {reason}. Solid focus."
        
    if intent == "mindless" and duration_mins >= 15:
        return f"That was {duration_mins}min on {site}. Reset next time?"
        
    return ""

def correlate_usage_with_mood(site: str, reason: str, duration_mins: int) -> str:
    """
    Correlate usage with mood and return an optional check-in question.
    """
    reason_clean = reason.lower().split('/')[0].strip()
    if reason_clean == "boredom" and duration_mins >= 10:
        return f"How do you feel after {duration_mins}min on {site}? Better | Same | Worse"
    if reason_clean == "study" and duration_mins >= 25:
        return f"Rate focus after {duration_mins}min of {reason_clean}: 1-5"
    return ""

def generate_awareness_message(site, reason, visits_2h, visits_today, action):
    """Generates a brief, non-judgmental response based on the action and intent."""
    reason_clean = reason.lower().split('/')[0].strip()
    productive = ["study", "work", "relaxation", "tutorial"]
    is_productive = any(p in reason_clean for p in productive)

    if action == "friction":
        if is_productive:
            return f"{visits_2h}+ {reason_clean} sessions open. Break or continue?"
        return f"We've opened {site} {visits_2h}x in 2h. 5-min reset or proceed?"
    
    if action == "nudge":
        if is_productive:
            return f"{reason_clean.capitalize()} session #{visits_2h}. You got this."
        return f"Visit #{visits_today} to {site}. Stay intentional."
    
    return ""

def evaluate_intent(site, reason, visits_2h):
    """
    Decides the action based on the AI Intent Check rules.
    Refined for productive validation:
    - Productive: <3 (allow), 3-7 (nudge/reinforce), >=8 (friction)
    - Doomscrolling: >=5 (friction), 2-4 (nudge)
    """
    reason_clean = reason.lower().split('/')[0].strip()
    productive = ["study", "work", "relaxation", "tutorial"]
    doomscrolling = ["boredom", "habit", "escape"]
    
    is_productive = any(p in reason_clean for p in productive)
    is_doomscrolling = any(d in reason_clean for d in doomscrolling)

    if is_productive:
        if visits_2h >= 8: return "friction"
        if visits_2h >= 3: return "nudge"
        return "allow"
    
    if is_doomscrolling:
        if visits_2h >= 5: return "friction"
        if 2 <= visits_2h <= 4: return "nudge"
        return "friction" if visits_2h > 4 else "allow" # Safety fallback
    
    return "allow"

@app.post("/log-intent")
async def log_intent_endpoint(request: IntentRequest):
    """
    Log the user's reason for opening an addictive site and evaluate friction.
    """
    # 1. Log the intent
    database.log_intent(request.site, request.reason, request.timestamp)
    
    # 2. Get detailed stats for evaluation
    stats = database.get_stats(request.site)
    visits_2h = stats["visits_2h"]
    boredom_total = stats["boredom_total"]
    last_session_mins = stats["last_session_mins"]
    
    # 3. Evaluate the intent
    action = evaluate_intent(request.site, request.reason, visits_2h)
    
    # 4. Generate message if needed
    visits_today = stats["visits_today"]
    message = generate_awareness_message(request.site, request.reason, visits_2h, visits_today, action)
    
    # 5. Handle instant unlock for "allow"
    if action == "allow":
        await unlock()
    
    return {
        "success": True, 
        "action": action,
        "message": message
    }

@app.get("/stats")
async def get_stats_endpoint(site: str):
    """
    Get the visit count for a specific site today.
    """
    return database.get_stats(site)

@app.post("/api/session-end")
async def session_end_endpoint(request: SessionEndRequest):
    """
    Evaluate the session and optionally return a reflection message and a mood question.
    Also logs the session end event to SQLite.
    """
    # Dynamically log the SESSION_ENDED event in SQLite
    duration_secs = request.duration_mins * 60
    database.log_event(
        event_type="SESSION_ENDED",
        platform=request.site,
        reason=f"{request.intent}:{duration_secs}"
    )
    
    message = reflect_on_session(
        site=request.site,
        reason=request.reason,
        duration_mins=request.duration_mins,
        intent=request.intent
    )
    
    question = correlate_usage_with_mood(
        site=request.site,
        reason=request.reason,
        duration_mins=request.duration_mins
    )
    
    return {
        "success": True,
        "message": message,
        "question": question
    }

@app.get("/dashboard")
async def dashboard():
    """
    Serve the dashboard HTML page.
    """
    return FileResponse("dashboard.html")

@app.get("/get-mood-stats")
async def get_mood_stats():
    """
    Retrieve mood analytics for the dashboard.
    """
    return database.get_mood_statistics()
