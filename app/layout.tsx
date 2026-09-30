import type { Metadata } from "next";
import "./globals.css";

// Deliberately no next/font/google here: it fetches font files from Google
// Fonts at BUILD time, which is a real fragility risk for CI/deployment
// (any network hiccup during a build breaks the whole deploy). The stylesheet
// <link> below is different — it's a normal runtime request the browser
// makes, exactly like linking any other CSS, not something the build has to
// succeed at. Special Elite (the case-file typewriter face) and IBM Plex
// Sans/Mono are the type system from the recovered standalone artifact
// prototype (see CLAUDE.md's "Repo location") — wired in via --font-* theme
// tokens in globals.css, so every existing font-serif/font-mono/font-sans
// class picks them up without touching each component.

export const metadata: Metadata = {
  title: "Hollenbourne Case Review",
  description: "Becoming a Criminologist — team case-review portal",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- that rule targets pages/_document.js from the Pages Router; this IS the App Router's one root layout, so it already applies everywhere. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Special+Elite&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <div className="map-backdrop" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
