import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Booklist | Personal Reading List & Book Catalog",
  description:
    "A personal catalog of books I want to read, currently reading, and loved. Search any book, file it to the shelf, browse the collection. Built like a library card catalog.",
  keywords: [
    "booklist",
    "reading list",
    "book catalog",
    "personal library",
    "books to read",
    "book tracker",
  ],
  authors: [{ name: "harikp" }],
  metadataBase: new URL("https://booklist.harikp.com"),
  openGraph: {
    title: "Booklist | A Personal Book Catalog",
    description:
      "Search any book, file it to the shelf, browse the collection. A reading list that looks like a library card catalog.",
    url: "https://booklist.harikp.com",
    type: "website",
    siteName: "Booklist",
    images: [
      {
        url: "https://booklist.harikp.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Booklist | A personal reading list catalog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Booklist | A Personal Book Catalog",
    description:
      "Search any book, file it to the shelf, browse the collection. Built like a library card catalog.",
    images: ["https://booklist.harikp.com/og-image.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Booklist",
  url: "https://booklist.harikp.com",
  description: "A personal reading list catalog.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" href="/icon-192.png" sizes="192x192" />
        <link rel="icon" type="image/png" href="/icon-512.png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
        <footer className="max-w-3xl mx-auto px-6 pb-8 pt-4 border-t border-card-border">
          <p className="font-mono text-xs text-muted tracking-wide">
            <Link
              href="https://harikp.com"
              className="hover:text-foreground"
              target="_blank"
            >
              harikp.com
            </Link>
            <span className="mx-2">·</span>
            2026
          </p>
        </footer>
      </body>
    </html>
  );
}
