import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";
import { CartProvider } from "../context/CartContext";
import { SmoothScroll } from "../components/SmoothScroll";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Eliminate browser scrollbars cleanly without universal wildcard selector overhead */
            html, body {
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
      <body className="min-h-screen flex flex-col bg-[#FAF7F2] overflow-x-clip selection:bg-amber-400" suppressHydrationWarning>
        <SmoothScroll />
        <LanguageProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
