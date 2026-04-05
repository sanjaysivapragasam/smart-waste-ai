// importing the global css code
import "./globals.css";
// importing the dashboard front from Google Fonts
import { Saira } from "next/font/google";

// setting up function for the imported font
const saira = Saira({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-saira",
});

// browser tab and search engine metadata
export const metadata = {
  title: "SmartBin Assist",
  description: "AI-powered waste classification system using edge devices",
};

// RootLayout wraps all webpages
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* global font and background */}
      <body
        suppressHydrationWarning={true}
        className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden"
      >
        {/* header */}
        <header className=" fixed top-0 left-0 right-0 z-50 bg-surface shadow-lg p-4 flex items-center justify-start gap-6">
          <img
            src="/project_logo.png"
            alt="Project logo"
            className="w-14 h-14"
          ></img>

          <h1 className="text-3xl font-semibold text-[var(--accent-green)]">
            SmartBin Assist
          </h1>
        </header>

        {/* main content */}
        <main className="pt-24 p-6">{children}</main>

        {/* footer */}
        <footer className="bg-surface-2 text-center p-4 mt-8 text-sm text-gray-600">
          {/* <a> is a hyperlink tag in HTML
          href is the link to the github repo
          target="_blank" is used to open links in a new tab
          rel="noopener noreferrer" is a security measure when opening new tabs
          
          */}
          © {new Date().getFullYear()} SmartBin Assist
          <a
            href="https://github.com/sanjaysivapragasam/SmartBin-Assist"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/*
             <img> is an HTML image tag to display images
             src="/github_logo.png" = tells Next.js the path to get the image from
             alt="GitHub logo" = descriptive text for screen readers (and SEO)
             className= tailwind utility classes for size + hover effect.
           */}
            <img
              src="/github_logo.png"
              alt="GitHub logo"
              className="w-6 h-6 inline hover:opacity-80 transition-opacity duration-200"
            />
          </a>
        </footer>
      </body>
    </html>
  );
}
