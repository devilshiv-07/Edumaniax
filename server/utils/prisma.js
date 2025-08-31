import { PrismaClient } from "@prisma/client";

// Create a singleton Prisma client instance
let prisma;

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error", "warn"] : ["error", "warn"],
    
  });
};

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  // In development, use a global variable to preserve the instance
  // across hot reloads
  if (!globalThis.__prisma) {
    globalThis.__prisma = createPrismaClient();
  }
  prisma = globalThis.__prisma;
}

// Graceful shutdown with improved connection handling
process.on("beforeExit", async () => {
  console.log("Disconnecting Prisma on beforeExit");
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  console.log("Disconnecting Prisma on SIGINT");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Disconnecting Prisma on SIGTERM");
  await prisma.$disconnect();
  process.exit(0);
});

// Middleware to close only very long idle connections
export const prismaMiddleware = async (req, res, next) => {
  try {
    await next();
  } finally {
    // Only terminate extremely long idle connections (> 2 hours)
    // and do this very rarely to prioritize connection availability (0.1% of requests)
    if (Math.random() < 0.001) {
      try {
        await prisma.$queryRaw`SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
                              WHERE application_name = 'prisma' 
                              AND state = 'idle' 
                              AND (now() - state_change) > interval '2 hours'`;
      } catch (err) {
        // Silently handle any errors in this maintenance operation
        console.warn("Failed to terminate idle connections:", err.message);
      }
    }
  }
};

// Export both named and default exports for compatibility
export { prisma };
export default prisma;
