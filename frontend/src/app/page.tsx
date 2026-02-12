"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBooks, deleteBook, type Book } from "@/lib/api";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch {
      // empty shelf
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("booklist_token");
    if (stored) setToken(stored);
    fetchBooks();
  }, [fetchBooks]);

  const handleDelete = async (bookId: string) => {
    if (!token) return;
    setDeleting(bookId);
    setError(null);
    try {
      await deleteBook(token, bookId);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch {
      setError("Failed to remove entry.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="font-mono text-sm text-muted tracking-wide">
          Loading catalog...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="font-mono text-2xl font-semibold tracking-tight">
          BOOKLIST
        </h1>
        <Link
          href="/add"
          className="font-mono text-xs text-muted hover:text-accent tracking-wide"
        >
          [ + ADD ]
        </Link>
      </div>
      <div className="border-t-2 border-foreground mb-1" />
      <p className="font-mono text-xs text-muted tracking-wide mb-8">
        {books.length} {books.length === 1 ? "volume" : "volumes"} cataloged
      </p>

      {/* Error toast */}
      {error && (
        <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/30 rounded text-danger text-xs font-mono">
          {error}
        </div>
      )}

      {/* Empty state */}
      {books.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted/40"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          <p className="font-mono text-sm text-muted">
            The catalog is empty.
          </p>
        </div>
      )}

      {/* Book entries */}
      <div className="flex flex-col gap-3">
        {books.map((book, index) => (
          <div
            key={book.id}
            className="group relative bg-card-bg border border-card-border rounded-sm p-4 flex gap-4 items-start"
          >
            {/* Red top accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent/60" />

            {/* Catalog number */}
            <div className="font-mono text-[10px] text-muted/50 absolute top-1.5 right-3 tracking-widest">
              {String(index + 1).padStart(3, "0")}
            </div>

            {/* Cover thumbnail */}
            <div className="w-14 h-20 relative flex-shrink-0 rounded-sm overflow-hidden bg-card-border/40">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={`Cover of ${book.title}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                </div>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h2 className="font-mono text-sm font-medium leading-snug line-clamp-2">
                {book.title}
              </h2>
              <p className="text-xs text-muted mt-1 line-clamp-1">
                {book.author}
              </p>
            </div>

            {/* Delete button (authed only) */}
            {token && (
              <button
                onClick={() => handleDelete(book.id)}
                disabled={deleting === book.id}
                className="absolute bottom-2 right-3 font-mono text-[10px] text-muted/40 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                aria-label={`Remove ${book.title}`}
              >
                {deleting === book.id ? "..." : "[ REMOVE ]"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
