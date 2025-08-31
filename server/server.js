
import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";



// force load .env from current folder
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

console.log("DEBUG DB URL:", process.env.DATABASE_URL); 

import { prisma, prismaMiddleware } from "./utils/prisma.js";
import userRoutes from "./routes/userRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import DMRoutes from "./routes/DMRoutes.js";
import communicationRoutes from "./routes/communicationRoutes.js";
import computersRoutes from "./routes/computersRoutes.js";
import entreprenerushipRoutes from "./routes/entreprenerushipRoutes.js";
import envirnomentRoutes from "./routes/envirnomentRoutes.js";
import lawRoutes from "./routes/lawRoutes.js";
import leadershipRoutes from "./routes/leadershipRoutes.js";
import SELRoutes from "./routes/SELRoutes.js";
import performanceRoutes from './routes/performanceRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import accessRoutes from './routes/accessRoutes.js';
import specialRoutes from './routes/specialRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import { initializeSubscriptionMonitoring } from './utils/subscriptionManager.js';



const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Add Prisma middleware to manage database connections
app.use(prismaMiddleware);

app.use("/", userRoutes);
app.use("/finance", financeRoutes);
app.use("/digital-marketing", DMRoutes);
app.use("/communication", communicationRoutes);
app.use("/computers", computersRoutes);
app.use("/entrepreneruship", entreprenerushipRoutes); 
app.use("/envirnoment", envirnomentRoutes);
app.use("/law", lawRoutes); 
app.use("/leadership", leadershipRoutes);
app.use("/sel", SELRoutes);
app.use("/performance", performanceRoutes);
app.use("/blogs", blogRoutes);
app.use("/payment", paymentRoutes);
app.use("/access", accessRoutes);
app.use("/special", specialRoutes); // Changed from /sales to /special
app.use("/sales", salesRoutes); // Added back /sales route
app.use("/subscriptions", subscriptionRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Basic connection test to DB
    const dbStatus = await prisma.$queryRaw`SELECT 1 as result`;
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      database: dbStatus && dbStatus.length > 0 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'error', 
      message: 'Server running but database connection failed',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "An internal server error occurred",
    message: process.env.NODE_ENV === "production" ? null : err.message
  });
});

// Create Express server and start listening
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize subscription monitoring after server starts
  try {
    initializeSubscriptionMonitoring();
    console.log('✅ Subscription monitoring initialized');
  } catch (error) {
    console.error('❌ Failed to initialize subscription monitoring:', error);
  }
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    // prisma.$disconnect is already handled in prisma.js
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Keep the process alive but log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the process alive but log the error
});
