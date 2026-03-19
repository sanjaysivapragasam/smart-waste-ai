/**
 * This component displays the video stream coming from Python (with YOLO boxes already drawn)
 * Unlike CameraPreview which accesses the browser's camera directly, this receives frames
 * that Python has already processed and annotated.
 */

"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function PythonStreamView() {
  // State to hold the current frame from Python (as a base64 image)
  const [currentFrame, setCurrentFrame] = useState(null);
  // State to track connection status
  const [isConnected, setIsConnected] = useState(false);
  // Ref to hold the socket connection so it persists across renders
  const socketRef = useRef(null);
  useEffect(() => {
    // Connect to Socket.IO server
    console.log("PythonStreamView: Connecting to Socket.IO server...");
    socketRef.current = io("http://localhost:4000");

    // Listen for connection events
    socketRef.current.on("connect", () => {
      console.log("PythonStreamView: Connected!");
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("PythonStreamView: Disconnected");
      setIsConnected(false);
    });

    // Listen for frame updates from Python
    // Python will emit "frame" events with base64-encoded images
    socketRef.current.on("frame", (data) => {
      // data.image is a base64 string
      // We convert it to a data URL that can be used in an <img> tag
      setCurrentFrame(`data:image/jpeg;base64,${data.image}`);
    });

    // Cleanup: disconnect when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array = run once on mount

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {/* Connection status indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Python Stream:{" "}
          <span className="font-semibold">
            {isConnected ? "Connected ✓" : "Waiting for connection..."}
          </span>
        </p>
      </div>

      {/* Display area for the video stream */}
      <div className="w-full rounded-lg border shadow bg-black overflow-hidden">
        {currentFrame ? (
          // Show the frame from Python if available
          <img
            src={currentFrame}
            alt="Python YOLO Stream"
            className="w-full h-auto"
          />
        ) : (
          // Placeholder while waiting for frames
          <div className="w-full aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">
                {isConnected
                  ? "Waiting for video stream from Python..."
                  : "Not connected to server"}
              </div>
              <div className="text-gray-500 text-sm">
                Make sure realtime_detect_stream.py is running
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info box explaining what this view shows */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <strong>Python Stream Mode:</strong> Displays frames directly from
        Python's camera with YOLO detections already drawn. This shows exactly
        what the Python script sees.
      </div>
    </div>
  );
}
