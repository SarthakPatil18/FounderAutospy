import "./loadEnv";
import { PrismaClient } from "@prisma/client";

// Global Prisma instance to prevent hot-reloading from creating multiple connections in dev
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export * from "@prisma/client";

