require("dotenv").config();

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Missing DATABASE_URL environment variable. Ensure .env contains DATABASE_URL and that dotenv is loading it."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("Connected to Neon DB 🚀");
});

module.exports = pool;
