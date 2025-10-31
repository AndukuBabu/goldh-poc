import { compare, hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { db } from "./db";
import { sessions, type Session } from "@shared/schema";
import { eq, lt } from "drizzle-orm";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function generateSessionId(): string {
  return randomUUID();
}

export class SessionManager {
  async createSession(userId: string): Promise<Session> {
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const [session] = await db
      .insert(sessions)
      .values({
        id: sessionId,
        userId,
        expiresAt,
      })
      .returning();
    
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId));
    
    if (!session) return undefined;
    
    if (session.expiresAt < new Date()) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
      return undefined;
    }
    
    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async cleanupExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  }
}

export const sessionManager = new SessionManager();
