import { Request, Response, NextFunction } from "express";
import { sessionManager } from "./auth";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.headers.authorization?.replace("Bearer ", "");
  
  if (!sessionId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const session = sessionManager.getSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  (req as any).userId = session.userId;
  (req as any).sessionId = sessionId;
  next();
}
