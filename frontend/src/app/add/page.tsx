"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { verifyPasscode, addBook } from "@/lib/api";

interface SearchResult {
  key: string;
  title: string;
  author_name?: string[];
  cover_edition_key?: string;
  first_publish_year?: number;
}

export default function AddPage() {
  const [token, setToken] = useState<string | null>(null);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const [addingKey, setAddingKey] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("booklist_token");
    if (stored) setToken(stored);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const t = await verifyPasscode(passcode);
      sessionStorage.setItem("booklist_token", t);
      setToken(t);
    } catch {
      setAuthError("Invalid passcode. Try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const searchBooks = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8&fields=key,title,author_name,cover_edition_key,first_publish_year`
      );
      const data = await res.json();
      setResults(data.docs || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchBooks(value);
    }, 300);
  };

  const handleAdd = async (result: SearchResult) => {
    if (!token) return;
    setAddingKey(result.key);
    try {
      await addBook(token, {
        title: result.title,
        author: result.author_name?.[0] || "Unknown",
        cover_edition_key: result.cover_edition_key,
        year: result.first_publish_year,
      });
      setAddedKeys((prev) => new Set(prev).add(result.key));
    } catch {
      alert("Failed to add book");
    } finally {
      setAddingKey(null);
    }
  };

  // Not authenticated — show passcode form
  if (!token) {
    return (
      <div className="flex items-center justify-center py-32">
        <form
          onSubmit={handleAuth}
          className="w-full max-w-xs flex flex-col gap-4"
        >
          <h1 className="text-lg font-semibold text-center">Enter Passcode</h1>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-sm focus:outline-none focus:ring-2 focus:ring-accent-light/50 focus:border-accent-light"
            autoFocus
          />
          {authError && (
            <p className="text-danger text-xs text-center">{authError}</p>
          )}
          <button
            type="submit"
            disabled={authLoading || !passcode}
            className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? "Verifying..." : "Continue"}
          </button>
        </form>
      </div>
    );
  }

  // Authenticated — show search interface
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-semibold mb-6">Add a Book</h1>

      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search by title or author..."
          className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-sm focus:outline-none focus:ring-2 focus:ring-accent-light/50 focus:border-accent-light"
          autoFocus
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-accent-light/30 border-t-accent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((result) => {
            const isAdded = addedKeys.has(result.key);
            const isAdding = addingKey === result.key;

            return (
              <div
                key={result.key}
                className="flex items-center gap-4 p-3 rounded-lg border border-card-border bg-card-bg"
              >
                <div className="w-12 h-16 relative flex-shrink-0 rounded overflow-hidden bg-card-border/30">
                  {result.cover_edition_key ? (
                    <Image
                      src={`https://covers.openlibrary.org/b/olid/${result.cover_edition_key}-M.jpg`}
                      alt={`Cover of ${result.title}`}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug line-clamp-1">
                    {result.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5 line-clamp-1">
                    {result.author_name?.[0] || "Unknown author"}
                    {result.first_publish_year &&
                      ` \u00b7 ${result.first_publish_year}`}
                  </p>
                </div>

                <button
                  onClick={() => handleAdd(result)}
                  disabled={isAdded || isAdding}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium ${
                    isAdded
                      ? "bg-success/10 text-success cursor-default"
                      : "bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
                  }`}
                >
                  {isAdded ? "Added" : isAdding ? "..." : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {query && !searching && results.length === 0 && (
        <p className="text-muted text-sm text-center py-8">
          No results found.
        </p>
      )}
    </div>
  );
}
