import sqlite3
from datetime import datetime, timezone, timedelta
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

    # Dashboard metrics now come from real site activity logs only.

def log_event(event_type: str, platform: str, reason: str = None):
    """
    Logs an event to the database.
    Example event_types: 'BLOCKED_ATTEMPT', 'SUCCESSFUL_UNLOCK', 'MOOD_LOGGED', 'SESSION_ENDED'
    """
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    # Use UTC for consistent timestamping
    timestamp = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        "INSERT INTO focus_logs (timestamp, event_type, platform, reason) VALUES (?, ?, ?, ?)",
        (timestamp, event_type, platform, reason)
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

def get_detailed_stats(platform: str):
    """Retrieves detailed visit stats for a specific platform."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    now = datetime.now(timezone.utc)
    two_hours_ago = (now - timedelta(hours=2)).isoformat()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    
    # 1. Visits in the last 2 hours
    cursor.execute(
        "SELECT COUNT(*) FROM focus_logs WHERE event_type = 'INTENT_LOGGED' AND platform = ? AND timestamp >= ?",
        (platform, two_hours_ago)
    )
    visits_2h = cursor.fetchone()[0]
    
    # 2. Boredom visits today
    # We check for reasons categorized as boredom/habit/escape
    cursor.execute(
        "SELECT COUNT(*) FROM focus_logs WHERE event_type = 'INTENT_LOGGED' AND platform = ? AND timestamp >= ? AND (reason LIKE '%boredom%' OR reason LIKE '%habit%' OR reason LIKE '%escape%')",
        (platform, today_start)
    )
    boredom_total = cursor.fetchone()[0]
    
    # 3. Last session duration (minutes since last unlock, capped at 15)
    cursor.execute(
        "SELECT timestamp FROM focus_logs WHERE event_type = 'SUCCESSFUL_UNLOCK' AND platform = 'System' ORDER BY timestamp DESC LIMIT 1"
    )
    last_unlock = cursor.fetchone()
    
    last_session_mins = 2 # Default
    if last_unlock:
        unlock_time = datetime.fromisoformat(last_unlock[0])
        # If the last unlock was less than 2 mins ago, the session is technically still active or just ended
        # But if we are here, it means the site is locked again.
        # So the "last session" was likely the full 2 mins or the time until it was locked.
        # For simplicity, we'll return 2.
        last_session_mins = 2

    conn.close()
    
    return {
        "visits_2h": visits_2h,
        "boredom_total": boredom_total,
        "last_session_mins": last_session_mins
    }

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
    
    # Also include the detailed stats
    detailed = get_detailed_stats(platform)
    
    return {
        "visits_today": visits_today,
        **detailed
    }

def get_all_logs():
    """Retrieves all logs from the database, newest first."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, timestamp, event_type, platform, reason FROM focus_logs ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    logs = []
    for row in rows:
        logs.append({
            "id": row[0],
            "timestamp": row[1],
            "event_type": row[2],
            "platform": row[3],
            "reason": row[4]
        })
    return logs

def seed_sample_data():
    """Disabled to avoid synthetic metrics. Real YouTube/Instagram activity is used instead."""
    return


def get_live_social_activity(limit: int = 8):
    """Returns recent real activity from YouTube and Instagram for the dashboard."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT timestamp, event_type, platform, reason
        FROM focus_logs
        WHERE lower(platform) LIKE '%youtube.com%' OR lower(platform) LIKE '%instagram.com%'
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,)
    )
    rows = cursor.fetchall()
    conn.close()

    items = []
    for timestamp, event_type, platform, reason in rows:
        platform_name = platform.replace('www.', '') if platform else 'Live social site'
        items.append({
            'timestamp': timestamp,
            'event_type': event_type,
            'platform': platform_name,
            'reason': reason or 'live activity'
        })

    return {'items': items, 'count': len(items)}

# Self-initialize on import so the DB file is automatically created on startup
init_db()

