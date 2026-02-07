import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next"
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
  metadataBase: new URL("https://nav-sikhiyo.vercel.app"),
  title: {
    default: "NavSikhyo - Learn Coding, Technology & Lifestyle",
    template: "%s | NavSikhyo",
  },
  alternates: {
    canonical: "/",
  },
  description: "NavSikhyo is your go-to platform for mastering coding, exploring the latest technology trends, and balancing a developer lifestyle.",
  keywords: ["coding", "web development", "react", "next.js", "technology", "programming tutorials", "developer lifestyle"],
  authors: [{ name: "NavSikhyo Team" }],
  creator: "NavSikhyo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nav-sikhiyo.vercel.app",
    title: "NavSikhyo - Learn Coding, Technology & Lifestyle",
    description: "Master coding, explore tech trends, and enhance your developer lifestyle with NavSikhyo.",
    siteName: "NavSikhyo",
    images: [
      {
        url: "/og-image.jpg", // We should probably ensure this image exists or use a default
        width: 1200,
        height: 630,
        alt: "NavSikhyo - Learn Coding & Technology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NavSikhyo - Learn Coding, Technology & Lifestyle",
    description: "Master coding, explore tech trends, and enhance your developer lifestyle with NavSikhyo.",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "R-h1jpHZQHjQxUkbMg1cJzqNNWh5RVDa6biJYg9BtkI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "NavSikhyo",
              url: "https://nav-sikhiyo.vercel.app",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://nav-sikhiyo.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Script
          id="json-ld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "NavSikhyo",
              url: "https://nav-sikhiyo.vercel.app",
            }),
          }}
        />
        <QueryProvider>
          {children}
          <Toaster />
          <SpeedInsights />
        </QueryProvider>
      </body>
    </html>
  );
}
