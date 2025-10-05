// src/app/page.tsx

// 1️⃣ "use client" tells Next.js this component runs in the browser
//    (not on the server). It’s required if we use state, events, or effects.
"use client";

// 2️⃣ Import React — this gives us access to React’s hooks (useState, useEffect)
import React, { useState, useEffect } from "react";

// 3️⃣ This is our main React component for the homepage
//    Every Next.js route is a React component.
export default function Home() {
  // 4️⃣ useState lets us “remember” data between re-renders.
  //    Think of this like a variable that causes the screen to update when changed.
  const [message, setMessage] = useState("Welcome to Smart Waste AI!");

  // 5️⃣ useEffect lets us run code *after* the page first loads.
  //    Here, we’ll update the message after 3 seconds.
  useEffect(() => {
    // setTimeout runs a function after X milliseconds (3000 ms = 3 seconds)
    const timer = setTimeout(() => {
      setMessage("Ready to build your first feature!");
    }, 3000);

    // Return a cleanup function to stop the timer if the component is removed.
    return () => clearTimeout(timer);
  }, []); // The empty array [] means this effect runs only once (on page load)

  // 6️⃣ This is the part that gets *rendered on the page*.
  //    It uses Tailwind classes for layout and style.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Title of the app */}
      <h1 className="text-3xl font-bold text-purple-700 mb-4">
        Smart Waste AI
      </h1>

      {/* This text will change automatically after 3 seconds */}
      <p className="text-lg text-gray-700">{message}</p>

      {/* A sample button just to try interactivity */}
      <button
        className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        onClick={() => setMessage("You clicked the button!")}
      >
        Click Me
      </button>
    </div>
  );
}
