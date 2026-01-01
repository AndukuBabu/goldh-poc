import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { hashPassword, verifyPassword, sessionManager } from "../auth";
import { serverSignUpSchema } from "@shared/schema";
import { z } from "zod";
import { schedulerConfig } from "../config";
import { createLeadFromUser } from "../zoho/leads";
import { requireAuth } from "../middleware";

const router = Router();

/**
 * Auto-Grant Admin Access
 */
async function checkAndGrantAdminAccess(user: any): Promise<any> {
    if (user.isAdmin) return user;

    const adminEmailList = schedulerConfig.adminEmails;
    const shouldBeAdmin = adminEmailList.includes(user.email.toLowerCase());

    if (shouldBeAdmin) {
        const updatedUser = await storage.updateUserAdminStatus(user.id, true);
        console.log(`[Admin] Granted admin access to ${user.email}`);
        return updatedUser || user;
    }

    return user;
}

router.post("/signup", async (req: Request, res: Response) => {
    try {
        const validatedData = serverSignUpSchema.parse(req.body);

        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const hashedPassword = await hashPassword(validatedData.password);
        let user = await storage.createUser({
            email: validatedData.email,
            password: hashedPassword,
            name: validatedData.name,
            phone: validatedData.phone,
            experienceLevel: validatedData.experienceLevel,
            agreeToUpdates: validatedData.agreeToUpdates,
        });

        user = await checkAndGrantAdminAccess(user);
        const session = await sessionManager.createSession(user.id);

        createLeadFromUser(user).catch(error => {
            console.error('[Signup] Failed to create Zoho lead:', error);
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                isPremium: user.isPremium,
                isAdmin: user.isAdmin,
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

router.post("/signin", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }

        let user = await storage.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        user = await checkAndGrantAdminAccess(user);
        const session = await sessionManager.createSession(user.id);

        res.json({
            user: {
                id: user.id,
                email: user.email,
                isPremium: user.isPremium,
                isAdmin: user.isAdmin,
            },
            sessionId: session.id,
        });
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ error: "Failed to sign in" });
    }
});

router.post("/signout", requireAuth, async (req: Request, res: Response) => {
    const sessionId = (req as any).sessionId;
    await sessionManager.deleteSession(sessionId);
    res.json({ message: "Signed out successfully" });
});

export default router;
