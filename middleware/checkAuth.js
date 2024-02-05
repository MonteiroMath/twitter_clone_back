const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const notAuthenticatedError = new Error("Not authenticated");
notAuthenticatedError.status = 401;

function extractToken(header) {
  return req.get("Authorization").split(" ")[1];
}

function checkAuth(req, res, next) {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    next(notAuthenticatedError);
  }

  const jwtToken = extractToken(authHeader);
  let decodedToken;

  try {
    decodedToken = jwt.verify(jwtToken, JWT_SECRET);
  } catch (err) {
    err.status = 500;
    next(err);
  }

  if (!decodedToken) {
    next(notAuthenticatedError);
  }

  req.userId = decodedToken.userId;

  next();
}

module.exports = checkAuth;
