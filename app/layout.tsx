import type { Metadata } from "next";
import "./globals.css";

// Deliberately no next/font/google here: it fetches font files from Google
// Fonts at BUILD time, which is a real fragility risk for CI/deployment
// (any network hiccup during a build breaks the whole deploy). A plain
// system font stack costs nothing and has zero external dependency.

export const metadata: Metadata = {
  title: "Hollenbourne Case Review",
  description: "Becoming a Criminologist — team case-review portal",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
