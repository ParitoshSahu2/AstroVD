import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AstroVD • Sacred Vedic Astrology & Consecrated Spiritual Store",
  description: "Authentic Vedic horoscope consultations, Janam Kundli analysis, and energized gemstones consecrated by Varanasi Acharyas.",
};

import { LanguageProvider } from "../context/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Eliminate all browser vertical and horizontal scrollbars completely */
            html, body, *, *::before, *::after {
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }
            ::-webkit-scrollbar,
            *::-webkit-scrollbar,
            html::-webkit-scrollbar,
            body::-webkit-scrollbar {
              display: none !important;
              width: 0px !important;
              height: 0px !important;
              opacity: 0 !important;
              background: transparent !important;
            }
            ::-webkit-scrollbar-thumb,
            ::-webkit-scrollbar-track,
            ::-webkit-scrollbar-corner {
              display: none !important;
              background: transparent !important;
              width: 0px !important;
              height: 0px !important;
            }
          `
        }} />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF7F2] overflow-x-hidden selection:bg-amber-400" suppressHydrationWarning>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
