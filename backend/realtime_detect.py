"""
realtime_detect_stream.py

Sends annotated video frames (with YOLO detections drawn) to the browser via Socket.IO.

Performance optimizations applied:
  - IMG_SIZE = 320 cuts inference time ~4x vs 640 on CPU
  - Lower capture resolution (640x360) reduces pixels to process
  - JPEG quality 50 reduces frame size and transfer time
  - Inference runs every N frames; last results reused in between
  - Debug print statements removed to reduce I/O overhead
"""

import cv2
import time
import threading
from datetime import datetime
from pathlib import Path
from ultralytics import YOLO
from collections import Counter
import socketio
import base64

# -------------------------------
# CONFIG
# -------------------------------
MODEL_PATH = Path("best.pt")

CONF_THRES      = 0.5
IOU_THRES       = 0.5
CAM_INDEX       = 0
IMG_SIZE        = 320   # KEY: was 640 — cuts inference time ~4x on CPU
SHOW_FPS        = True
INFER_EVERY_N   = 3     # Only run YOLO every Nth frame; reuse last results in between
JPEG_QUALITY    = 50    # Lower = smaller payload = faster transfer

SOCKET_SERVER_URL = "http://localhost:4000"

# Class to bin mapping
ITEM_TO_BIN = {
    "paper":            "PAPER",
    "plastic bottle":   "PLASTIC",
    "PAPER":            "PAPER",
    "PLASTIC":          "PLASTIC",
    "CARDBOARD":        "CARDBOARD",
    "GLASS":            "GLASS",
    "METAL":            "METAL",
    "BIODEGRADABLE":    "BIODEGRADABLE",
}
# -------------------------------
# SOCKET.IO SETUP
# -------------------------------
sio = socketio.Client()

@sio.event
def connect():
    print("✓ Connected to Socket.IO server (STREAM MODE)")

@sio.event
def disconnect():
    print("✗ Disconnected from Socket.IO server")

try:
    sio.connect(SOCKET_SERVER_URL)
except Exception as e:
    print(f"⚠ Warning: Could not connect to Socket.IO server: {e}")
    print("  Make sure socket-server.mjs is running on port 4000")

# -------------------------------
# HELPERS
# -------------------------------
def send_frame(annotated_frame):
    try:
        _, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        sio.emit("frame", {"image": frame_base64})
    except Exception as e:
        print(f"⚠ Failed to send frame: {e}")

def send_inference_result(waste_type, confidence):
    data = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "waste_type": waste_type,
        "confidence": confidence,
    }
    try:
        sio.emit("update", data)
    except Exception as e:
        print(f"⚠ Failed to send inference result: {e}")

# -------------------------------
# MAIN
# -------------------------------
def main():
    print(f"🔧 Loading model: {MODEL_PATH}")
    model = YOLO(str(MODEL_PATH))
    print(f"✓ Model loaded  |  IMG_SIZE={IMG_SIZE}  |  infer every {INFER_EVERY_N} frames")

    cap = cv2.VideoCapture(CAM_INDEX)
    if not cap.isOpened():
        raise RuntimeError(
            f"Could not open webcam (index {CAM_INDEX}). "
            f"Try changing CAM_INDEX to 1 or 2."
        )

    # Lower resolution = less data for YOLO to process and smaller frames to send
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 360)

    prev_time   = time.time()
    fps         = 0.0
    frame_count = 0
    last_boxes  = []   # cache of (x1, y1, x2, y2, item, bin_name, conf)

    print("✓ System ready (STREAM MODE)!")
    print("  - OpenCV window shows detections")
    print("  - Browser receives annotated frames")
    print("  - Press 'q' to quit\n")

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        frame_count += 1

        # Run YOLO only every INFER_EVERY_N frames
        if frame_count % INFER_EVERY_N == 0:
            results = model.predict(
                source=frame,
                imgsz=IMG_SIZE,
                conf=CONF_THRES,
                iou=IOU_THRES,
                verbose=False,
            )[0]

            names      = results.names
            last_boxes = []

            if results.boxes is not None and len(results.boxes) > 0:
                for b in results.boxes:
                    cls_id          = int(b.cls.item())
                    conf            = float(b.conf.item())
                    x1, y1, x2, y2 = map(int, b.xyxy[0].tolist())
                    item            = names[cls_id]
                    bin_name        = ITEM_TO_BIN.get(item, "UNKNOWN")
                    last_boxes.append((x1, y1, x2, y2, item, bin_name, conf))

                    send_inference_result(
                        waste_type=bin_name.lower().capitalize(),
                        confidence=round(conf, 2),
                    )

        # ------------------------------------------------------------------
        # Draw last known boxes onto every frame (inference or not)
        # ------------------------------------------------------------------
        annotated  = frame.copy()
        bin_counts = Counter()

        for (x1, y1, x2, y2, item, bin_name, conf) in last_boxes:
            bin_counts[bin_name] += 1
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)
            label  = f"{item} {conf:.2f} -> {bin_name}"
            y_text = max(20, y1 - 8)
            cv2.putText(annotated, label, (x1, y_text),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 0), 2)

        # Bin summary
        summary = " | ".join([f"{k}:{v}" for k, v in bin_counts.items()]) if bin_counts else "No detections"
        cv2.putText(annotated, summary, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        # FPS counter
        if SHOW_FPS:
            now      = time.time()
            dt       = now - prev_time
            prev_time = now
            fps      = 0.9 * fps + 0.1 * (1.0 / max(dt, 1e-6))
            cv2.putText(annotated, f"FPS: {fps:.1f}", (10, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        # Send annotated frame to browser
        send_frame(annotated)

        cv2.imshow("Garbage Detection (STREAM MODE)", annotated)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    sio.disconnect()


if __name__ == "__main__":
    main()