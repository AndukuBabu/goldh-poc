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
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().transform(Number).default("5000"),
    SESSION_SECRET: z.string().default("goldh-development-secret-change-me"),

    // Database Secrets (PostgreSQL)
    DATABASE_URL: z.string({
        required_error: "DATABASE_URL is required for Postgres connection",
    }),

    // Firebase Secrets
    FIREBASE_PROJECT_ID: z.string().optional(),
    FIREBASE_CLIENT_EMAIL: z.string().optional(),
    FIREBASE_PRIVATE_KEY: z.string().optional().transform((val) => {
        if (!val) return val;
        // Handle literal \n and also strip potential double quotes if they were accidentally double-quoted
        const clean = val.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1');
        return clean;
    }),

    // Zoho CRM Secrets
    ZOHO_CLIENT_ID: z.string().optional(),
    ZOHO_CLIENT_SECRET: z.string().optional(),
    ZOHO_REFRESH_TOKEN: z.string().optional(),
    ZOHO_API_DOMAIN: z.string().default("https://www.zohoapis.com"),

    // API Keys
    COINGECKO_API_KEY: z.string().optional(),

    // Scheduler Parameters
    UMF_SCHEDULER: z.string().transform((val: string | undefined) => val === "1").default("0"),
    GURU_SCHEDULER: z.string().transform((val: string | undefined) => val === "1").default("0"),
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
        projectId: config.FIREBASE_PROJECT_ID,
        clientEmail: config.FIREBASE_CLIENT_EMAIL,
        privateKey: config.FIREBASE_PRIVATE_KEY,
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
