import type { Express } from "express";
import { createServer, type Server } from "http";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import umfRouter from "./routes/umf";
import newsRouter from "./routes/news";
import econRouter from "./routes/econ";
import assetRouter from "./routes/asset";
import adminRouter from "./routes/admin";
import testRouter from "./routes/test";
import { storage } from "./storage";

/**
 * Register all application routes
 * 
 * Modularizes the backend API by delegating to feature-specific routers.
 * Each feature is organized under a clear path (e.g., /api/auth, /api/user).
 * 
 * @param app - Express application instance
 * @returns Node.js HTTP Server instance
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Global API routes
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/umf", umfRouter);
  app.use("/api/news", newsRouter);
  app.use("/api/econ", econRouter);
  app.use("/api/asset", assetRouter);
  app.use("/api/admin", adminRouter);

  // Development/Test routes
  app.use("/api/test", testRouter);

  // Legacy/Compatibility routes (optional)
  app.get("/api/news-legacy", async (_req, res) => {
    const articles = await storage.getNewsArticles();
    res.json(articles);
  });

  app.get("/api/learning/topics", async (_req, res) => {
    const topics = await storage.getLearningTopics();
    res.json(topics);
  });

  // Create the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
