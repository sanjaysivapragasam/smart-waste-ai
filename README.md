# Smart Vision System for Real-Time Waste Classification ♻️

## 📌 Overview
This project is a **final-year engineering capstone project** that develops an **AI-powered waste management system** using computer vision and machine learning to automatically identify and categorize waste items.  
The goal is to improve sorting accuracy and reduce environmental impact by enabling **real-time inference on edge devices**, with results displayed through a responsive **web application dashboard**.

The solution is designed as a cost-effective prototype suitable for:
- Smart cities  
- Public institutions  
- Home automation systems  

---

## 🎯 Objectives
- Develop a machine learning model to classify waste (plastic, paper, metal, etc.).  
- Deploy the trained model on an **edge device** with real-time inference.  
- Design a **web application** to visualize results.  
- Establish communication between the edge device and the web app using APIs or WebSockets.  
- Optimize for **accuracy, latency, and energy efficiency**.  

---

## 🛠 Tech Stack

### 🌐 Full-Stack Framework
- **Next.js**  
- **React**  
- **Tailwind CSS**  
- **JavaScript**  

### 🤖 Machine Learning Model
- **YOLOv8-Nano**  
- **TensorFlow / PyTorch**  
- **Google Colab**  

---

## 📅 Timeline
**Phase 1 (Fall 2025)** – Dataset development, model prototyping, web app architecture  
**Phase 2 (Winter 2026)** – Integration, real-time testing, and performance optimization  

---

## 🔗 Repository
This repository contains the full-stack web application built with **Next.js**, including:  
- Frontend dashboard (React + Tailwind CSS)  
- API routes for communication with the edge ML model  
- Future integration scripts for real-time waste classification

---

## ⚙️ Prerequisites

Make sure the following are installed before running the project:

- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) 3.9+
- A webcam connected to your machine
- `best.pt` — the trained YOLOv8 model weights (place in the project root)

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/sanjaysivapragasam/smart-waste-ai.git
cd smart-waste-ai
```

### 2. Install Node.js dependencies

```bash
npm install
```

**Key JS dependencies** (from `package.json`):

| Package | Purpose |
|---|---|
| `next` | React framework |
| `react`, `react-dom` | UI library |
| `socket.io`, `socket.io-client` | Real-time WebSocket communication |
| `react-icons` | Icons used in the dashboard UI |
| `tailwindcss` | Utility-first CSS framework |

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
# or
pip install ultralytics opencv-python python-socketio[client] torch torchvision
```

**Key Python dependencies**:

| Package | Purpose |
|---|---|
| `ultralytics` | YOLOv8 model inference |
| `opencv-python` | Webcam capture and frame annotation |
| `python-socketio[client]` | Emitting frames and results to the Socket.IO server |
| `torch`, `torchvision` | PyTorch backend for YOLOv8 |

---

## 🚀 Running the Project

The project has **three processes** that must all be running at the same time. Open three separate terminals.

### Terminal 1 — Socket.IO Relay Server

```bash
node socket-server.mjs
```

This starts the WebSocket server on `http://localhost:4000`. It relays detection results and annotated video frames between the Python backend and the browser.

### Terminal 2 — Next.js Frontend

```bash
npm run dev
```

Opens the dashboard at `http://localhost:3000`.

### Terminal 3 — Python YOLOv8 Detection

```bash
python realtime_detect.py
# or
python3 realtime_detect.py
```

This opens a local OpenCV window showing detections and begins streaming annotated frames and classification results to the browser via Socket.IO.

> **Note:** Make sure `best.pt` is in the project root before running the Python script.

---

## 🔧 Configuration

Key settings can be adjusted at the top of `realtime_detect.py`:

```python
CONF_THRES    = 0.5   # Minimum confidence threshold for a detection
IOU_THRES     = 0.5   # Intersection-over-union threshold
CAM_INDEX     = 0     # Webcam index (try 1 or 2 if 0 doesn't work)
IMG_SIZE      = 320   # Inference image size (320 is faster; 640 is more accurate)
INFER_EVERY_N = 3     # Run YOLO every Nth frame to improve performance
JPEG_QUALITY  = 50    # Frame compression quality for streaming (lower = faster)
```

---

## 🛠️ Troubleshooting

**Webcam not detected**
Change `CAM_INDEX` in `realtime_detect.py` from `0` to `1` or `2`.

**Socket.IO connection refused**
Make sure the relay server (`node socket-server.mjs`) is running before starting the Python script or the frontend.

**`best.pt` not found**
Ensure the trained model weights file is placed in the project root directory.

**Slow frame rate**
Try lowering `IMG_SIZE` to `224` or increasing `INFER_EVERY_N` to `5` in `realtime_detect_stream.py`.
