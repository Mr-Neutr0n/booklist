"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const [addError, setAddError] = useState<string | null>(null);

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
      setAuthError("Access denied.");
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
    setAddError(null);
    try {
      const coverUrl = result.cover_edition_key
        ? `https://covers.openlibrary.org/b/olid/${result.cover_edition_key}-M.jpg`
        : undefined;

      await addBook(token, {
        title: result.title,
        author: result.author_name?.[0] || "Unknown",
        cover_url: coverUrl,
        ol_key: result.key,
      });
      setAddedKeys((prev) => new Set(prev).add(result.key));
    } catch {
      setAddError("Failed to catalog entry.");
      setTimeout(() => setAddError(null), 3000);
    } finally {
      setAddingKey(null);
    }
  };

  // Not authenticated
  if (!token) {
    return (
      <div className="flex items-center justify-center py-32">
        <form
          onSubmit={handleAuth}
          className="w-full max-w-xs flex flex-col gap-4"
        >
          <div className="text-center mb-2">
            <p className="font-mono text-xs text-muted tracking-widest uppercase">
              Staff Only
            </p>
            <div className="border-t border-card-border mt-3" />
          </div>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            className="w-full px-4 py-2.5 rounded-sm border border-card-border bg-card-bg font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40"
            autoFocus
          />
          {authError && (
            <p className="text-danger font-mono text-xs text-center">
              {authError}
            </p>
          )}
          <button
            type="submit"
            disabled={authLoading || !passcode}
            className="w-full py-2.5 rounded-sm bg-accent text-card-bg font-mono text-sm font-medium tracking-wide hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          >
            {authLoading ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  // Authenticated
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="font-mono text-lg font-semibold tracking-tight">
          NEW ENTRY
        </h1>
        <Link
          href="/"
          className="font-mono text-xs text-muted hover:text-accent tracking-wide"
        >
          [ CATALOG ]
        </Link>
      </div>
      <div className="border-t-2 border-foreground mb-6" />

      {/* Error toast */}
      {addError && (
        <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/30 rounded-sm text-danger text-xs font-mono">
          {addError}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search by title or author..."
          className="w-full px-4 py-3 rounded-sm border border-card-border bg-card-bg font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40"
          autoFocus
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-card-border border-t-accent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((result) => {
            const isAdded = addedKeys.has(result.key);
            const isAdding = addingKey === result.key;
            const coverUrl = result.cover_edition_key
              ? `https://covers.openlibrary.org/b/olid/${result.cover_edition_key}-S.jpg`
              : null;

            return (
              <div
                key={result.key}
                className="flex items-center gap-4 p-3 rounded-sm border border-card-border bg-card-bg"
              >
                <div className="w-10 h-14 relative flex-shrink-0 rounded-sm overflow-hidden bg-card-border/40">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={`Cover of ${result.title}`}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
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
                  <p className="font-mono text-sm font-medium leading-snug line-clamp-1">
                    {result.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5 line-clamp-1">
                    {result.author_name?.[0] || "Unknown author"}
                    {result.first_publish_year &&
                      ` · ${result.first_publish_year}`}
                  </p>
                </div>

                <button
                  onClick={() => handleAdd(result)}
                  disabled={isAdded || isAdding}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-sm font-mono text-xs font-medium tracking-wide ${
                    isAdded
                      ? "bg-success/10 text-success cursor-default"
                      : "bg-accent text-card-bg hover:bg-accent/90 disabled:opacity-50"
                  }`}
                >
                  {isAdded ? "FILED" : isAdding ? "..." : "FILE"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {query && !searching && results.length === 0 && (
        <p className="font-mono text-sm text-muted text-center py-8">
          No results found.
        </p>
      )}
    </div>
  );
}
