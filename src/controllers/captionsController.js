const { listCaptions } = require("../services/captionsService");

/**
 * Get captions with strict data separation:
 * - Guest (no token): Only see global/public data (user_id IS NULL)
 * - Logged in: Only see their own data (user_id = current_user_id)
 * - Never exposes data between users
 */
async function getCaptions(req, res) {
  const { limit, offset } = req.query ?? {};
  
  // Extract userId from JWT token (set by optionalAuth middleware)
  // null = guest mode, number/string = logged in user
  const userId = req.userId || null;
  
  const items = await listCaptions({ userId, limit, offset });
  
  // Return items + metadata untuk frontend conditional rendering
  res.json({ 
    items,
    meta: {
      isAuthenticated: Boolean(userId),
      isGuest: !userId,
      count: items.length
    }
  });
}

module.exports = {
  getCaptions,
};

