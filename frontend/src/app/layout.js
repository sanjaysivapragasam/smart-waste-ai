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
      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans pt-20">
       
       
        {/* header */}
        <header className=" fixed top-0 left-0 right-0 z-50 bg-white shadow-lg p-4 flex items-center justify-start gap-6">
          <img
          src="/project_logo.png"
              alt="Project logo"
              className="w-14 h-14"
          ></img>
          
          <h1 className="text-3xl font-semibold text-[var(--accent-green)]">
            Smart Waste AI
          </h1>
        </header>

        {/* main content */}
        <main className="p-6">{children}</main>

        {/* footer */}
        <footer className="bg-gray-100 text-center p-4 mt-8 text-sm text-gray-500">
          {/* <a> is a hyperlink tag in HTML
          href is the link to the github repo
          target="_blank" is used to open links in a new tab
          rel="noopener noreferrer" is a security measure when opening new tabs
          
          */}
          © {new Date().getFullYear()} Smart Waste AI Project
          <a
            href="https://github.com/sanjaysivapragasam/smart-waste-ai"
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
