// use client tells Next.js this component runs in the browser
// required if we use state, events, or effects
"use client";

// Import React to access to React's hooks (useState, useEffect)
import React, { useState, useEffect } from "react";

// main React component for the homepage
// every Next.js route is a React component
export default function Home() {
  // useState remembers data between re-renders.
  // variable that causes the screen to update when changed.
  const [message, setMessage] = useState("Welcome to Smart Waste AI!");

  // useEffect lets us run code after the page first loads
  // update the message after 3 seconds
  useEffect(() => {
    // setTimeout runs function after 3000 ms
    const timer = setTimeout(() => {
      setMessage("Ready to build your first feature!");
    }, 3000);

    // return a cleanup function to stop the timer if the component is removed
    return () => clearTimeout(timer);
  }, []); // empty array [] means this effect runs only once (on page load)

  // this return section below is what gets rendered on the page
  // tailwind classes for layout and style
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      
      
      {/* Champions of Cleverslogan*/}
      <h1 className="text-3xl font-bold text-[var(--accent-green)] mb-4">
        Smart Waste AI
      </h1>

      {/* display the message */}
      <p className="text-lg text-gray-700">{message}</p>

      {/* testing out a button interactivity */}
      <button
        className="bg-[var(--primary-green)] hover:bg-[var(--accent-green)] 
                   text-white px-6 py-3 rounded-lg 
                   transition-colors duration-200"
        onClick={() => setMessage("You clicked the button!")}
      >
        Click Me
      </button>
    </div>
  );
}