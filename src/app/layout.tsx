import type { Metadata } from "next";
import * as Sentry from "@sentry/nextjs";
import { Space_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cult-machine.com";
const siteTitle = "Cult Machine";
const siteDescription = "Official Cult Machine submissions platform. Submit music, discover editorial opportunities, and connect with a real curation team.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteTitle} — Submissions Portal`,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  applicationName: siteTitle,
  keywords: [
    "Cult Machine",
    "music submissions",
    "editorial submissions",
    "indie music",
    "artist submissions",
    "music magazine",
    "premium PR",
  ],
  alternates: {
    canonical: "/",
    languages: {
      en: "/en/landing",
      es: "/es/landing",
      fr: "/fr/landing",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteTitle,
    title: `${siteTitle} — Submissions Portal`,
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Cult Machine submissions portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteTitle} — Submissions Portal`,
    description: siteDescription,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
  // Sentry Trace Data agregado aquí abajo
  other: {
    ...Sentry.getTraceData()
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${spaceMono.variable} ${dmSans.variable} bg-bg text-cm-text-primary font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}