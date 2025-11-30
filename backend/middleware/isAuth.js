import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    // 1. Log all cookies received
    console.log("DEBUG AUTH: Received Cookies:", req.cookies); 
    
    const { token } = req.cookies;

    if (!token) {
      // 2. If 'token' is missing, log a detailed warning and the CORS header
      console.log("DEBUG AUTH FAILED: 'token' cookie is missing in request.");
      // Check if the Origin header is present in the request
      console.log("DEBUG AUTH: Request Origin Header:", req.headers.origin); 
      
      return res.status(401).json({ 
        message: "User not authenticated. (Cookie missing)",
        debug: `Origin: ${req.headers.origin}` // Return origin to the client for frontend debug
      });
    }

    // 3. If 'token' exists, try to verify it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DEBUG AUTH SUCCESS: Token decoded for userId:", decoded.userId);

    req.userId = decoded.userId; 
    next();
  } catch (error) {
    // 4. Log the specific verification error
    console.log("DEBUG AUTH ERROR: JWT Verification failed.", error.message);
    return res.status(401).json({ 
        message: "Invalid or expired token. (Verification Failed)",
        debug: error.message // Return the specific JWT error to the client
    });
  }
};

export default isAuth;