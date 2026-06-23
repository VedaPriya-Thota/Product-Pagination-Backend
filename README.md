# Product Pagination Backend

A scalable backend for browsing ~200,000 products using cursor-based pagination, category filtering, and consistent results even when the underlying data changes mid-browse.

Built as a backend engineering take-home assignment.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Problem Statement](#problem-statement)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Indexes](#indexes)
- [Key Features](#key-features)
- [API Reference](#api-reference)
- [Pagination Flow](#pagination-flow)
- [Running Locally](#running-locally)
- [Seeding the Database](#seeding-the-database)
- [Why Cursor Pagination](#why-cursor-pagination)
- [Key Learnings](#key-learnings)
- [Future Improvements](#future-improvements)

---

## Live Demo

[your-deployment-url.com](https://your-deployment-url.com) 

---

## Problem Statement

Design a backend that supports:

- Browsing a catalog of ~200,000 products
- Filtering by category
- Fast, scalable pagination
- Correct results even when records are inserted or updated during browsing — no duplicates, no missing records

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL (Neon Cloud) |
| DB Driver | `pg` (node-postgres) |
| Config | dotenv |

---

## Architecture

```
Client → Express API → PostgreSQL (Neon)
```

**Core design principle:** keep pagination stateless and database-driven using cursor-based pagination rather than offset-based pagination.

---

## Database Schema

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Indexes

```sql
CREATE INDEX idx_products_cursor
ON products (created_at DESC, id DESC);

CREATE INDEX idx_products_category
ON products (category);
```

These support the two most frequent query patterns: cursor-ordered scans and category filtering.

---

## Key Features

### Cursor-Based Pagination

Rather than `OFFSET`/`LIMIT`, this project paginates using a cursor built from `(created_at, id)`:

- No duplicate or skipped records as data changes mid-browse
- Consistent O(1) page-fetch performance regardless of page depth
- Scales cleanly to large datasets

**Sort order:**

```sql
ORDER BY created_at DESC, id DESC
```

**Cursor shape:**

```json
{
  "created_at": "2026-06-23T00:12:28.278Z",
  "id": "399981"
}
```

### Category Filtering

```
GET /products?category=electronics
```

### Large Dataset Support

- 200,000 products seeded for realistic load testing
- Batch-inserted in chunks of 5,000 rows
- Seeding script optimized to avoid memory and connection bottlenecks

---

## API Reference

### `GET /products`

Returns a paginated list of products.

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `limit` | number | No | Items per page (default: 20) |
| `category` | string | No | Filter by product category |
| `cursor` | string | No | Opaque pagination cursor from the previous response |

**Example Request**

```
GET /products?limit=20&category=books
```

**Example Response**

```json
{
  "data": [
    {
      "id": "400000",
      "name": "Product 400000",
      "category": "books",
      "price": "759.50",
      "created_at": "2026-06-23T00:12:28.278Z"
    }
  ],
  "nextCursor": "{\"created_at\":\"2026-06-23T00:12:28.278Z\",\"id\":\"399999\"}"
}
```

`nextCursor` is `null` when there are no further pages.

---

## Pagination Flow

**Step 1 — Initial request**

```
GET /products?limit=20
```

**Step 2 — Subsequent pages, using the cursor from the previous response**

```
GET /products?limit=20&cursor=%7B%22created_at%22%3A...%7D
```

---

## Running Locally

**1. Clone the repository**

```bash
git clone <repo-url>
cd product-pagination-backend
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the project root:

```env
DATABASE_URL=your_neon_postgres_url
PORT=3000
```

**4. Start the server**

```bash
npm run dev
```

---

## Seeding the Database

Populate the database with 200,000 sample products:

```bash
node scripts/seed.js
```

---

## Why Cursor Pagination

Offset-based pagination was avoided because it:

- Degrades in performance at large offsets (the database still scans and discards all skipped rows)
- Can return duplicate or missing records if rows are inserted/deleted while a user is paging through results

Cursor-based pagination instead provides:

- Stable, predictable ordering
- Consistent results even under concurrent writes
- Performance that doesn't degrade with page depth

---

## Key Learnings

- Designing pagination strategies that hold up under live data changes
- Indexing strategy for high-volume query patterns in PostgreSQL
- Efficient batch insertion for large seed datasets
- Structuring a backend service for clarity and scalability

---

## Future Improvements

- [ ] Authentication layer
- [ ] Redis caching for hot queries
- [ ] Full-text search on product name/category
- [ ] Rate limiting
- [ ] Docker support for one-command local setup

---
