import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Booklist",
  description: "Books I want to read.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <header className="border-b border-card-border bg-card-bg/60 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight text-foreground hover:text-accent"
            >
              Booklist
            </Link>
            <Link
              href="/add"
              className="text-sm font-medium text-muted hover:text-accent px-3 py-1.5 rounded-md hover:bg-card-border/40"
            >
              + Add
            </Link>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
