import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  experienceLevel: text("experience_level"),
  agreeToUpdates: boolean("agree_to_updates").default(false),
  walletAddress: text("wallet_address"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Full insert schema for creating users with all fields
const fullInsertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Basic insert schema for simple auth (just email and password)
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

// Client-side sign up schema with validation (includes confirmPassword)
export const signUpSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  experienceLevel: z.string().optional(),
  agreeToUpdates: z.boolean().optional().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Server-side sign up schema (omits confirmPassword for database insertion)
export const serverSignUpSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  experienceLevel: z.string().optional(),
  agreeToUpdates: z.boolean().optional().default(false),
});

export type InsertUser = z.infer<typeof fullInsertUserSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  question: string;
  answer: string;
  relatedTopics: string[];
}
