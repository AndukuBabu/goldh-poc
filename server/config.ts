import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Server Configuration Schema
 * 
 * Defines and validates all environment variables used by the backend.
 * Organized into categories for clarity and better maintenance.
 */
const configSchema = z.object({
    // Server Configuration
    NODE_ENV: z.preprocess(
        (val) => process.env.NODE_ENV || (process.env.FUNCTIONS_EMULATOR === 'true' ? "development" : (process.env.FUNCTION_REGION || process.env.GCP_PROJECT ? "production" : val)),
        z.enum(["development", "production", "test"]).default("development")
    ),
    GH_PORT: z.preprocess((val) => process.env.PORT || val, z.string().transform(Number).default("5000")),
    SESSION_SECRET: z.string().default("goldh-development-secret-change-me"),

    // Database / Infrastructure (GH_CORE_)
    DATABASE_URL: z.preprocess(
        (val) => process.env.GH_CORE_DATABASE_URL || val,
        z.string({ required_error: "DATABASE_URL is required" })
    ),

    // Firebase Secrets (GH_FB_)
    FB_PROJECT_ID: z.preprocess(
        (val) => process.env.GH_FB_PROJECT_ID || process.env.FB_PROJECT_ID || val,
        z.string().optional()
    ),
    FB_CLIENT_EMAIL: z.preprocess(
        (val) => process.env.GH_FB_CLIENT_EMAIL || process.env.FB_CLIENT_EMAIL || val,
        z.string().optional()
    ),
    FB_PRIVATE_KEY: z.preprocess(
        (val) => process.env.GH_FB_PRIVATE_KEY || process.env.FB_PRIVATE_KEY || val,
        z.string().optional().transform((val) => {
            if (!val) return val;
            const clean = val.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1');
            return clean;
        })
    ),

    // Integrations / External (GH_EXT_)
    ZOHO_CLIENT_ID: z.preprocess((val) => process.env.GH_EXT_ZOHO_CLIENT_ID || val, z.string().optional()),
    ZOHO_CLIENT_SECRET: z.preprocess((val) => process.env.GH_EXT_ZOHO_CLIENT_SECRET || val, z.string().optional()),
    ZOHO_REFRESH_TOKEN: z.preprocess((val) => process.env.GH_EXT_ZOHO_REFRESH_TOKEN || val, z.string().optional()),
    ZOHO_API_DOMAIN: z.string().default("https://www.zohoapis.com"),

    // API Keys (GH_EXT_)
    COINGECKO_API_KEY: z.preprocess((val) => process.env.GH_EXT_COINGECKO_API_KEY || val, z.string().optional()),
    FINNHUB_API_KEY: z.preprocess((val) => process.env.GH_EXT_FINNHUB_API_KEY || val, z.string().optional()),
    HUGGINGFACE_API_KEY: z.preprocess((val) => process.env.GH_EXT_HUGGINGFACE_API_KEY || val, z.string().optional()),

    // Scheduler Parameters
    UMF_SCHEDULER: z.string().transform((val) => val === "1").default("0"),
    GURU_SCHEDULER: z.string().transform((val) => val === "1").default("0"),
    ADMIN_EMAILS: z.string().default(""),
});

// Parse and validate environment variables
const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 2));
    throw new Error("Invalid environment variables");
}

export const config = parsed.data;

/**
 * Database Config Group
 */
export const dbConfig = {
    url: config.DATABASE_URL,
    firebase: {
        projectId: config.FB_PROJECT_ID,
        clientEmail: config.FB_CLIENT_EMAIL,
        privateKey: config.FB_PRIVATE_KEY,
    }
};

/**
 * Integration Config Group
 */
export const integrationConfig = {
    zoho: {
        clientId: config.ZOHO_CLIENT_ID,
        clientSecret: config.ZOHO_CLIENT_SECRET,
        refreshToken: config.ZOHO_REFRESH_TOKEN,
        apiDomain: config.ZOHO_API_DOMAIN,
    },
    coingecko: {
        apiKey: config.COINGECKO_API_KEY,
    },
    finnhub: {
        apiKey: config.FINNHUB_API_KEY,
    },
    huggingface: {
        apiKey: config.HUGGINGFACE_API_KEY,
    }
};

/**
 * Scheduler Config Group
 */
export const schedulerConfig = {
    umfEnabled: config.UMF_SCHEDULER,
    guruEnabled: config.GURU_SCHEDULER,
    adminEmails: config.ADMIN_EMAILS.split(",").map((e: string) => e.trim().toLowerCase()).filter(Boolean),
};
