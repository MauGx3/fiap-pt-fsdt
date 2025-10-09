import express, { json } from "express";
import postsRoutes from "../routes/posts.js";
import usersRoutes from "../routes/users.js";
import authRoutes from "../routes/auth.js";
import { generalRateLimit } from "../middleware/rateLimit.js";

export function createTestApp() {
  const app = express();

  // Middleware
  app.use(generalRateLimit); // Apply rate limiting to all routes
  app.use(json({ limit: "10mb" }));

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postsRoutes);
  app.use("/api/users", usersRoutes);

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use("*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  // Global error handler
  app.use((err, req, res, _next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
  });

  return app;
}
