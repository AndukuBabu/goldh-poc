import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, verifyPassword, sessionManager } from "./auth";
import { requireAuth } from "./middleware";
import { insertUserSchema, serverSignUpSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const validatedData = serverSignUpSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({ 
        email: validatedData.email, 
        password: hashedPassword,
        name: validatedData.name,
        phone: validatedData.phone,
        experienceLevel: validatedData.experienceLevel,
        agreeToUpdates: validatedData.agreeToUpdates,
      });
      
      const session = await sessionManager.createSession(user.id);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          isPremium: user.isPremium,
          walletAddress: user.walletAddress,
        },
        sessionId: session.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const session = await sessionManager.createSession(user.id);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          isPremium: user.isPremium,
          walletAddress: user.walletAddress,
        },
        sessionId: session.id,
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ error: "Failed to sign in" });
    }
  });

  app.post("/api/auth/magic-link", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      
      if (existingUser) {
        console.log(`Magic link would be sent to existing user: ${email}`);
        res.json({ 
          isExistingUser: true,
          message: "Check your email for the sign-in link." 
        });
      } else {
        console.log(`No account found for: ${email}. Please sign up with password first.`);
        res.json({ 
          isExistingUser: false,
          message: "No account found with this email. Please sign up with a password first." 
        });
      }
    } catch (error) {
      console.error("Magic link error:", error);
      res.status(500).json({ error: "Failed to send magic link" });
    }
  });

  app.post("/api/auth/signout", requireAuth, async (req: Request, res: Response) => {
    const sessionId = (req as any).sessionId;
    await sessionManager.deleteSession(sessionId);
    res.json({ message: "Signed out successfully" });
  });

  // User routes
  app.get("/api/user/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        isPremium: user.isPremium,
        walletAddress: user.walletAddress,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Wallet routes
  app.post("/api/wallet/connect", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { walletAddress, tokenBalance } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address required" });
      }

      const isPremium = tokenBalance >= 5000;
      
      const user = await storage.updateUserWallet(userId, walletAddress, isPremium);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        walletAddress: user.walletAddress,
        isPremium: user.isPremium,
      });
    } catch (error) {
      console.error("Wallet connect error:", error);
      res.status(500).json({ error: "Failed to connect wallet" });
    }
  });

  app.get("/api/wallet/balance/:address", async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      
      const mockBalance = Math.floor(Math.random() * 10000);
      
      res.json({
        address,
        balance: mockBalance,
        isPremium: mockBalance >= 5000,
      });
    } catch (error) {
      console.error("Get balance error:", error);
      res.status(500).json({ error: "Failed to get balance" });
    }
  });

  // News routes
  app.get("/api/news", async (req: Request, res: Response) => {
    try {
      const articles = await storage.getNewsArticles();
      res.json(articles);
    } catch (error) {
      console.error("Get news error:", error);
      res.status(500).json({ error: "Failed to get news" });
    }
  });

  // Learning routes
  app.get("/api/learning/topics", async (req: Request, res: Response) => {
    try {
      const topics = await storage.getLearningTopics();
      res.json(topics);
    } catch (error) {
      console.error("Get topics error:", error);
      res.status(500).json({ error: "Failed to get topics" });
    }
  });

  // ============================================================================
  // ECONOMIC CALENDAR ROUTES (Phase 2 - NOT IMPLEMENTED YET)
  // ============================================================================
  // 
  // TODO (Phase 2): Implement Economic Calendar API endpoints
  // 
  // When ready to migrate from Firestore to backend API:
  // 1. Uncomment these routes
  // 2. Create EconEvent table in database (schema exists in shared/schema.ts)
  // 3. Implement data sync service (Trading Economics, Alpha Vantage, etc.)
  // 4. Update client/src/hooks/useEcon.ts to use fetchEconEvents() from lib/econ.client.ts
  // 5. Remove Firestore dependency and mock data
  // 
  // API Specification: See server/openapi/econ.draft.yaml
  // Migration Guide: See docs/EC-UI-MVP.md
  // ============================================================================

  /*
  // GET /api/econ/events - Fetch economic events with filters
  // 
  // Query Parameters:
  // - from: ISO date string (default: today 00:00 UTC)
  // - to: ISO date string (default: today + 14 days 23:59 UTC)
  // - country: Comma-separated country codes (e.g., 'US,EU,UK')
  // - category: Comma-separated categories (e.g., 'Inflation,Employment')
  // - importance: Comma-separated importance levels (e.g., 'High,Medium')
  // - status: Filter by status ('upcoming' or 'released')
  // 
  // Response: { events: EconEvent[], count: number, filters: object }
  // 
  app.get("/api/econ/events", async (req: Request, res: Response) => {
    try {
      // TODO: Parse query parameters
      const { from, to, country, category, importance, status } = req.query;
      
      // TODO: Validate inputs with Zod schema
      // const filters = econEventFiltersSchema.parse({
      //   from: from || new Date().toISOString(),
      //   to: to || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      //   country: country ? (country as string).split(',') : undefined,
      //   category: category ? (category as string).split(',') : undefined,
      //   importance: importance ? (importance as string).split(',') : undefined,
      //   status: status as 'upcoming' | 'released' | undefined,
      // });
      
      // TODO: Fetch from database with filters
      // const events = await storage.getEconEvents(filters);
      
      // TODO: Return events with metadata
      // res.json({
      //   events,
      //   count: events.length,
      //   filters: filters,
      //   timestamp: new Date().toISOString(),
      // });
      
      res.status(501).json({ error: "Not implemented yet - using Firestore in MVP phase" });
    } catch (error) {
      console.error("Get econ events error:", error);
      res.status(500).json({ error: "Failed to get economic events" });
    }
  });
  */

  /*
  // GET /api/econ/health - API health check
  // 
  // Returns API status, data source info, and last sync timestamp
  // Useful for monitoring and dashboard displays
  // 
  // Response: { status, timestamp, dataSource, uptime, version }
  // 
  app.get("/api/econ/health", async (req: Request, res: Response) => {
    try {
      // TODO: Check database connection
      // const dbHealthy = await storage.checkConnection();
      
      // TODO: Get last sync timestamp from metadata table
      // const lastSync = await storage.getLastEconSync();
      
      // TODO: Count total events in database
      // const eventCount = await storage.countEconEvents();
      
      // TODO: Return health status
      // res.json({
      //   status: dbHealthy ? 'healthy' : 'degraded',
      //   timestamp: new Date().toISOString(),
      //   dataSource: {
      //     provider: process.env.ECON_API_PROVIDER || 'Trading Economics',
      //     lastSync: lastSync,
      //     eventCount: eventCount,
      //   },
      //   uptime: process.uptime(),
      //   version: '2.0.0',
      // });
      
      res.status(501).json({ error: "Not implemented yet - no backend API in MVP phase" });
    } catch (error) {
      console.error("Econ health check error:", error);
      res.status(500).json({ error: "Health check failed" });
    }
  });
  */

  const httpServer = createServer(app);

  return httpServer;
}
