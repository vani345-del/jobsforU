import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    // Check for token in cookies first (browser)
    let token = req.cookies?.token;

    // If no cookie, check Authorization header (for mobile/alternative clients)
    if (!token) {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      // Instead of failing here, just skip attaching user
      req.userId = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('[isAuth] Error:', error.message);
    req.userId = null;
    next();
  }
};

export default isAuth;
