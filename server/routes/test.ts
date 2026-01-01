import { Router, Request, Response } from "express";
import { ZohoClient } from "../zoho/client";
import { integrationConfig } from "../config";

const router = Router();

router.get("/zoho", async (req: Request, res: Response) => {
    try {
        const zohoClient = new ZohoClient();

        if (!integrationConfig.zoho.clientId) {
            return res.json({
                configured: false,
                message: "Zoho CRM credentials not configured",
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

export default router;
