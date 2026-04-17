const { query } = require("./db");

async function insertCaption({ userId, context, result }) {
  const { rows } = await query(
    `INSERT INTO captions (user_id, context, result)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, context, result, created_at`,
    [userId || null, context, result]
  );
  return rows[0];
}

async function listCaptions({ userId, limit = 20, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  // PRODUCTION RULE: Strict data separation
  // Guest (no token) → Only see global/public data (user_id IS NULL)
  // Logged in → Only see their own data (user_id = current_user_id)
  // NEVER show all data without filter
  let queryText;
  let params;

  if (userId) {
    // User logged in → Only their data
    queryText = `SELECT id, context, result, created_at
     FROM captions
     WHERE user_id = $1
     ORDER BY created_at DESC, id DESC
     LIMIT $2 OFFSET $3`;
    params = [userId, safeLimit, safeOffset];
  } else {
    // Guest mode → Only global/public data (user_id IS NULL)
    queryText = `SELECT id, context, result, created_at
     FROM captions
     WHERE user_id IS NULL
     ORDER BY created_at DESC, id DESC
     LIMIT $1 OFFSET $2`;
    params = [safeLimit, safeOffset];
  }

  const { rows } = await query(queryText, params);

  return rows;
}

module.exports = {
  insertCaption,
  listCaptions,
};

