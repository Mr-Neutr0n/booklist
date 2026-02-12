const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_edition_key?: string;
  year?: number;
}

export interface BookData {
  title: string;
  author: string;
  cover_edition_key?: string;
  year?: number;
}

export async function getBooks(): Promise<Book[]> {
  const res = await fetch(`${API_URL}/api/books`);
  if (!res.ok) {
    throw new Error("Failed to fetch books");
  }
  return res.json();
}

export async function addBook(token: string, bookData: BookData): Promise<Book> {
  const res = await fetch(`${API_URL}/api/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookData),
  });
  if (!res.ok) {
    throw new Error("Failed to add book");
  }
  return res.json();
}

export async function deleteBook(token: string, bookId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/books/${bookId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to delete book");
  }
}

export async function verifyPasscode(passcode: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ passcode }),
  });
  if (!res.ok) {
    throw new Error("Invalid passcode");
  }
  const data = await res.json();
  return data.token;
}
