const pool = require("../db");

const getProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "20");
    const category = req.query.category;
    const cursor = req.query.cursor;

    let values = [];
    let whereClauses = [];

    // 1. category filter
    if (category) {
      values.push(category);
      whereClauses.push(`category = $${values.length}`);
    }

    // 2. cursor pagination
    if (cursor) {
      const decoded = JSON.parse(cursor);

      values.push(decoded.created_at);
      const createdAtIndex = values.length;

      values.push(decoded.id);
      const idIndex = values.length;

      whereClauses.push(
        `(created_at, id) < ($${createdAtIndex}, $${idIndex})`
      );
    }

    // 3. base query
    let query = `
      SELECT *
      FROM products
    `;

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += `
      ORDER BY created_at DESC, id DESC
      LIMIT $${values.length + 1}
    `;

    values.push(limit + 1); // fetch extra to check next cursor

    const result = await pool.query(query, values);

    // 4. next cursor logic
    let nextCursor = null;

    if (result.rows.length > limit) {
      const last = result.rows[limit - 1];

      nextCursor = JSON.stringify({
        created_at: last.created_at,
        id: last.id,
      });

      result.rows.pop(); // remove extra row
    }

    res.json({
      data: result.rows,
      nextCursor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getProducts };