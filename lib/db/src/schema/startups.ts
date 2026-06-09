import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const startupsTable = pgTable("startups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  industry: text("industry").notNull(),
  foundedYear: integer("founded_year").notNull(),
  closedYear: integer("closed_year").notNull(),
  story: text("story").notNull(),
  whatFailed: text("what_failed").notNull(),
  lessonsLearned: text("lessons_learned").notNull(),
  peakMrr: integer("peak_mrr"),
  teamSize: integer("team_size"),
  totalRaised: integer("total_raised"),
  aiRootCause: text("ai_root_cause"),
  aiFactors: json("ai_factors").$type<string[]>(),
  aiTags: json("ai_tags").$type<string[]>(),
  aiVerdict: text("ai_verdict"),
  submittedBy: integer("submitted_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStartupSchema = createInsertSchema(startupsTable).omit({
  id: true,
  aiRootCause: true,
  aiFactors: true,
  aiTags: true,
  aiVerdict: true,
  submittedBy: true,
  createdAt: true,
});

export type InsertStartup = z.infer<typeof insertStartupSchema>;
export type Startup = typeof startupsTable.$inferSelect;
