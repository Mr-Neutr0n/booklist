const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url?: string;
  ol_key?: string;
  added_at: string;
}

export interface BookCreate {
  title: string;
  author: string;
  cover_url?: string;
  ol_key?: string;
}

export async function getBooks(): Promise<Book[]> {
  const res = await fetch(`${API_URL}/api/books`);
  if (!res.ok) {
    throw new Error("Failed to fetch books");
  }
  return res.json();
}

export async function addBook(token: string, data: BookCreate): Promise<Book> {
  const res = await fetch(`${API_URL}/api/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to add book");
  }
  return res.json();
}

export async function deleteBook(
  token: string,
  bookId: string
): Promise<void> {
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
