/**
 * DetectionOverlay.jsx
 * This component receives detection coordinates from Python and draws bounding boxes
 * on TOP of the browser's camera feed. This is like an AR (augmented reality) overlay.
 * 
 * HOW IT WORKS:
 * 1. Parent component (page.js) passes in the video element reference
 * 2. We create a <canvas> that sits on top of the video
 * 3. Socket.IO sends us box coordinates from Python
 * 4. We draw rectangles on the canvas at those coordinates
 * 
 * TRADEOFF: This requires two cameras (Python + Browser) to be looking at the same thing,
 * but gives much smoother video because the browser camera runs at 30 FPS.
 */

"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function DetectionOverlay({ videoRef }) {
  // Canvas reference - this is where we'll draw the boxes
  const canvasRef = useRef(null);
  
  // Socket reference
  const socketRef = useRef(null);
  
  // Store current detections so we can redraw them
  const detectionsRef = useRef([]);

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io("http://localhost:4000");

    // Listen for detection coordinates from Python
    // Python will send: { detections: [{box: {x1, y1, x2, y2}, label, confidence}] }
    socketRef.current.on("detections", (data) => {
      detectionsRef.current = data.detections || [];
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    // This effect handles the drawing loop
    const canvas = canvasRef.current;
    const video = videoRef?.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Drawing function that runs continuously
    const draw = () => {
      // Match canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear previous frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw each detection box
      detectionsRef.current.forEach((detection) => {
        const { box, label, confidence, bin } = detection;

        // Draw green rectangle
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);

        // Draw label background
        const labelText = `${label} ${confidence.toFixed(2)} -> ${bin}`;
        ctx.font = "16px Arial";
        const textWidth = ctx.measureText(labelText).width;
        
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(box.x1, box.y1 - 25, textWidth + 10, 25);

        // Draw label text
        ctx.fillStyle = "#000000";
        ctx.fillText(labelText, box.x1 + 5, box.y1 - 7);
      });

      // Request next frame
      animationFrameId = requestAnimationFrame(draw);
    };

    // Start drawing when video is ready
    if (video.readyState >= 2) {
      draw();
    } else {
      video.addEventListener("loadeddata", draw);
    }

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
}