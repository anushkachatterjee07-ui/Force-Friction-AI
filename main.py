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
