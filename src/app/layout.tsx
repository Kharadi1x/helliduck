import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Helliduck — The Internet's Most Opinionated Duck",
  description:
    "AI-powered excuses, brutally honest fortunes, argument settling, life choice ratings, dares, website roasting, memes, and a duck game. All from one very opinionated duck.",
  openGraph: {
    title: "Helliduck — The Internet's Most Opinionated Duck",
    description: "8 AI-powered tools for entertainment, chaos, and questionable life advice.",
    siteName: "Helliduck",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
