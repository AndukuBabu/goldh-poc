import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, verifyPassword, sessionManager } from "./auth";
import { requireAuth } from "./middleware";
import { insertUserSchema, serverSignUpSchema } from "@shared/schema";
import { z } from "zod";
import { getFresh, setFresh } from "./umf/lib/cache";
import { readLiveSnapshot } from "./umf/lib/firestoreUmf";
import type { UmfSnapshotLive, UmfAssetLive, AssetOverview } from "@shared/schema";
import { assetOverviewSchema } from "@shared/schema";
import { updateGuruDigest } from "./guru/updater";
import { getGuruDigestByAsset, getAllGuruDigest } from "./guru/lib/firestore";
import { CANONICAL_SYMBOLS, ASSET_DISPLAY_NAMES, ASSET_CLASSES } from "@shared/constants";
import { createLeadFromUser } from "./zoho/leads";


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
      
      // Send user data to Zoho CRM asynchronously (non-blocking)
      createLeadFromUser(user).catch(error => {
        console.error('[Signup] Failed to create Zoho lead (non-critical):', error);
      });
      
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

  // Zoho CRM Test Endpoint (development only)
  app.get("/api/test/zoho", async (req: Request, res: Response) => {
    try {
      const { zohoClient } = await import("./zoho/client");
      
      if (!zohoClient.isConfigured()) {
        return res.json({
          configured: false,
          message: "Zoho CRM credentials not configured",
          credentials: {
            hasClientId: !!process.env.ZOHO_CLIENT_ID,
            hasClientSecret: !!process.env.ZOHO_CLIENT_SECRET,
            hasRefreshToken: !!process.env.ZOHO_REFRESH_TOKEN,
            hasApiDomain: !!process.env.ZOHO_API_DOMAIN,
          }
        });
      }

      console.log('[Zoho Test] Testing access token...');
      const accessToken = await zohoClient.getAccessToken();
      
      console.log('[Zoho Test] Testing API request...');
      const response = await zohoClient.makeRequest('GET', '/crm/v2/settings/modules');
      
      res.json({
        configured: true,
        authenticated: true,
        message: "Zoho CRM connection successful",
        hasAccessToken: !!accessToken,
        apiResponse: response
      });
    } catch (error: any) {
      console.error('[Zoho Test] Error:', error);
      res.status(500).json({
        configured: true,
        authenticated: false,
        error: error.message,
        details: error.response?.data || null
      });
    }
  });

  app.post("/api/user/change-password", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new passwords required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isValidPassword = await verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(userId, hashedPassword);
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Failed to change password" });
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

  // ============================================================================
  // UMF (Universal Market Financials) API Routes - FUTURE IMPLEMENTATION
  // ============================================================================
  // TODO: Implement these endpoints to replace Firestore queries
  // See: server/openapi/umf.draft.yaml for API specification
  // See: client/src/lib/umf.client.ts for client functions
  
  /**
   * GET /api/umf/snapshot
   * 
   * Returns current market snapshot with all tracked assets.
   * NEVER calls CoinGecko - serves from cache/Firestore only.
   * 
   * Data Sources (in priority order):
   * 1. In-memory cache (fastest, < 5ms)
   * 2. Firestore live collection (~100ms)
   * 3. Empty fallback (degraded mode)
   * 
   * Response Headers:
   * - x-umf-source: 'cache' | 'firestore' | 'empty'
   * 
   * Response: UmfSnapshotLive
   * - degraded: false if from cache, true if from Firestore/empty
   */
  app.get("/api/umf/snapshot", async (req: Request, res: Response) => {
    try {
      // Step 1: Try in-memory cache first (fastest)
      const cached = getFresh<UmfSnapshotLive>('umf:snapshot');
      
      if (cached) {
        // Cache hit - return fresh data
        res.setHeader('x-umf-source', 'cache');
        return res.json(cached);
      }
      
      // Step 2: Cache miss - try Firestore
      const firestore = await readLiveSnapshot();
      
      if (firestore) {
        // Firestore hit - mark as degraded
        res.setHeader('x-umf-source', 'firestore');
        return res.json({
          ...firestore,
          degraded: true, // From Firestore = degraded (not fresh from scheduler)
        });
      }
      
      // Step 3: No data available - return empty fallback
      res.setHeader('x-umf-source', 'empty');
      return res.json({
        timestamp_utc: new Date().toISOString(),
        assets: [],
        degraded: true,
      });
    } catch (error) {
      console.error("UMF snapshot error:", error);
      res.status(500).json({ error: "Failed to fetch market snapshot" });
    }
  });

  /**
   * GET /api/umf/movers
   * 
   * Returns top market movers (gainers and losers).
   * NEVER calls CoinGecko - serves from cache/Firestore only.
   * 
   * Data Sources (in priority order):
   * 1. In-memory cache (fastest)
   * 2. Firestore live collection
   * 3. Empty fallback (degraded mode)
   * 
   * Logic:
   * - Derive top 5 gainers (highest positive changePct24h)
   * - Derive top 5 losers (lowest negative changePct24h)
   * - Ignore assets with null changePct24h
   * 
   * Response Headers:
   * - x-umf-source: 'cache' | 'firestore' | 'empty'
   * 
   * Response: { gainers: UmfAssetLive[], losers: UmfAssetLive[], degraded: boolean }
   */
  app.get("/api/umf/movers", async (req: Request, res: Response) => {
    try {
      let snapshot: UmfSnapshotLive | null = null;
      let source: 'cache' | 'firestore' | 'empty' = 'empty';
      let degraded = true;
      
      // Step 1: Try in-memory cache first
      const cached = getFresh<UmfSnapshotLive>('umf:snapshot');
      
      if (cached) {
        snapshot = cached;
        source = 'cache';
        degraded = false; // Cache = fresh data
      } else {
        // Step 2: Cache miss - try Firestore
        const firestore = await readLiveSnapshot();
        
        if (firestore) {
          snapshot = firestore;
          source = 'firestore';
          degraded = true; // Firestore = degraded (not fresh from scheduler)
        }
      }
      
      // Step 3: Derive movers from snapshot
      let gainers: UmfAssetLive[] = [];
      let losers: UmfAssetLive[] = [];
      
      if (snapshot && snapshot.assets.length > 0) {
        // Filter out assets with null changePct24h
        const assetsWithChange = snapshot.assets.filter(
          (asset) => asset.changePct24h !== null
        );
        
        // Sort by changePct24h descending (highest first)
        const sorted = [...assetsWithChange].sort(
          (a, b) => (b.changePct24h || 0) - (a.changePct24h || 0)
        );
        
        // Top 5 gainers (highest positive changes)
        gainers = sorted.slice(0, 5);
        
        // Top 5 losers (lowest negative changes)
        losers = sorted.slice(-5).reverse();
      }
      
      // Set response header
      res.setHeader('x-umf-source', source);
      
      // Return movers
      return res.json({
        gainers,
        losers,
        degraded,
      });
    } catch (error) {
      console.error("UMF movers error:", error);
      res.status(500).json({ error: "Failed to fetch market movers" });
    }
  });

  /**
   * GET /api/umf/brief
   * 
   * Returns daily morning intelligence brief
   * Query params: ?date=YYYY-MM-DD (optional, defaults to today)
   * Response: UmfBrief
   * 
   * Implementation notes:
   * - Generate or fetch AI-generated market summary
   * - Include headline and 3-5 key bullet points
   * - Focus on "why markets moved" narrative
   * - Cache results for 5 minutes (briefs don't change frequently)
   */
  // app.get("/api/umf/brief", async (req: Request, res: Response) => {
  //   try {
  //     // const date = req.query.date as string || new Date().toISOString().split('T')[0];
  //     // TODO: Generate or fetch from AI service
  //     // TODO: Return brief with proper date
  //     res.status(501).json({ error: "Not implemented yet" });
  //   } catch (error) {
  //     console.error("UMF brief error:", error);
  //     res.status(500).json({ error: "Failed to fetch market brief" });
  //   }
  // });

  /**
   * GET /api/umf/alerts
   * 
   * Returns active market alerts
   * Query params: 
   *   ?severity=info,warn,high (optional filter)
   *   ?active=true (optional, defaults to true)
   * Response: UmfAlert[]
   * 
   * Implementation notes:
   * - Fetch from alerts database or monitoring service
   * - Filter by severity level if requested
   * - Return only active alerts by default
   * - Include timestamp and severity-based styling hints
   */
  // app.get("/api/umf/alerts", async (req: Request, res: Response) => {
  //   try {
  //     // const severityFilter = req.query.severity ? String(req.query.severity).split(',') : undefined;
  //     // const activeOnly = req.query.active !== 'false';
  //     // TODO: Fetch from alerts database
  //     // TODO: Filter by severity and active status
  //     // TODO: Return sorted by timestamp (newest first)
  //     res.status(501).json({ error: "Not implemented yet" });
  //   } catch (error) {
  //     console.error("UMF alerts error:", error);
  //     res.status(500).json({ error: "Failed to fetch market alerts" });
  //   }
  // });

  /**
   * GET /api/asset/:symbol
   * 
   * Asset Overview Aggregation Endpoint
   * 
   * Aggregates data from multiple sources for a single asset:
   * - UMF: Price, 24h change, volume, market cap
   * - Guru Digest: Related news articles
   * - Economic Calendar: Relevant upcoming events (mock for MVP)
   * 
   * Response: AssetOverview (validated against schema)
   * Cache: 90 seconds TTL per symbol
   * 
   * Features:
   * - Validates symbol against CANONICAL_SYMBOLS
   * - Graceful degradation: returns partial data if sources fail
   * - Degraded flags indicate stale/unavailable data per source
   * - Schema validation before response
   */
  app.get("/api/asset/:symbol", async (req: Request, res: Response) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      
      // Validate symbol
      if (!CANONICAL_SYMBOLS.includes(symbol as any)) {
        return res.status(404).json({ error: `Asset not found: ${symbol}` });
      }
      
      // Check cache first
      const cacheKey = `asset:overview:${symbol}`;
      const cached = getFresh<AssetOverview>(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }
      
      // Aggregate data from sources
      console.log(`[Asset API] Aggregating data for ${symbol}...`);
      
      // 1. UMF Price Data
      let priceSummary: AssetOverview['priceSummary'] = null;
      let priceDegraded = true;
      
      try {
        // Try cache first, then Firestore
        const snapshot = getFresh<UmfSnapshotLive>('umf:snapshot') || await readLiveSnapshot();
        
        if (snapshot) {
          const asset = snapshot.assets.find(a => a.symbol === symbol);
          
          if (asset) {
            priceSummary = {
              price: asset.price,
              changePct24h: asset.changePct24h ?? 0,
              volume24h: asset.volume24h ?? null,
              marketCap: asset.marketCap ?? null,
              updatedAt_utc: snapshot.timestamp_utc,
            };
            priceDegraded = snapshot.degraded || false;
          } else {
            // Asset not found in snapshot - provide fallback to prevent null
            console.warn(`[Asset API] ${symbol} not found in UMF snapshot`);
          }
        } else {
          console.warn(`[Asset API] No UMF snapshot available`);
        }
      } catch (error) {
        console.error(`[Asset API] UMF data error for ${symbol}:`, error);
      }
      
      // 2. Guru Digest News
      let news: AssetOverview['news'] = [];
      let newsDegraded = false;
      
      try {
        const guruEntries = await getGuruDigestByAsset(symbol);
        
        news = guruEntries.map(entry => ({
          title: entry.title,
          summary: entry.summary,
          link: entry.link,
          date: entry.date,
        }));
        
        // Only mark degraded on query failure (not on legitimately empty results)
        newsDegraded = false;
      } catch (error) {
        console.error(`[Asset API] Guru Digest error for ${symbol}:`, error);
        newsDegraded = true;
      }
      
      // 3. Economic Calendar Events (Mock for MVP)
      let events: AssetOverview['events'] = [];
      const eventsDegraded = true; // Always degraded for MVP (mock data)
      
      // TODO: Implement real event filtering when Economic Calendar is connected
      // For MVP, return empty array with degraded flag
      
      // Build AssetOverview response
      const overview: AssetOverview = {
        symbol,
        name: ASSET_DISPLAY_NAMES[symbol] || symbol,
        class: ASSET_CLASSES[symbol] || 'crypto',
        image: null, // TODO: Add asset logos in future
        priceSummary,
        news,
        events,
        degraded: {
          price: priceDegraded,
          news: newsDegraded,
          events: eventsDegraded,
        },
      };
      
      // Validate against schema
      const validated = assetOverviewSchema.parse(overview);
      
      // Cache for 90 seconds
      setFresh(cacheKey, validated, 90);
      
      res.json(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("[Asset API] Schema validation error:", error.errors);
        return res.status(500).json({ error: "Invalid response format", details: error.errors });
      }
      console.error("[Asset API] Unexpected error:", error);
      res.status(500).json({ error: "Failed to fetch asset overview" });
    }
  });

  // Guru & Insider Digest Routes
  app.get("/api/guru-digest", async (req: Request, res: Response) => {
    try {
      const entries = await getAllGuruDigest(50);
      
      const articles = entries.map((entry, index) => ({
        id: `guru-${index}`,
        title: entry.title,
        publishedAt: entry.date,
        source: entry.assets.length > 0 ? entry.assets.join(', ') : 'Crypto News',
        url: entry.link,
        summary: entry.summary,
      }));
      
      res.status(200).json(articles);
    } catch (error) {
      console.error("Guru Digest fetch error:", error);
      res.status(500).json({ error: "Failed to fetch Guru Digest" });
    }
  });

  app.post("/api/update-guru-digest", async (req: Request, res: Response) => {
    try {
      const result = await updateGuruDigest({
        clearFirst: req.body?.clearFirst || false,
        logPrefix: '[API]',
      });
      res.status(200).json({ 
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Guru Digest update error:", error);
      res.status(500).json({ error: "Failed to update Guru Digest" });
    }
  });

  
  const httpServer = createServer(app);

  return httpServer;
}
