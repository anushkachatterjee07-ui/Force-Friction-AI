import cv2
import time
import requests
import os

# Configuration
API_UNLOCK = "http://127.0.0.1:8000/api/unlock"
API_LOG = "http://127.0.0.1:8000/api/log"
CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
TARGET_STREAK = 5.0  # seconds

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
    
    start_time = None
    streak_active = False

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

            if len(faces) > 0:
                # Face detected
                if not streak_active:
                    start_time = time.time()
                    streak_active = True
                
                elapsed = time.time() - start_time
                
                # Visual feedback: Draw rectangles around faces
                for (x, y, w, h) in faces:
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

                # Check if we hit the 5-second target
                if elapsed >= TARGET_STREAK:
                    print("Focus Streak Achieved! Unlocking...")
                    
                    # Trigger Backend
                    try:
                        # 1. Unlock the system
                        requests.post(API_UNLOCK)
                        # 2. Log the event
                        requests.post(API_LOG, json={"event_type": "SUCCESSFUL_UNLOCK", "platform": "Vision Engine"})
                    except Exception as e:
                        print(f"Backend Sync Failed: {e}")

                    # Reset streak to allow for another session if needed (or could exit)
                    streak_active = False
                    start_time = None
                    
                    # Brief visual confirmation on screen
                    cv2.putText(frame, "UNLOCKED!", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 0), 3)
                    cv2.imshow('Focus Friction - Vision Engine', frame)
                    cv2.waitKey(1000) # Show for 1 second
                    continue

                # Progress Text
                progress_text = f"Focus Session: {elapsed:.1f} / {TARGET_STREAK} seconds"
                color = (0, 255, 255) # Yellowish
            else:
                # No face detected - Reset Timer
                streak_active = False
                start_time = None
                progress_text = "Looking for user..."
                color = (0, 0, 255) # Red

            # Overlay Text on the feed
            # Background for text to make it readable
            cv2.rectangle(frame, (0, 0), (450, 60), (0, 0, 0), -1)
            cv2.putText(frame, progress_text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

            # Show the frame
            cv2.imshow('Focus Friction - Vision Engine', frame)

            # Exit on 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    finally:
        # Cleanup
        cap.release()
        cv2.destroyAllWindows()
        print("Vision Engine closed.")

if __name__ == "__main__":
    run_vision_engine()
