require("dotenv").config();
const pool = require("../src/db");

const categories = [
  "electronics",
  "fashion",
  "books",
  "home",
  "sports",
  "grocery",
  "toys",
];

function getRandomPrice() {
  return Math.floor(Math.random() * 10000) + 100;
}

async function seed() {
  const total = 200000;
  const batchSize = 5000;

  console.log("Starting seeding...");

  for (let i = 0; i < total; i += batchSize) {
    const values = [];
    const params = [];

    for (let j = 0; j < batchSize; j++) {
      const idx = i + j;

      values.push(
        `($${params.length + 1}, $${params.length + 2}, $${params.length + 3})`
      );

      params.push(
        `Product ${idx}`,
        categories[idx % categories.length],
        getRandomPrice()
      );
    }

    const query = `
      INSERT INTO products (name, category, price)
      VALUES ${values.join(",")}
    `;

    await pool.query(query, params);

    console.log(`Inserted: ${i + batchSize}`);
  }

  console.log("Seeding complete 🚀");
  process.exit();
}

seed();