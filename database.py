import sqlite3
from datetime import datetime, timezone
import os

DB_FILE = "analytics.db"

def init_db():
    """Initializes the database and creates the table if it doesn't exist."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS focus_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            event_type TEXT NOT NULL,
            platform TEXT NOT NULL,
            reason TEXT
        )
    ''')
    # Backward compatibility for existing databases: try to add the column
    try:
        cursor.execute("ALTER TABLE focus_logs ADD COLUMN reason TEXT")
    except sqlite3.OperationalError:
        pass # Column already exists
    conn.commit()
    conn.close()

def log_event(event_type: str, platform: str):
    """
    Logs an event to the database.
    Example event_types: 'BLOCKED_ATTEMPT', 'SUCCESSFUL_UNLOCK'
    """
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    # Use UTC for consistent timestamping
    timestamp = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        "INSERT INTO focus_logs (timestamp, event_type, platform) VALUES (?, ?, ?)",
        (timestamp, event_type, platform)
    )
    conn.commit()
    conn.close()

def get_analytics_summary():
    """Retrieves a summary of today's analytics."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Get today's start in UTC for querying
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    
    # Total blocked attempts today
    cursor.execute(
        "SELECT COUNT(*) FROM focus_logs WHERE event_type = 'BLOCKED_ATTEMPT' AND timestamp >= ?",
        (today_start,)
    )
    blocked_attempts_today = cursor.fetchone()[0]
    
    # Total successful unlock intervals today
    cursor.execute(
        "SELECT COUNT(*) FROM focus_logs WHERE event_type = 'SUCCESSFUL_UNLOCK' AND timestamp >= ?",
        (today_start,)
    )
    successful_unlocks_today = cursor.fetchone()[0]
    
    # All-time totals
    cursor.execute("SELECT COUNT(*) FROM focus_logs WHERE event_type = 'BLOCKED_ATTEMPT'")
    total_blocked_all_time = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        "today": {
            "blocked_attempts": blocked_attempts_today,
            "successful_focus_intervals": successful_unlocks_today,
        },
        "all_time": {
            "blocked_attempts": total_blocked_all_time
        }
    }

def log_intent(platform: str, reason: str, timestamp_str: str):
    """Logs the user's intent for visiting a site."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO focus_logs (timestamp, event_type, platform, reason) VALUES (?, ?, ?, ?)",
        (timestamp_str, 'INTENT_LOGGED', platform, reason)
    )
    conn.commit()
    conn.close()

def get_stats(platform: str):
    """Retrieves visit stats for a specific platform for today."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    
    cursor.execute(
        "SELECT COUNT(*) FROM focus_logs WHERE event_type = 'INTENT_LOGGED' AND platform = ? AND timestamp >= ?",
        (platform, today_start)
    )
    visits_today = cursor.fetchone()[0]
    conn.close()
    
    return {"visits_today": visits_today}

# Self-initialize on import so the DB file is automatically created on startup
init_db()
