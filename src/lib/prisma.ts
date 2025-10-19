import { PrismaClient } from "@prisma/client";

declare global {
  // avoid re-instantiating during hot reloads in development
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
