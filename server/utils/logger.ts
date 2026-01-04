/**
 * Shared Logger Utility
 * 
 * Provides consistent log formatting across the backend.
 * Isolated from server/vite.ts to avoid production dependencies on Vite.
 */

export function log(message: string, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    console.log(`${formattedTime} [${source}] ${message}`);
}
