import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { hashPassword, verifyPassword } from "../auth";
import { requireAuth } from "../middleware";

const router = Router();

router.get("/me", requireAuth, async (req: Request, res: Response) => {
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
            isAdmin: user.isAdmin,
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ error: "Failed to get user" });
    }
});

router.post("/change-password", requireAuth, async (req: Request, res: Response) => {
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

export default router;
