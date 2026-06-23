# Product Pagination Backend

A scalable backend system to browse ~200,000 products with **fast cursor-based pagination**, category filtering, and consistent results even when data changes.

Built as part of a backend engineering take-home assignment.

---

## 🚀 Live Demo

<!-- https://your-deployment-url.com -->

---

## 🧠 Problem Statement

Build a backend that allows:
- Browsing ~200,000 products
- Filtering by category
- Fast pagination
- Correct results even when data is updated during browsing
  - No duplicate records
  - No missing records
- Efficient performance at scale

---

## ⚙️ Tech Stack

- Node.js
- Express.js
- PostgreSQL (Neon Cloud DB)
- pg (node-postgres driver)
- dotenv

---

## 🏗️ Architecture


Client → Express API → PostgreSQL (Neon)


Key design principle:
> Keep pagination stateless and database-driven using cursor-based pagination.

---

## 🗄️ Database Schema

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
📊 Indexes (for performance)
CREATE INDEX idx_products_cursor
ON products (created_at DESC, id DESC);

CREATE INDEX idx_products_category
ON products (category);
```
⚡ Key Features
1. Cursor-Based Pagination (Core Feature)

Instead of OFFSET pagination, this project uses cursor-based pagination:

Prevents duplicates
Prevents missing records
Scales efficiently for large datasets
Sorting logic:
ORDER BY created_at DESC, id DESC
Cursor format:
{
  "created_at": "...",
  "id": "..."
}

2. Category Filtering

Supports filtering products by category:

GET /products?category=electronics

3. Fast Pagination

Efficient queries using indexed columns and limited result sets.

4. Large Dataset Support
200,000 products generated via batch seeding
Inserted in batches of 5,000 for performance
```
📡 API Endpoints
GET /products

Fetch paginated products.

Query Parameters:
Param	Type	Description
limit	number	Number of items per page (default: 20)
category	string	Filter by category
cursor	string	Pagination cursor (JSON string)
Example Request
GET /products?limit=20
Example Response
{
  "data": [
    {
      "id": "400000",
      "name": "Product 199999",
      "category": "books",
      "price": "7595",
      "created_at": "2026-06-23T00:12:28.278Z"
    }
  ],
  "nextCursor": "{\"created_at\":\"2026-06-23T00:12:28.278Z\",\"id\":\"399981\"}"
}
```
🔁 Pagination Flow
First request:
GET /products?limit=20
Next request:
GET /products?limit=20&cursor=...
```
🧪 How to Run Locally
1. Clone repository
git clone <repo-url>
cd product-pagination-backend

2. Install dependencies
npm install

3. Setup environment variables

Create .env file:

DATABASE_URL=your_neon_postgres_url
PORT=3000

4. Run server
npm run dev

🌱 Seed Database (200,000 products)
node scripts/seed.js
```
⚡ Why Cursor Pagination

Offset pagination was avoided because:

It becomes slow at large offsets
It can skip or duplicate data when new rows are inserted

Instead, cursor pagination ensures:

O(1) pagination performance
Stable ordering
Consistent results under live data changes
```
🧠 Key Learnings
Handling large datasets efficiently
Designing scalable pagination systems
PostgreSQL indexing for performance
Real-world backend architecture design
Batch insertion optimization
```
🚀 Future Improvements
Add authentication layer
Add Redis caching for hot queries
Add full-text search
Add rate limiting
Add Docker support