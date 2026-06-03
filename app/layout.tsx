import type { Metadata } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Big Money Realty — Las Vegas Real Estate | Damian Einbinder",
  description:
    "Las Vegas's premier real estate broker. Buying, selling, and investing in Las Vegas with Damian Einbinder — results-driven, 24/7 available, and built different.",
  openGraph: {
    title: "Big Money Realty — Las Vegas Real Estate",
    description: "Buy, sell, or invest in Las Vegas with Damian Einbinder.",
    siteName: "Big Money Realty",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${lato.variable} h-full`}>
      <body className="min-h-full bg-white text-[#1C1C1C] antialiased font-sans">{children}</body>
    </html>
  );
}
