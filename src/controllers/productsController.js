const pool = require("../db");

const getProducts = async (req, res) => {
  try {
    const rawLimit = parseInt(req.query.limit, 10);
    const limit = Math.min(
      Math.max(!Number.isNaN(rawLimit) ? rawLimit : 20, 1),
      100
    );
    const category = req.query.category;

    let cursorData = null;
    if (req.query.cursor) {
      try {
        cursorData = JSON.parse(req.query.cursor);
      } catch (err) {
        return res.status(400).json({
          error: "Invalid cursor format",
        });
      }

      if (
        cursorData == null ||
        typeof cursorData.created_at === "undefined" ||
        typeof cursorData.id === "undefined"
      ) {
        return res.status(400).json({
          error: "Invalid cursor payload",
        });
      }
    }

    let values = [];
    let whereClauses = [];

    // 1. category filter
    if (category) {
      values.push(category);
      whereClauses.push(`category = $${values.length}`);
    }

    // 2. cursor pagination
    if (cursorData) {
      values.push(cursorData.created_at);
      const createdAtIndex = values.length;

      values.push(cursorData.id);
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

    const startTime = Date.now();
    const result = await pool.query(query, values);
    const queryTime = Date.now() - startTime;

    console.log(`Products query completed in ${queryTime} ms`);

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
      queryTimeMs: queryTime,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getProducts };