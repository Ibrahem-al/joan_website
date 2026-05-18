import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LaPai Management Solutions & Consulting LLC | Premier Business Directory",
  description:
    "Connect with vetted small businesses across multiple states. Your trusted network for home repair, beauty, legal, financial, and more.",
  keywords: "business directory, referral network, small business, contractors, professionals",
  openGraph: {
    title: "LaPai Management Solutions & Consulting LLC",
    description: "Your trusted business referral network",
    url: "https://lapaisolutions.com",
    siteName: "LaPai Management Solutions & Consulting LLC",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-cream min-h-screen flex flex-col">
        <Navbar />
        <AnalyticsTracker />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
