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
    // socketRef.current = io("http://localhost:4000");

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
    <div className="w-full mx-auto space-y-3">
      {/* Connection badge */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`}
        />
        <p className="text-sm text-gray-500">
          {isConnected ? "Connected" : "Waiting for connection..."}
        </p>
      </div>

      {/* Stream area */}
      <div className="w-full rounded-xl border border-gray-200 bg-black overflow-hidden">
        {currentFrame ? (
          <img
            src={currentFrame}
            alt="Python YOLO Stream"
            className="w-full h-auto block"
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center">
            <div className="text-center space-y-1">
              <p className="text-gray-400 text-base">
                {isConnected
                  ? "Waiting for video stream..."
                  : "Not connected to server"}
              </p>
              <p className="text-gray-600 text-sm">
                Make sure realtime_detect_stream.py is running
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  //     {/* Info box explaining what this view shows
  //     <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
  //       <strong>Python Stream Mode:</strong> Displays frames directly from
  //       Python's camera with YOLO detections already drawn. This shows exactly
  //       what the Python script sees.
  //     </div> */}
  //   </div>
  // );
}
