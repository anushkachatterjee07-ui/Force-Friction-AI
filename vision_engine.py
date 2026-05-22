import cv2
import time
import requests
import os

# Configuration
API_UNLOCK = "http://127.0.0.1:8000/api/unlock"
API_LOG = "http://127.0.0.1:8000/api/log"
API_FOCUS_STATE = "http://127.0.0.1:8000/api/focus-state"
API_HEARTBEAT = "http://127.0.0.1:8000/api/heartbeat"
CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
TARGET_STREAK = 5.0  # seconds to earn an unlock
GRACE_WARNING_THRESHOLD = 3.0  # seconds before a subtle warning UI appears
LOCKOUT_THRESHOLD = 7.0  # seconds before strict lockout is triggered
HEARTBEAT_INTERVAL = 1.5  # Send heartbeat every 1.5 seconds

LAST_HEARTBEAT_TIME = time.time()

def send_focus_state(state):
    try:
        requests.post(API_FOCUS_STATE, json={"state": state}, timeout=2)
    except Exception as e:
        print(f"Focus state sync failed: {e}")

def send_heartbeat():
    """Send a heartbeat signal to indicate the vision engine is alive."""
    global LAST_HEARTBEAT_TIME
    try:
        requests.post(API_HEARTBEAT, timeout=2)
        LAST_HEARTBEAT_TIME = time.time()
    except Exception as e:
        print(f"Heartbeat sync failed: {e}")


def run_vision_engine():
    # Load the Haar Cascade for face detection
    face_cascade = cv2.CascadeClassifier(CASCADE_PATH)
    if face_cascade.empty():
        print("Error: Could not load Haar Cascade file.")
        return

    # Initialize Webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    print("Vision Engine Active. Looking for a face...")

    focus_session_start = None
    accumulated_focus_time = 0.0
    no_face_start = None
    current_state = "active"

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Mirror the frame for more natural interaction
            frame = cv2.flip(frame, 1)
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            # Detect faces
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)
            face_present = len(faces) > 0

            if face_present:
                # Restore active focus momentum when the face returns
                if no_face_start is not None:
                    no_face_start = None

                if current_state != "active":
                    current_state = "active"
                    send_focus_state("active")

                if focus_session_start is None:
                    focus_session_start = time.time()

                elapsed_focus = accumulated_focus_time + (time.time() - focus_session_start)

                # Visual feedback: Draw rectangles around faces
                for (x, y, w, h) in faces:
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

                if elapsed_focus >= TARGET_STREAK:
                    print("Focus Streak Achieved! Unlocking...")

                    try:
                        requests.post(API_UNLOCK, timeout=2)
                        requests.post(API_LOG, json={"event_type": "SUCCESSFUL_UNLOCK", "platform": "Vision Engine"}, timeout=2)
                    except Exception as e:
                        print(f"Backend Sync Failed: {e}")

                    focus_session_start = None
                    accumulated_focus_time = 0.0
                    current_state = "active"
                    send_focus_state("active")

                    cv2.putText(frame, "UNLOCKED!", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 0), 3)
                    cv2.imshow('Focus Friction - Vision Engine', frame)
                    cv2.waitKey(1000)
                    continue

                progress_text = f"Focus Session: {elapsed_focus:.1f} / {TARGET_STREAK} seconds"
                color = (0, 255, 255)

            else:
                # Keep the earned focus momentum if the user glances away briefly
                if focus_session_start is not None:
                    accumulated_focus_time += time.time() - focus_session_start
                    focus_session_start = None

                if no_face_start is None:
                    no_face_start = time.time()

                elapsed_no_face = time.time() - no_face_start

                if elapsed_no_face >= LOCKOUT_THRESHOLD:
                    if current_state != "locked":
                        current_state = "locked"
                        send_focus_state("locked")
                        try:
                            requests.post(API_LOG, json={"event_type": "FOCUS_LOCKOUT", "platform": "Vision Engine", "reason": "Focus missing for 7 seconds"}, timeout=2)
                        except Exception as e:
                            print(f"Backend Sync Failed: {e}")

                    progress_text = "Focus lost. Strict lockout engaged."
                    color = (0, 0, 255)
                    accumulated_focus_time = 0.0
                elif elapsed_no_face >= GRACE_WARNING_THRESHOLD:
                    if current_state != "warning":
                        current_state = "warning"
                        send_focus_state("warning")

                    progress_text = f"Focus slipping... {elapsed_no_face:.1f}s away"
                    color = (0, 102, 255)
                else:
                    if current_state != "stale":
                        current_state = "stale"
                        send_focus_state("stale")

                    progress_text = f"Eyes off screen: {elapsed_no_face:.1f}s"
                    color = (0, 180, 255)
            # Send heartbeat periodically to let backend know vision engine is alive
            if time.time() - LAST_HEARTBEAT_TIME >= HEARTBEAT_INTERVAL:
                send_heartbeat()
            cv2.rectangle(frame, (0, 0), (520, 60), (0, 0, 0), -1)
            cv2.putText(frame, progress_text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

            cv2.imshow('Focus Friction - Vision Engine', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("Vision Engine closed.")


if __name__ == "__main__":
    run_vision_engine()
