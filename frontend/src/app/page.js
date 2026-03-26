// use client tells Next.js this component runs in the browser
// required if we use state, events, or effects
"use client";

// Import React to access to React's hooks (useState, useEffect)
import React, { useState, useEffect, useRef } from "react";

// Import socket.io client library
import { io } from "socket.io-client";

// importing icons from react-icons for pipeline
import { AiOutlineVideoCamera } from "react-icons/ai";
import { LuBrainCircuit } from "react-icons/lu";
import { BiCategoryAlt } from "react-icons/bi";
import { TbArrowBigRightLines } from "react-icons/tb";
// importing icons for flip cards
import { MdOutlineEco } from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";
import { LuGlassWater } from "react-icons/lu";
import { GiSodaCan } from "react-icons/gi";
import { IoDocumentTextOutline } from "react-icons/io5";
import { TbCup } from "react-icons/tb";

// importing the camera component created for the computer vison
import PythonStreamView from "./components/PythonStreamView";
// commented out the below because its no longer needed
// import CameraPreview from "./components/CameraPreview";
// import DetectionOverlay from "./components/DetectionOverlay";

// main React component for the homepage
// every Next.js route is a React component
export default function Home() {
  // state to hold current detections keyed by waste_type (not a history log)
  const [updates, setUpdates] = useState({});

  // Timer ref used to clear detections when nothing is being detected
  const clearTimer = useRef(null);

  // State to control which visualization mode we're using
  // "browser-camera" = CameraPreview with overlay
  // "python-stream" = PythonStreamView with frames sent over network
  const [displayMode, setDisplayMode] = useState("browser-camera");

  // reference to the video element for drawing boxes on top
  const videoRef = useRef(null);

  // useEffect to set up WebSocket connection on component mount
  useEffect(() => {
    // connects to WebSocket server
    // uses ngrok public URL in production
    // falls back to localhost for local dev
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
    );

    // listens for "update" events from server (socket-server.mjs)
    // keys by waste_type so each category shows only once (current state)
    socket.on("update", (data) => {
      setUpdates((prev) => ({
        ...prev,
        [data.waste_type]: data,
      }));
      console.log("Real-time update:", data);

      // Reset the clear timer on every new detection
      // Clears display ~1 second after detections stop arriving
      clearTimeout(clearTimer.current);
      clearTimer.current = setTimeout(() => {
        setUpdates({});
      }, 1000);
    });

    return () => {
      socket.disconnect();
      clearTimeout(clearTimer.current);
    };
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

  // data structure representing the waste classes detected by the ML model
  // each object contains the information required to render a flip card
  const wasteCategories = [
    {
      id: "biodegradable",
      name: "Biodegradable",
      icon: MdOutlineEco,
      backText:
        "Food scraps and other biodegradable items should be placed in the organic waste stream.",
    },
    {
      id: "cardboard",
      name: "Cardboard",
      icon: FaBoxOpen,
      backText:
        "Clean cardboard should be flattened and placed in the recycling stream.",
    },
    {
      id: "glass",
      name: "Glass",
      icon: LuGlassWater,
      backText:
        "Glass bottles and containers should be disposed of in recycling where accepted.",
    },
    {
      id: "metal",
      name: "Metal",
      icon: GiSodaCan,
      backText:
        "Metal containers and similar materials should be placed in recycling.",
    },
    {
      id: "paper",
      name: "Paper",
      icon: IoDocumentTextOutline,
      backText:
        "Clean paper products should be disposed of in the recycling stream.",
    },
    {
      id: "plastic",
      name: "Plastic",
      icon: TbCup,
      backText:
        "Plastic containers should be sorted according to recycling guidelines.",
    },
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
            Our Smart Waste AI project uses a simple pipeline to classify waste
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
            Our Model Detects the Following Waste Classes:
          </h2>

          {/* flex container holding all flip cards */}
          <div className="flex flex-wrap gap-8 justify-center text-primary-green">
            {/* iterate through the wasteCategories array to generate a card for each class */}
            {wasteCategories.map((category) => {
              // reference to the icon component stored in the data object
              const IconComponent = category.icon;

              return (
                <div key={category.id} className="perspective-[1000px]">
                  {/* container responsible for the 3D flip effect */}
                  <div
                    className={`relative w-64 h-64 [transform-style:preserve-3d] transition-transform duration-700
                    ${flippedCard == category.id ? "[transform:rotateY(180deg)]" : ""}`}
                    // trigger card flip when clicked
                    onClick={() => handleCardClick(category.id)}
                  >
                    {/* front-facing card showing the waste category */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center
                      border rounded-2xl p-10 shadow-xl cursor-pointer
                      bg-gradient-to-br from-white to-green-50
                      transition-all hover:scale-105 ring-1 ring-green-200
                      [backface-visibility:hidden]"
                    >
                      {/* icon representing the waste class */}
                      <IconComponent size={110} />

                      {/* waste category label */}
                      <h3 className="text-xl font-bold text-accent-green mt-4 mb-2 text-center">
                        {category.name}
                      </h3>
                    </div>

                    {/* back-facing card containing disposal information */}
                    <div
                      className="bg-surface absolute inset-0 flex flex-col items-center justify-center
                      rounded-2xl shadow-xl text-primary-green text-lg text-center p-6
                      [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer"
                    >
                      {/* description associated with the waste class */}
                      <p>{category.backText}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/*Live Video Feed*/}
        <section className="mt-8 text-center flex justify-center py-20">
          <div className="w-[640px] border rounded shadow-lg px-4 py-12 mb-5">
            {/* Title for the finalized live stream mode */}
            <p className="text-gray-400 text-xl mb-4">
              Live Python YOLO Stream
            </p>

            {/* Displays frames directly from Python with detections already drawn */}
            <PythonStreamView />
          </div>
        </section>

        {/*Classification Results — shows only what's currently on screen */}
        <section className="text-center mt-6 mb-4">
          <div className="text-accent-green font-bold border rounded bg-surface shadow-md p-12">
            <h3 className="mb-4">Classification Results:</h3>
            <ul>
              {Object.values(updates).length === 0 ? (
                <li className="text-gray-400 font-normal">
                  No items currently detected
                </li>
              ) : (
                Object.values(updates).map((u) => (
                  <li key={u.waste_type}>
                    {u.waste_type} — {Math.round(u.confidence * 100)}%
                    confidence
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
