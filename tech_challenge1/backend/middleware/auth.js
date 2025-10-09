import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Validate JWT_SECRET exists
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET environment variable not set.");
  process.exit(1);
}

// Utility function to generate JWT token
export function generateToken(user) {
  // Include current timestamp in milliseconds to ensure uniqueness
  const currentTime = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      iat: currentTime, // Explicitly set issued at time
    },
    JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      issuer: "blog-api",
      subject: user.uuid,
    },
  );
}

// Middleware to authenticate and extract user data from JWT token
export async function authenticateUser(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied. No valid authorization header provided.",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user by UUID from token - use $eq for explicit security
    const user = await User.findOne({ uuid: { $eq: decoded.uuid } }).select(
      "-password",
    );

    if (!user) {
      return res.status(401).json({
        error: "Invalid token - user not found.",
      });
    }

    // Attach user to request object
    req.user = {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("Authentication error:", err.message);

    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token format." });
    }
    if (err.name === "NotBeforeError") {
      return res.status(401).json({ error: "Token not active yet." });
    }

    res.status(401).json({ error: "Authentication failed." });
  }
}

// Optional middleware to check specific roles
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
}
