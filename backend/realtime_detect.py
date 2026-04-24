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
import csv
from datetime import datetime
from pathlib import Path
from ultralytics import YOLO
from collections import Counter, deque
import socketio
import base64
import pandas as pd

# -------------------------------
# CONFIG
# -------------------------------
MODEL_PATH = Path("best.pt")

CONF_THRES      = 0.3
IOU_THRES       = 0.3
CAM_INDEX       = 0
IMG_SIZE        = 320   # KEY: was 640 — cuts inference time ~4x on CPU
SHOW_FPS        = True
INFER_EVERY_N   = 3     # Only run YOLO every Nth frame; reuse last results in between
JPEG_QUALITY    = 50    # Lower = smaller payload = faster transfer

SOCKET_SERVER_URL = "http://localhost:4000"

# Simple performance logging settings
PRINT_METRICS_EVERY = 30
SAVE_METRICS_CSV    = True
METRICS_CSV_PATH    = "realtime_metrics.csv"

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

# Better colour scheme for bounding boxes / labels
BIN_COLORS = {
    "PAPER":         (255, 200, 0),    # cyan-ish
    "PLASTIC":       (0, 255, 255),    # yellow
    "CARDBOARD":     (42, 42, 165),    # brown-ish
    "GLASS":         (255, 0, 255),    # magenta
    "METAL":         (192, 192, 192),  # silver-ish
    "BIODEGRADABLE": (0, 200, 0),      # green
    "UNKNOWN":       (0, 255, 0),      # fallback green
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
class MetricsTracker:
    def __init__(self, csv_path=None):
        self.csv_path = csv_path

        self.capture_ms_hist  = deque(maxlen=100)
        self.infer_ms_hist    = deque(maxlen=100)
        self.draw_ms_hist     = deque(maxlen=100)
        self.encode_ms_hist   = deque(maxlen=100)
        self.emit_ms_hist     = deque(maxlen=100)
        self.loop_ms_hist     = deque(maxlen=100)
        self.display_fps_hist = deque(maxlen=100)

        if self.csv_path:
            with open(self.csv_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow([
                    "timestamp",
                    "frame_idx",
                    "did_infer",
                    "detections",
                    "capture_ms",
                    "infer_ms",
                    "draw_ms",
                    "encode_ms",
                    "emit_ms",
                    "loop_ms",
                    "display_fps"
                ])

    @staticmethod
    def avg(values):
        return sum(values) / len(values) if values else 0.0

    def record(
        self,
        frame_idx,
        did_infer,
        detections,
        capture_ms,
        infer_ms,
        draw_ms,
        encode_ms,
        emit_ms,
        loop_ms,
        display_fps,
    ):
        self.capture_ms_hist.append(capture_ms)
        self.infer_ms_hist.append(infer_ms)
        self.draw_ms_hist.append(draw_ms)
        self.encode_ms_hist.append(encode_ms)
        self.emit_ms_hist.append(emit_ms)
        self.loop_ms_hist.append(loop_ms)
        self.display_fps_hist.append(display_fps)

        if self.csv_path:
            with open(self.csv_path, "a", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow([
                    datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    frame_idx,
                    int(did_infer),
                    detections,
                    round(capture_ms, 3),
                    round(infer_ms, 3),
                    round(draw_ms, 3),
                    round(encode_ms, 3),
                    round(emit_ms, 3),
                    round(loop_ms, 3),
                    round(display_fps, 3),
                ])

    def print_summary(self, frame_idx):
        print(
            f"[METRICS] frame={frame_idx} | "
            f"capture={self.avg(self.capture_ms_hist):6.1f} ms | "
            f"infer={self.avg(self.infer_ms_hist):6.1f} ms | "
            f"draw={self.avg(self.draw_ms_hist):6.1f} ms | "
            f"encode={self.avg(self.encode_ms_hist):6.1f} ms | "
            f"emit={self.avg(self.emit_ms_hist):6.1f} ms | "
            f"loop={self.avg(self.loop_ms_hist):6.1f} ms | "
            f"fps={self.avg(self.display_fps_hist):5.1f}"
        )

def send_frame(annotated_frame):
    encode_ms = 0.0
    emit_ms = 0.0

    try:
        t0 = time.perf_counter()

        _, buffer = cv2.imencode(
            '.jpg',
            annotated_frame,
            [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY]
        )

        t1 = time.perf_counter()

        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        sio.emit("frame", {"image": frame_base64})

        t2 = time.perf_counter()

        encode_ms = (t1 - t0) * 1000.0
        emit_ms   = (t2 - t1) * 1000.0

    except Exception as e:
        print(f"⚠ Failed to send frame: {e}")

    return encode_ms, emit_ms

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

def draw_outlined_text(img, text, org, font, scale, color, thickness=2):
    # black outline behind coloured/white text for better readability
    cv2.putText(img, text, org, font, scale, (0, 0, 0), thickness + 2, cv2.LINE_AA)
    cv2.putText(img, text, org, font, scale, color, thickness, cv2.LINE_AA)

def draw_hud(img, fps: float, det_count: int, summary: str) -> None:
    font = cv2.FONT_HERSHEY_SIMPLEX
    draw_outlined_text(img, f"FPS: {fps:5.1f}", (10, 30), font, 0.8, (255, 255, 255), 2)
    draw_outlined_text(img, f"Detections: {det_count}", (10, 60), font, 0.8, (255, 255, 255), 2)
    draw_outlined_text(img, summary, (10, 90), font, 0.7, (255, 255, 255), 2)

def draw_detection_box(img, x1, y1, x2, y2, item, bin_name, conf):
    color = BIN_COLORS.get(bin_name, BIN_COLORS["UNKNOWN"])

    # bounding box
    cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

    # label text
    label = f"{item} {conf:.2f} -> {bin_name}"
    font = cv2.FONT_HERSHEY_SIMPLEX
    scale = 0.55
    thickness = 2

    (text_w, text_h), baseline = cv2.getTextSize(label, font, scale, thickness)
    text_x = x1
    text_y = max(25, y1 - 10)

    # filled label background
    cv2.rectangle(
        img,
        (text_x, text_y - text_h - 8),
        (text_x + text_w + 8, text_y + baseline - 2),
        color,
        -1
    )

    # text on label background
    cv2.putText(
        img,
        label,
        (text_x + 4, text_y - 4),
        font,
        scale,
        (255, 255, 255),
        thickness,
        cv2.LINE_AA
    )

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
    metrics     = MetricsTracker(METRICS_CSV_PATH if SAVE_METRICS_CSV else None)

    print("✓ System ready (STREAM MODE)!")
    print("  - OpenCV window shows detections")
    print("  - Browser receives annotated frames")
    print("  - Press 'q' to quit\n")

    while True:
        loop_t0 = time.perf_counter()

        # Read next frame from webcam
        cap_t0 = time.perf_counter()
        ok, frame = cap.read()
        cap_t1 = time.perf_counter()

        if not ok:
            break

        capture_ms = (cap_t1 - cap_t0) * 1000.0
        infer_ms   = 0.0
        draw_ms    = 0.0
        encode_ms  = 0.0
        emit_ms    = 0.0
        did_infer  = False

        frame_count += 1

        # Run YOLO only every INFER_EVERY_N frames
        if frame_count % INFER_EVERY_N == 0:
            did_infer = True
            infer_t0 = time.perf_counter()

            results = model.predict(
                source=frame,
                imgsz=IMG_SIZE,
                conf=CONF_THRES,
                iou=IOU_THRES,
                verbose=False,
            )[0]

            infer_t1 = time.perf_counter()
            infer_ms = (infer_t1 - infer_t0) * 1000.0

            names      = results.names
            last_boxes = []

            if results.boxes is not None and len(results.boxes) > 0:
                for b in results.boxes:
                    cls_id          = int(b.cls.item())
                    conf            = float(b.conf.item())
                    x1, y1, x2, y2  = map(int, b.xyxy[0].tolist())
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
        draw_t0 = time.perf_counter()

        annotated  = frame.copy()
        bin_counts = Counter()

        for (x1, y1, x2, y2, item, bin_name, conf) in last_boxes:
            bin_counts[bin_name] += 1
            draw_detection_box(annotated, x1, y1, x2, y2, item, bin_name, conf)

        # Bin summary
        summary = " | ".join([f"{k}:{v}" for k, v in bin_counts.items()]) if bin_counts else "No detections"

        # FPS counter
        now       = time.time()
        dt        = now - prev_time
        prev_time = now
        fps       = 0.9 * fps + 0.1 * (1.0 / max(dt, 1e-6))

        det_count = len(last_boxes)

        if SHOW_FPS:
            draw_hud(annotated, fps, det_count, summary)
        else:
            font = cv2.FONT_HERSHEY_SIMPLEX
            draw_outlined_text(annotated, summary, (10, 30), font, 0.7, (255, 255, 255), 2)

        draw_t1 = time.perf_counter()
        draw_ms = (draw_t1 - draw_t0) * 1000.0

        # Send annotated frame to browser
        encode_ms, emit_ms = send_frame(annotated)

        cv2.imshow("Garbage Detection (STREAM MODE)", annotated)

        loop_t1 = time.perf_counter()
        loop_ms = (loop_t1 - loop_t0) * 1000.0

        metrics.record(
            frame_idx=frame_count,
            did_infer=did_infer,
            detections=det_count,
            capture_ms=capture_ms,
            infer_ms=infer_ms,
            draw_ms=draw_ms,
            encode_ms=encode_ms,
            emit_ms=emit_ms,
            loop_ms=loop_ms,
            display_fps=fps,
        )

        if frame_count % PRINT_METRICS_EVERY == 0:
            metrics.print_summary(frame_count)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    sio.disconnect()


if __name__ == "__main__":
    main()