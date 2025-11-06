// use client tells Next.js this component runs in the browser
// required if we use state, events, or effects
"use client";

// Import React to access to React's hooks (useState, useEffect)
import React, { useState, useEffect } from "react";

// importing icons from react-icons
import { AiOutlineVideoCamera } from "react-icons/ai";
import { LuBrainCircuit } from "react-icons/lu";
import { BiCategoryAlt } from "react-icons/bi";
import { MdRecycling } from "react-icons/md";
import { MdCompost } from "react-icons/md";
import { BsTrash3 } from "react-icons/bs";

// main React component for the homepage
// every Next.js route is a React component
export default function Home() {
  // this return section below is what gets rendered on the page
  // tailwind classes for layout and style
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* section for intro with slogan and quick tagline*/}
      <section id="intro" className="text-center p-12 mb-20">
        {/* Slogan*/}
        <h1 className="text-5xl font-bold text-[var(--accent-green)] mb-4">
          Smart Sorting for Sustainable Living
        </h1>

        {/* Quick Project Description*/}
        <p className="font-bold text-[var(--accent-green)]">
          Helping communities with AI-driven waste classification for a cleaner,
          greener future.
        </p>
      </section>

      {/*How does it work? */}
      <section>
        <h2 className="text-3xl text-center font-bold text-[var(--accent-green)] mb-4">
          How It Works
        </h2>

        <p className="text-center font-bold text-[var(--accent-green)] mb-4">
          Our Smart Waste Ai project uses a simple pipeline to classify waste in
          real-time
        </p>

        {/*React icons for how does it work section */}
        <section className="flex flex-wrap justify-center py-5 gap-12">
          <div
            className="flex flex-col items-center text-center rounded-md bg-white
          shadow-md p-6 hover:scale-105 transition-transform duration-300"
          >
            <AiOutlineVideoCamera
              size={80}
              className="text-[var(--primary-green)]"
            ></AiOutlineVideoCamera>
            <h3 className="font-bold text-[var(--accent-green)] mb-4">
              Capture Camera Feed
            </h3>
          </div>

          <div
            className="flex flex-col items-center text-center rounded-md bg-white shadow-md p-6
          hover:scale-105 transition-transform duration-300"
          >
            <LuBrainCircuit
              size={80}
              className="text-[var(--primary-green)]"
            ></LuBrainCircuit>
            <h3 className="font-bold text-[var(--accent-green)] mb-4">
              ML Analyzing Data
            </h3>
          </div>

          <div
            className="flex flex-col items-center text-center rounded-md bg-white shadow-md p-6
          hover:scale-105 transition-transform duration-300"
          >
            <BiCategoryAlt
              size={80}
              className="text-[var(--primary-green)]"
            ></BiCategoryAlt>
            <h3 className="font-bold text-[var(--accent-green)] mb-4">
              Classify and Display Results
            </h3>
          </div>
        </section>
      </section>

      {/*Waste Categories*/}
      <section>
        <h2 className="text-3xl text-center font-bold text-[var(--accent-green)] mb-4">
          Our Model Identifies These Waste Categories:
        </h2>
        <div className="flex flex-wrap gap-8 justify-center text-[var(--primary-green)]">
          <div className="flex flex-col items-center">
            <MdRecycling size={80}></MdRecycling>
            <h3 className="font-bold text-[var(--accent-green)] mt-2 mb-4">
              Recycling
            </h3>
          </div>
          <div className="flex flex-col items-center">
            <BsTrash3 size={80}></BsTrash3>
            <h3 className="font-bold text-[var(--accent-green)] mt-2 mb-4">
              Garbage
            </h3>
          </div>
          <div className="flex flex-col items-center">
            <MdCompost size={80}></MdCompost>
            <h3 className="font-bold text-[var(--accent-green)] mt-2 mb-4">
              Compost
            </h3>
          </div>
        </div>
      </section>

      {/*Video Feed Placeholder*/}
      <section className="mt-8 text-center flex justify-center">
        <div className="w-[640px] border rounded shadow-lg px-4 py-4 mb-5">
          <p className="text-gray-400 text-xl mb-4">
            Live Video Feed Placeholder
          </p>
          <video
            src="/Placeholder_video.mp4"
            controls
            muted
            className="w-full h-auto rounded"
          ></video>
        </div>
      </section>

      {/*Classification Results*/}
      <section className="text-center mt-6 mb-4">
        <div className="text-[var(--accent-green)] font-bold border rounded bg-white shadow-md px-6 py-4 ">
          <h3>Classification Results:</h3>
          <p>Item: Garbage</p>
          <p>Confidence: 0.85</p>
        </div>
      </section>
    </div>
  );
}
