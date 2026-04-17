const { verifyToken } = require("../services/authService");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; 

  if (!token) {
    const err = new Error("Access token required");
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    next(err);
  }
}

// Optional authentication - sets userId if token valid, doesn't error if not
function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
    } catch {
      // Invalid token - just don't set userId
    }
  }

  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
};
