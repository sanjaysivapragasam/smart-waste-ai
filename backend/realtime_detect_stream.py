"""
realtime_detect_stream.py

This script sends FULL VIDEO FRAMES (with YOLO detections already drawn) to the browser.
This is "Option 1" - simpler architecture but higher latency.

TRADEOFF vs realtime_detect.py:
- PRO: Simpler (one camera source, browser just displays what it receives)
- PRO: Browser sees exactly what Python sees
- CON: Higher latency (~200-500ms) because we send full images
- CON: More bandwidth usage (~50KB per frame vs ~500 bytes for coordinates)

Use this when: You want to demo the Python camera view, or when explaining the system architecture
"""

import cv2
import time
from datetime import datetime
from pathlib import Path
from ultralytics import YOLO
from collections import Counter
import socketio
import base64  # this is new for encoding images

# -------------------------------
# CONFIG
# -------------------------------
MODEL_PATH = Path("best.pt")

CONF_THRES = 0.35
IOU_THRES = 0.5
CAM_INDEX = 0
IMG_SIZE = 640
SHOW_FPS = True

# Socket.IO server URL
SOCKET_SERVER_URL = "http://localhost:4000"

# Create Socket.IO client
sio = socketio.Client()

@sio.event
def connect():
    print("✓ Connected to Socket.IO server (STREAM MODE)")

@sio.event
def disconnect():
    print("✗ Disconnected from Socket.IO server")

# Connect to server
try:
    sio.connect(SOCKET_SERVER_URL)
except Exception as e:
    print(f"⚠ Warning: Could not connect to Socket.IO server: {e}")
    print("  Make sure socket-server.js is running on port 4000")

# Class to bin mapping
ITEM_TO_BIN = {
    "plastic": "RECYCLE",
    "metal": "RECYCLE",
    "glass": "RECYCLE",
    "can": "RECYCLE",
    "paper": "RECYCLE",
    "organic": "COMPOST",
    "cable": "E-WASTE",
    "e_waste": "E-WASTE",
    "medical": "HAZARDOUS",
    "hazardous_glass": "HAZARDOUS",
}

def send_frame(annotated_frame):
    try:
        print("  → Encoding frame to JPEG...")  # ADD THIS
        _, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        
        print("  → Converting to base64...")  # ADD THIS
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        
        print(f"  → Frame size: {len(frame_base64)} bytes")  # ADD THIS
        print("  → Emitting to socket...")  # ADD THIS
        sio.emit("frame", {"image": frame_base64})
        print("  ✓ Frame emitted successfully!")  # ADD THIS
        
    except Exception as e:
        print(f"⚠ Failed to send frame: {e}")

def send_inference_result(waste_type, confidence):
    """
    Send text detection results (same as original script).
    We send both frames AND text results so the browser can show both.
    """
    data = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "waste_type": waste_type,
        "confidence": confidence
    }
    try:
        sio.emit("update", data)
    except Exception as e:
        print(f"⚠ Failed to send data: {e}")

# -------------------------------
# MAIN
# -------------------------------
def main():
    print(f"🔧 Loading model: {MODEL_PATH}")
    model = YOLO(str(MODEL_PATH))

    cap = cv2.VideoCapture(CAM_INDEX)
    if not cap.isOpened():
        raise RuntimeError(
            f"Could not open webcam (index {CAM_INDEX}). "
            f"Try changing CAM_INDEX to 1 or 2."
        )

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    prev_time = time.time()
    fps = 0.0

    print("✓ System ready (STREAM MODE)!")
    print("  - OpenCV window shows detections")
    print("  - Browser receives full video frames")
    print("  - Press 'q' to quit\n")

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        # Run YOLO inference
        results = model.predict(
            source=frame,
            imgsz=IMG_SIZE,
            conf=CONF_THRES,
            iou=IOU_THRES,
            verbose=False
        )[0]

        names = results.names
        bin_counts = Counter()
        annotated = frame.copy()

        # Draw detections
        if results.boxes is not None and len(results.boxes) > 0:
            for b in results.boxes:
                cls_id = int(b.cls.item())
                conf = float(b.conf.item())
                x1, y1, x2, y2 = map(int, b.xyxy[0].tolist())

                item = names[cls_id]
                bin_name = ITEM_TO_BIN.get(item, "UNKNOWN")
                bin_counts[bin_name] += 1

                # Draw bounding box
                cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)

                # Draw label
                label = f"{item} {conf:.2f} -> {bin_name}"
                y_text = max(20, y1 - 8)
                cv2.putText(
                    annotated,
                    label,
                    (x1, y_text),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.55,
                    (0, 255, 0),
                    2
                )

                # Send text result
                send_inference_result(
                    waste_type=bin_name.lower().capitalize(),
                    confidence=round(conf, 2)
                )

        # Bin summary
        summary = " | ".join([f"{k}:{v}" for k, v in bin_counts.items()]) if bin_counts else "No detections"
        cv2.putText(annotated, summary, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        # FPS
        if SHOW_FPS:
            now = time.time()
            dt = now - prev_time
            prev_time = now
            fps = 0.9 * fps + 0.1 * (1.0 / max(dt, 1e-6))
            cv2.putText(annotated, f"FPS: {fps:.1f}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

       # NEW: Send the annotated frame to browser
        print("Attempting to send frame...")  # ADD THIS LINE
        send_frame(annotated)
        print("Frame sent successfully!")  # ADD THIS LINE

        cv2.imshow("Garbage Detection (STREAM MODE)", annotated)

        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    sio.disconnect()


if __name__ == "__main__":
    main()