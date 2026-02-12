"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { getBooks, deleteBook, type Book } from "@/lib/api";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch {
      // silently fail — empty shelf
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
    try {
      await deleteBook(token, bookId);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch {
      alert("Failed to delete book");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-muted text-sm">Loading...</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-2">
        <p className="text-muted text-lg">No books yet.</p>
        <p className="text-muted/60 text-sm">
          Start building your reading list.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <div key={book.id} className="group relative">
          {token && (
            <button
              onClick={() => handleDelete(book.id)}
              disabled={deleting === book.id}
              className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-danger text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/80 disabled:opacity-50"
              aria-label={`Delete ${book.title}`}
            >
              {deleting === book.id ? "..." : "\u00d7"}
            </button>
          )}
          <div className="bg-card-bg rounded-lg border border-card-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-[2/3] relative bg-card-border/30">
              {book.cover_edition_key ? (
                <Image
                  src={`https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-M.jpg`}
                  alt={`Cover of ${book.title}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted/40">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
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
            <div className="p-3">
              <h2 className="text-sm font-medium leading-snug line-clamp-2">
                {book.title}
              </h2>
              <p className="text-xs text-muted mt-1 line-clamp-1">
                {book.author}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
