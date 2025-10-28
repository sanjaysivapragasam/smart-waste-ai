// use client tells Next.js this component runs in the browser
// required if we use state, events, or effects
"use client";

// Import React to access to React's hooks (useState, useEffect)
import React, { useState, useEffect } from "react";

// importing icons from react-icons
import { AiOutlineVideoCamera } from "react-icons/ai";
import { LuBrainCircuit } from "react-icons/lu";
import { BiCategoryAlt } from "react-icons/bi";

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
          <div className="flex flex-col items-center text-center rounded-md bg-white shadow-md p-6 hover:scale-105 transition-transform duration-300">
            <AiOutlineVideoCamera
              size={80}
              className="text-[var(--primary-green)]"
            ></AiOutlineVideoCamera>
            <h3 className="font-bold text-[var(--accent-green)] mb-4">
              Capture Camera Feed
            </h3>
          </div>

          <div className="flex flex-col items-center text-center rounded-md bg-white shadow-md p-6 hover:scale-105 transition-transform duration-300">
            <LuBrainCircuit
              size={80}
              className="text-[var(--primary-green)]"
            ></LuBrainCircuit>
            <h3 className="font-bold text-[var(--accent-green)] mb-4">
              ML Analyzing Data
            </h3>
          </div>

          <div className="flex flex-col items-center text-center rounded-md bg-white shadow-md p-6 hover:scale-105 transition-transform duration-300">
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
    </div>
  );
}
