from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
import database

app = FastAPI(title="Force Friction AI - Backend")

# Configure CORS to allow our local Chrome Extension to make fetch calls
# without encountering browser CORS errors.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# In-memory application state tracking
# Note: For production with multiple workers, use a database or Redis instead.
IS_LOCKED = True
UNLOCK_EXPIRY = None

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

@app.post("/api/unlock")
async def unlock():
    """
    Unlock the system for exactly 15 minutes.
    """
    global IS_LOCKED, UNLOCK_EXPIRY
    
    IS_LOCKED = False
    # Set expiry to exactly 15 minutes into the future from current UTC time
    UNLOCK_EXPIRY = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    # Log the successful unlock event
    database.log_event("SUCCESSFUL_UNLOCK", "System")
    
    return {
        "success": True, 
        "message": "System unlocked for 15 minutes",
        "expiry": UNLOCK_EXPIRY.isoformat()
    }

class LogRequest(BaseModel):
    event_type: str
    platform: str

@app.post("/api/log")
async def log_activity(request: LogRequest):
    """
    Log an event like a blocked attempt.
    """
    database.log_event(request.event_type, request.platform)
    return {"success": True, "message": "Event logged successfully"}

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

def generate_awareness_message(site, reason, visits_2h, boredom_total, last_session_mins):
    """Generates a mindful awareness message based on user behavior."""
    # Rules: max 2 sentences, use “we”, end with a choice, reference actual numbers.
    # Be more direct if visits >= 10 and gentle if < 5.
    
    choice = "Do we want to continue scrolling or take a short break for a reset?"
    
    if visits_2h >= 10:
        # Direct tone
        message = f"We have opened {site} {visits_2h} times in the last 2 hours, with {boredom_total} boredom visits today. Since our last session was {last_session_mins} minutes, {choice.lower()}"
    elif visits_2h < 5:
        # Gentle tone
        message = f"We've visited {site} {visits_2h} times today for '{reason}' and spent {last_session_mins} minutes in our last session. With {boredom_total} boredom visits so far, would we like to proceed or pause for a moment?"
    else:
        # Neutral tone (5-9 visits)
        message = f"We've opened {site} {visits_2h} times in the last 2 hours. After {boredom_total} boredom visits today, {choice.lower()}"
    
    return message

def evaluate_intent(site, reason, visits_2h):
    """
    Decides the action based on the AI Intent Check rules.
    Rules:
    1. If reason in [study,work,relaxation] AND visits_2h < 8 -> allow
    2. If reason in [boredom,habit,escape] AND visits_2h >= 5 -> friction  
    3. If reason in [boredom,habit,escape] AND visits_2h in [2,3,4] -> nudge
    4. Else -> allow
    """
    reason_clean = reason.lower().split('/')[0].strip() # Handle "Study/tutorial" etc
    
    productive = ["study", "work", "relaxation", "tutorial"]
    doomscrolling = ["boredom", "habit", "escape"]
    
    # Rule 1
    if any(p in reason_clean for p in productive) and visits_2h < 8:
        return "allow"
    
    # Rule 2
    if any(d in reason_clean for d in doomscrolling) and visits_2h >= 5:
        return "friction"
    
    # Rule 3
    if any(d in reason_clean for d in doomscrolling) and 2 <= visits_2h <= 4:
        return "nudge"
    
    # Rule 4
    return "allow"

@app.post("/log-intent")
async def log_intent_endpoint(request: IntentRequest):
    """
    Log the user's reason for opening an addictive site and evaluate friction.
    """
    # 1. Log the intent
    database.log_intent(request.site, request.reason, request.timestamp)
    
    # 2. Get detailed stats for evaluation
    stats = database.get_detailed_stats(request.site)
    visits_2h = stats["visits_2h"]
    boredom_total = stats["boredom_total"]
    last_session_mins = stats["last_session_mins"]
    
    # 3. Evaluate the intent
    action = evaluate_intent(request.site, request.reason, visits_2h)
    
    # 4. Generate message if needed
    message = ""
    if action == "friction":
        message = generate_awareness_message(request.site, request.reason, visits_2h, boredom_total, last_session_mins)
    elif action == "nudge":
        message = f"We've opened {request.site} {visits_2h} times recently—just a quick check-in before we proceed."
    
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
