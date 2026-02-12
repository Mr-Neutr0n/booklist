# Booklist — Notes

## Status

Built. Needs deployment.

## Architecture

Same pattern as AI Journal:
- **Frontend:** Next.js (App Router) → Vercel
- **Backend:** FastAPI → Railway
- **DB:** Railway PostgreSQL
- **Book data:** Open Library API (free, no key)
- **Auth:** Passcode → JWT (public view, private edit)
- **Domain:** booklist.harikp.com (Vercel) + api.booklist.harikp.com (Railway)

## DB Schema

```sql
books (id uuid PK, title text, author text, cover_url text, ol_key text unique, added_at timestamp)
```

## Endpoints

- GET /api/books — public, list all
- POST /api/books — auth, add book
- DELETE /api/books/{id} — auth, remove book
- POST /api/verify — passcode → JWT

## Env Vars

**Backend:** DATABASE_URL, BOOKLIST_PASSCODE, JWT_SECRET, FRONTEND_URL
**Frontend:** NEXT_PUBLIC_API_URL

## To Do

1. [ ] Deploy backend to Railway
2. [ ] Create Railway Postgres instance
3. [ ] Deploy frontend to Vercel
4. [ ] Point booklist.harikp.com DNS to Vercel
5. [ ] Push to GitHub
