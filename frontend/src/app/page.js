// use client tells Next.js this component runs in the browser
// required if we use state, events, or effects
"use client";

// Import React to access to React's hooks (useState, useEffect)
import React, { useState, useEffect, useRef } from "react";

// Import socket.io client library
import { io } from "socket.io-client";

// importing icons from react-icons
import { AiOutlineVideoCamera } from "react-icons/ai";
import { LuBrainCircuit } from "react-icons/lu";
import { BiCategoryAlt } from "react-icons/bi";
import { MdRecycling } from "react-icons/md";
import { MdCompost } from "react-icons/md";
import { BsTrash3 } from "react-icons/bs";
import { TbArrowBigRightLines } from "react-icons/tb";

// importing the camera component created for the computer vison
import CameraPreview from "./components/CameraPreview";
import PythonStreamView from "./components/PythonStreamView";
import DetectionOverlay from "./components/DetectionOverlay";

// main React component for the homepage
// every Next.js route is a React component
export default function Home() {
  // state to hold real-time updates from ML model
  const [updates, setUpdates] = useState([]);

  // State to control which visualization mode we're using
  // "browser-camera" = CameraPreview with overlay
  // "python-stream" = PythonStreamView with frames sent over network
  const [displayMode, setDisplayMode] = useState("browser-camera");

  // reference to the video element for drawing boxes on top
  const videoRef = useRef(null);

  // useEffect to set up WebSocket connection on component mount
  useEffect(() => {
    // connects to WebSocket server
    const socket = io("http://localhost:4000");

    // listens for "update" events from server (socket-server.js)
    socket.on("update", (data) => {
      setUpdates((prev) => [data, ...prev].slice(0, 10)); // keep last 10 updates
      console.log("Real-time update:", data);
    });

    return () => socket.disconnect();
  }, []);

  // creating a state for the card flip
  // these represent the different states of the card
  const [flippedCard, setFlippedCard] = useState(null);

  // this is the function that runs when a card is flipped
  const handleCardClick = (cardID) => {
    // if the card is already flipped, flip it back and set to null
    if (flippedCard == cardID) {
      setFlippedCard(null);
    } else {
      // card is not flipped, so flip it to the back
      setFlippedCard(cardID);
    }
    // if its a different card, flip to this new card
  };

  const wasteCategories = [
    { id: "recycling", name: "Recycling", icon: MdRecycling, backText: "..." },
    { id: "garbage", name: "Garbage", icon: BsTrash3, backText: "..." },
    { id: "compost", name: "Compost", icon: MdCompost, backText: "..." },
  ];

  // this return section below is what gets rendered on the page
  // tailwind classes for layout and style
  return (
    <div className="w-full bg-background">
      <div className="mx-auto flex flex-col items-center max-w-6xl w-full">
        {/* section for intro with slogan and quick tagline*/}
        <section id="intro" className="text-center py-16">
          <div className="flex flex-col">
            {/* Slogan*/}
            <h1 className="text-8xl font-extrabold tracking-tight text-primary-green pt-24">
              Smart Sorting for Sustainable Living
            </h1>

            {/* Quick Project Description*/}
            <p className="text-3xl font-bold text-accent-green py-4">
              Helping communities with AI-driven waste classification for a
              cleaner, greener future.
            </p>
          </div>
        </section>

        {/*How does it work? */}
        <section className="text-primary-green mx-auto py-4">
          <h2 className=" text-4xl text-center font-bold py-5">How It Works</h2>

          <p className="text-xl text-center font-bold">
            Our Smart Waste Ai project uses a simple pipeline to classify waste
            in real-time
          </p>

          {/*React icons for how does it work section */}
          <section className="mx-auto flex flex-wrap justify-center py-5 gap-12 max-w-full overflow-x-hidden">
            <div
              className="flex flex-col items-center text-center text-white rounded-xl bg-accent-green
          shadow-md px-8 py-6 hover:scale-105 transition-transform duration-300"
            >
              <AiOutlineVideoCamera
                size={80}
                className="text-white"
              ></AiOutlineVideoCamera>
              <h3 className="font-bold text-white mb-4">Capture Camera Feed</h3>
            </div>

            <div className="flex justify-center items-center">
              <TbArrowBigRightLines
                size={80}
                className="animate-pulse"
              ></TbArrowBigRightLines>
            </div>

            <div
              className="flex flex-col items-center text-center text-white rounded-xl bg-accent-green
          shadow-md px-8 py-6 hover:scale-105 transition-transform duration-300"
            >
              <LuBrainCircuit size={80} className="text-white"></LuBrainCircuit>
              <h3 className="font-bold text-white mb-4">ML Analyzing Data</h3>
            </div>

            <div className="flex justify-center items-center">
              <TbArrowBigRightLines
                size={80}
                className="animate-pulse"
              ></TbArrowBigRightLines>
            </div>
            <div
              className="flex flex-col items-center text-center text-white rounded-xl bg-accent-green
          shadow-md px-8 py-6 hover:scale-105 transition-transform duration-300"
            >
              <BiCategoryAlt size={80} className="text-white "></BiCategoryAlt>
              <h3 className="font-bold text-white mb-4">
                Classify and Display Results
              </h3>
            </div>
          </section>
        </section>

        {/*Waste Categories*/}
        <section className="py-20">
          <h2 className="text-4xl text-center font-bold text-accent-green mb-10">
            Our Model Identifies These Waste Categories:
          </h2>

          {/* Flexbox for all waste category cards */}
          <div className="flex flex-wrap gap-8 justify-center text-primary-green">
            {/* container for the recycling tile */}
            <div className=" perspective-[1000px]">
              <div
                className={`relative w-64 h-64 [transform-style:preserve-3d] transition-transform duration-700
            ${flippedCard == "recycling" ? "[transform:rotateY(180deg)]" : ""}`}
                // tell React what code to run when tile is clicked
                onClick={() => handleCardClick("recycling")}
              >
                {/* front-facing card for recycling */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center
              border rounded-2xl p-10 shadow-xl cursor-pointer
              bg-gradient-to-br from-white to-green-50       
              transition-all hover:scale-105 ring-1 ring-green-200
              [backface-visibility:hidden]"
                >
                  {/* recycling icon */}
                  <MdRecycling size={120}></MdRecycling>
                  <h3 className="text-xl font-bold text-accent-green mt-2 mb-4">
                    Recycling
                  </h3>
                </div>

                {/* back facing card for recyling */}
                <div
                  className={`bg-surface absolute inset-0 flex flex-col items-center justify-center
               rounded-2xl shadow-xl text-primary-green text-lg text-center p-6
            [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer`}
                >
                  <p>Bottles and Paper should be Recycled.</p>
                </div>
              </div>
            </div>

            <div className="perspective-[1000px]">
              <div
                className={`relative w-64 h-64 [transform-style:preserve-3d] transition-transform duration-700
            ${flippedCard == "garbage" ? "[transform:rotateY(180deg)]" : ""}`}
                onClick={() => handleCardClick("garbage")}
              >
                {/*front facing card for garbage */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center
              border rounded-2xl p-10 shadow-xl cursor-pointer
              bg-gradient-to-br from-white to-green-50       
              transition-all hover:scale-105 ring-1 ring-green-200
              [backface-visibility:hidden]"
                >
                  <BsTrash3 size={120}></BsTrash3>
                  <h3 className="text-xl font-bold text-accent-green mt-2 mb-4">
                    Garbage
                  </h3>
                </div>

                {/* back facing card for garbage */}
                <div
                  className="bg-surface absolute inset-0 flex flex-col items-center justify-center
               rounded-2xl shadow-xl text-primary-green text-lg text-center p-6
            [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer"
                >
                  <p>
                    Place all items that can't be recycled into the garbage.
                  </p>
                </div>
              </div>
            </div>

            <div className="perspective-[1000px]">
              {/* parent container for compost card */}
              <div
                className={`relative w-64 h-64 [transform-style:preserve-3d] transition-transform duration-700
              ${flippedCard == "compost" ? "[transform:rotateY(180deg)]" : ""}`}
                onClick={() => handleCardClick("compost")}
              >
                {/* front facing card for compost */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center
              border rounded-2xl p-10 shadow-xl cursor-pointer
              bg-gradient-to-br from-white to-green-50       
              transition-all hover:scale-105 ring-1 ring-green-200
              [backface-visibility:hidden]"
                >
                  <MdCompost size={120}></MdCompost>
                  <h3 className="text-xl font-bold text-accent-green mt-2 mb-4">
                    Compost
                  </h3>
                </div>

                {/* back facing card for compost */}
                <div
                  className="bg-surface absolute inset-0 flex flex-col items-center justify-center
               rounded-2xl shadow-xl text-primary-green text-lg text-center p-6
            [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer"
                >
                  <p>Place all food items in the compost.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*Video Feed Placeholder*/}
        <section className="mt-8 text-center flex justify-center py-20">
          <div className="w-[640px] border rounded shadow-lg px-4 py-12 mb-5">
            {/* Mode Toggle Buttons */}
            <div className="flex gap-2 mb-6 justify-center">
              <button
                onClick={() => setDisplayMode("browser-camera")}
                className={`px-4 py-2 rounded font-semibold transition-all ${
                  displayMode === "browser-camera"
                    ? "bg-accent-green text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Browser Camera Mode
              </button>
              <button
                onClick={() => setDisplayMode("python-stream")}
                className={`px-4 py-2 rounded font-semibold transition-all ${
                  displayMode === "python-stream"
                    ? "bg-accent-green text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Python Stream Mode
              </button>
            </div>

            {/* Title changes based on mode */}
            <p className="text-gray-400 text-xl mb-4">
              {displayMode === "browser-camera"
                ? "Browser Camera + AI Overlay"
                : "Python YOLO Stream"}
            </p>

            {/* Show different components based on mode */}
            {displayMode === "browser-camera" ? (
              //  Browser Camera with Detection Overlay
              //  canvas overlay on top
              <div className="relative">
                {/* Your original CameraPreview component */}
                <CameraPreview videoRef={videoRef} />

                {/* Canvas overlay that draws detection boxes on top */}
                <DetectionOverlay videoRef={videoRef} />
              </div>
            ) : (
              // MODE 2: Python Stream View
              // This shows frames directly from Python (with boxes already drawn)
              <PythonStreamView />
            )}

            {/* <video
              src="/Placeholder_video.mp4"
              controls
              muted
              className="w-full h-auto rounded"
            ></video> */}
          </div>
        </section>

        {/*Classification Results*/}
        <section className="text-center mt-6 mb-4">
          <div className="text-accent-green font-bold border rounded bg-surface shadow-md p-12">
            <h3>Classification Results:</h3>
            <ul>
              {updates.map((u, i) => (
                <li key={i}>
                  {u.timestamp}: {u.waste_type} ({u.confidence})
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
