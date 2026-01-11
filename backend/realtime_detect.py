import cv2
import time
from datetime import datetime
from pathlib import Path
from ultralytics import YOLO
from collections import Counter
# connects to Socket.IO server
import socketio

# -------------------------------
# CONFIG
# -------------------------------
# Update this to your actual best.pt path
MODEL_PATH = Path("best.pt")
# Pick newest best.pt automatically
# MODEL_PATH = sorted(MODEL_PATH, key=lambda p: p.stat().st_mtime, reverse=True)[0]

CONF_THRES = 0.35      # raise (0.4-0.5) to reduce false positives
IOU_THRES = 0.5
CAM_INDEX = 0          # 0 = default webcam
IMG_SIZE = 640         # inference size (can match training)
SHOW_FPS = True

# Address of frontend Socket.IO server
SOCKET_SERVER_URL = "http://localhost:4000"

# create a Socket.IO client
sio = socketio.Client()

@sio.event
def connect():
    print("Connected to Socket.IO server")

@sio.event
def disconnect():
    print("Disconnected from Socket.IO server")

# Connect once at startup
sio.connect(SOCKET_SERVER_URL)

# Canonical class -> bin mapping (your Option A mapping)
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

def send_inference_result(waste_type, confidence):
    data = {
        "timestamp":  datetime.now().strftime("%H:%M:%S"),
        "waste_type": waste_type,
        "confidence": confidence
    }
    print("Sent data:", data) # testing
    sio.emit("update", data)  # emit to all connected clients

# -------------------------------
# MAIN
# -------------------------------
def main():
    print(f"Loading model: {MODEL_PATH}")
    model = YOLO(str(MODEL_PATH))

    cap = cv2.VideoCapture(CAM_INDEX)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open webcam (index {CAM_INDEX}). Try CAM_INDEX=1 or 2.")

    # Try to set a reasonable resolution (optional)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    prev_time = time.time()
    fps = 0.0

    print("Press 'q' to quit.")

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

                # Box
                cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)

                # Label
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

                # Emit detection to Socket.IO server
                send_inference_result(
                    waste_type=bin_name.lower().capitalize(),
                    confidence=round(conf, 2)
                )

        # Bin summary overlay
        summary = " | ".join([f"{k}:{v}" for k, v in bin_counts.items()]) if bin_counts else "No detections"
        cv2.putText(annotated, summary, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        # FPS
        if SHOW_FPS:
            now = time.time()
            dt = now - prev_time
            prev_time = now
            fps = 0.9 * fps + 0.1 * (1.0 / max(dt, 1e-6))
            cv2.putText(annotated, f"FPS: {fps:.1f}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        cv2.imshow("Garbage Detection (best.pt) + Bin Recommendation", annotated)

        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
