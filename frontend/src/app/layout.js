import "./globals.css";
// browser tab and search engine metadata
export const metadata = {
  title: "Smart Waste AI",
  description: "AI-powered waste classification system using edge devices",
};

// RootLayout wraps all webpages
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* global font and background */}
      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        {/* header */}
        <header className="bg-white shadow-md p-4 flex justify-center">
          <h1 className="text-2xl font-semibold text-purple-600">
            Smart Waste AI
          </h1>
        </header>

        {/* main content */}
        <main className="p-6">{children}</main>

        {/* footer */}
        <footer className="bg-gray-100 text-center p-4 mt-8 text-sm text-gray-500">
          © {new Date().getFullYear()} Smart Waste AI Project
        </footer>
      </body>
    </html>
  );
}