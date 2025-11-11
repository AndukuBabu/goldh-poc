import { Request, Response, NextFunction } from "express";
import { sessionManager } from "./auth";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.headers.authorization?.replace("Bearer ", "");
  
  if (!sessionId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const session = await sessionManager.getSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  (req as any).userId = session.userId;
  (req as any).sessionId = sessionId;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.headers.authorization?.replace("Bearer ", "");
  
  if (!sessionId) {
    return res.status(404).json({ error: "Not found" });
  }

  const session = await sessionManager.getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: "Not found" });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId));

  if (!user || !user.isAdmin) {
    return res.status(404).json({ error: "Not found" });
  }

  (req as any).userId = session.userId;
  (req as any).sessionId = sessionId;
  (req as any).user = user;
  next();
}
