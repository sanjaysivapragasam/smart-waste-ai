<<<<<<< HEAD
/** Next.js has 2 rendering environments, the server components and client components. Camera access is only
 * possible in the browser, so we need to tell Next.js to run this component on the client side.
 */

"use client";
/* use effect is a React Hook that allows me to
 perform side effects in components. this can include fetching data, directly updating the DOm and timers.
 useRef is a React Hook that allows you to persist values between renders. It stores a mutable value that
 doesnt cause a re-render when updated. useRef only returns one Object called current.

 In summary: useRef() will allow for direct DOM element access like the <video>, and useEffect() will run code for camera
 access after the page render in the browser
 */

/* useRef for things that you want to hold onto, useState
 for things that affect UI */
import { useEffect, useRef, useState } from "react";

// adding a parameter video ref so page.js can pass in a videoRef
// detection overlay will still need access to the same video element
// to draw on top of it
export default function CameraPreview({videoRef: externalVideoRef}) {
  // creates a reference object where current = null
  // its a DOM ref for the <video> element where the stream will play
  // use the parameter or the standalone if no ref is passed
  const videoRef = externalVideoRef || useRef(null);
  // a stream reference object accessible by all methods
  // useRef persists across renders. It holds the active MediaStream
  const streamRef = useRef(null);

  /* the states can be used as triggers. When a button is clicked
  the change of state will allow the UI to react accordingly to the 
  status of the camera, on or off*/
  const [isRunning, setIsRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /*This needs to be an asynchronous function because camera access takes time.
    The browser will prompt the user to activate the camera, then if they say yes, the device
    is picked and initialized */
  const startCamera = async () => {
    try {
      // if the stream is already active, do nothing
      if (streamRef.current) return;
      /*Constraints is just the set of rules that we are requesting. So in this case, we are requesting an ideal
        resolution of 720p from the outward facing camera */
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
        audio: false, // the stream should be muted
      };

      /*This is the real camera access, where it asks for permission to open the camera. After
        this is will return the MediaStream. But the main purpose is that we need a variable to
        represent the camera stream so that it can be "stopped" after. The camera would stay on
        unless you turn it off */
     const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      /*since it is a webcam, instead of using an mp4 file
        it uses the current reference of the stream*/
      if (videoRef.current) {
        // attach the stream to <video>
        videoRef.current.srcObject = stream;
        // adding the await to avoid autoplay errors
        await videoRef.current.play();
        setIsRunning(true);
      }
    } catch (err) {
      // error handling if user says no, or no camera available
      console.error("Camera start failed", err);

      setErrorMsg(
        "Could not access camera. Please allow permission and make sure another app is not using it.",
      );

      setIsRunning(false);
      streamRef.current = null;
    }
  };

  /*creating a stop camera button so the user can turn it off if they wish*/
  const stopCamera = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsRunning(false);
  };

  /* react first renders the page using the <video ref = {videoRef}
  then it would run useEffect */
  useEffect(() => {
    // cleanup required to stop the camera when component unmounts
    // if the user leaves page for example, everything needs to stop
    return () => {
      stopCamera();
    };
  }, []);

  // this is the rendered UI that can be put into the page.js
  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Status:{" "}
          <span className="font-semibold">
            {isRunning ? "Camera On" : "Camera Off"}
          </span>
        </p>

        {!isRunning ? (
          <button
            onClick={startCamera}
            className="px-4 py-2 rounded bg-accent-green text-white font-semibold hover:opacity-90"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="px-4 py-2 rounded bg-gray-700 text-white font-semibold hover:opacity-90"
          >
            Stop Camera
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded-lg border shadow bg-black"
      />
    </div>
  );
}
=======
// the camera from the media API is run through the browser
// so we need to use the client
"use client"



>>>>>>> 6073d366228abcb04d51db540938dfc1d263dd82
