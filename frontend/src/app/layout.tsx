// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

// (optional) SEO metadata — shows on browser tab and search engines
export const metadata: Metadata = {
  title: "Smart Waste AI",
  description: "AI-powered waste classification system using edge devices",
};

// The RootLayout wraps all your pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Global font and background */}
      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        {/* Header section */}
        <header className="bg-white shadow-md p-4 flex justify-center">
          <h1 className="text-2xl font-semibold text-purple-600">
            Smart Waste AI
          </h1>
        </header>

        {/* Main content */}
        <main className="p-6">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-100 text-center p-4 mt-8 text-sm text-gray-500">
          © {new Date().getFullYear()} Smart Waste AI Project
        </footer>
      </body>
    </html>
  );
}
