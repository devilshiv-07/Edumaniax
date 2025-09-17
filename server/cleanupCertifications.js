// cleanupCertifications.js
// This script can be run as a cron job to clean up expired certifications
// Example cron job: 0 2 * * * node cleanupCertifications.js (runs daily at 2 AM)

import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import prisma from "./utils/prisma.js";

async function cleanupExpiredCertifications() {
  console.log("🏆 Starting certification cleanup...");

  try {
    // Check connection status
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Database is accessible");

    const currentDate = new Date();
    console.log(`📅 Current date: ${currentDate.toISOString()}`);

    // Get count of expired certifications before deletion
    const expiredCount = await prisma.certification.count({
      where: {
        expiryDate: {
          lt: currentDate,
        },
      },
    });

    console.log(`🔍 Found ${expiredCount} expired certifications`);

    if (expiredCount > 0) {
      // Delete expired certifications
      const deletedCertifications = await prisma.certification.deleteMany({
        where: {
          expiryDate: {
            lt: currentDate,
          },
        },
      });

      console.log(
        `✅ Successfully deleted ${deletedCertifications.count} expired certifications`
      );

      // Log some details about what was deleted
      const deletedDetails = await prisma.certification.findMany({
        where: {
          expiryDate: {
            lt: currentDate,
          },
        },
        select: {
          id: true,
          userName: true,
          moduleName: true,
          userClass: true,
          earnedDate: true,
          expiryDate: true,
        },
        take: 5, // Show first 5 as examples
      });

      if (deletedDetails.length > 0) {
        console.log("📋 Sample of deleted certifications:");
        deletedDetails.forEach((cert) => {
          console.log(
            `  - ${cert.userName} (${cert.userClass}) - ${
              cert.moduleName
            } - Expired: ${cert.expiryDate.toISOString()}`
          );
        });
      }
    } else {
      console.log("✅ No expired certifications found");
    }

    // Get current active certifications count
    const activeCount = await prisma.certification.count({
      where: {
        expiryDate: {
          gt: currentDate,
        },
      },
    });

    console.log(`📊 Current active certifications: ${activeCount}`);
    console.log("✅ Certification cleanup completed successfully");
  } catch (error) {
    console.error("❌ Certification cleanup failed:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  }
}

// Run the cleanup
cleanupExpiredCertifications();
