import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://postrocket.hu"),
  title: {
    default:
      "PostRocket | Automatizált social media posztolás az AI segítségével",
    template: "%s | PostRocket",
  },
  description:
    "A PostRocket automatikusan készíti és ütemezi az Instagram és Facebook posztjaidat. Több kliens, kevesebb munka — magyar vállalkozásoknak.",
  keywords: [
    "social media kezelés",
    "ai poszt generálás",
    "instagram ütemező",
    "facebook automata poszt",
    "magyar kkv marketing",
  ],
  authors: [{ name: "PostRocket" }],
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: "https://postrocket.hu",
    title: "PostRocket | Automatizált social media posztolás",
    description:
      "A PostRocket automatikusan készíti és ütemezi az Instagram és Facebook posztjaidat. Több kliens, kevesebb munka.",
    siteName: "PostRocket",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PostRocket Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PostRocket | Automatizált social media posztolás",
    description:
      "AI-vezérelt posztgenerálás és ütemezés magyar vállalkozásoknak. Spórolj heti 10 órát!",
    images: ["/og-image.jpg"],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400;1,500;1,600&family=Outfit:wght@200;300;400;500;600;700;800&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
