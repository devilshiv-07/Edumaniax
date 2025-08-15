/**
 * Subscription Management Routes
 * 
 * Administrative routes for managing subscriptions, monitoring expiry,
 * and getting subscription analytics.
 */

import express from "express";
import { PrismaClient } from "@prisma/client";
import {
  getUserSubscriptionsWithStatus,
  getActiveUserSubscriptions,
  enrichSubscriptionData,
  markExpiredSubscriptions,
  getSubscriptionAnalytics,
  getSubscriptionsExpiringSoon,
  runManualSubscriptionCheck,
  calculateRemainingDays,
  calculateDaysSincePurchase,
  isSubscriptionExpired
} from "../utils/subscriptionManager.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get all subscriptions with expiry status
router.get("/all", async (req, res) => {
  try {
    const { status, planType, limit = 50, offset = 0 } = req.query;
    
    const whereClause = {};
    
    if (status) {
      if (status === 'EXPIRED') {
        whereClause.OR = [
          { status: 'EXPIRED' },
          {
            status: 'ACTIVE',
            endDate: { lt: new Date() }
          }
        ];
      } else if (status === 'ACTIVE') {
        whereClause.status = 'ACTIVE';
        whereClause.endDate = { gt: new Date() };
      } else {
        whereClause.status = status;
      }
    }
    
    if (planType) {
      whereClause.planType = planType;
    }
    
    const subscriptions = await prisma.subscription.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phonenumber: true,
            email: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    const enrichedSubscriptions = subscriptions.map(enrichSubscriptionData);
    
    const total = await prisma.subscription.count({ where: whereClause });
    
    res.json({
      success: true,
      subscriptions: enrichedSubscriptions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error("Error fetching all subscriptions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subscriptions",
      message: error.message
    });
  }
});

// Get subscriptions expiring soon
router.get("/expiring-soon", async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const expiringSoon = await getSubscriptionsExpiringSoon(parseInt(days));
    
    res.json({
      success: true,
      subscriptions: expiringSoon,
      count: expiringSoon.length,
      daysAhead: parseInt(days)
    });
    
  } catch (error) {
    console.error("Error fetching expiring subscriptions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch expiring subscriptions",
      message: error.message
    });
  }
});

// Get subscription analytics dashboard
router.get("/analytics", async (req, res) => {
  try {
    const analytics = await getSubscriptionAnalytics();
    
    // Get additional metrics
    const recentActivity = await prisma.subscription.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        user: {
          select: {
            name: true,
            phonenumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    const monthlyRevenue = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: {
        amount: true
      }
    });
    
    res.json({
      success: true,
      analytics: {
        ...analytics,
        recentActivity: recentActivity.map(enrichSubscriptionData),
        monthlyRevenue: monthlyRevenue._sum.amount || 0
      }
    });
    
  } catch (error) {
    console.error("Error fetching subscription analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics",
      message: error.message
    });
  }
});

// Manual subscription expiry check
router.post("/check-expired", async (req, res) => {
  try {
    const result = await runManualSubscriptionCheck();
    
    res.json({
      success: true,
      message: "Subscription expiry check completed",
      result
    });
    
  } catch (error) {
    console.error("Error running subscription check:", error);
    res.status(500).json({
      success: false,
      error: "Failed to run subscription check",
      message: error.message
    });
  }
});

// Get user subscription history
router.get("/user/:userId/history", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const subscriptions = await getUserSubscriptionsWithStatus(userId);
    
    // Add subscription timeline
    const timeline = subscriptions.map(sub => ({
      id: sub.id,
      planType: sub.planType,
      startDate: sub.startDate,
      endDate: sub.endDate,
      status: sub.status,
      isExpired: sub.isExpired,
      remainingDays: sub.remainingDays,
      daysSincePurchase: sub.daysSincePurchase,
      selectedModule: sub.selectedModule,
      amount: sub.amount
    })).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    res.json({
      success: true,
      userId,
      subscriptions,
      timeline,
      summary: {
        total: subscriptions.length,
        active: subscriptions.filter(sub => !sub.isExpired && sub.status === 'ACTIVE').length,
        expired: subscriptions.filter(sub => sub.isExpired || sub.status === 'EXPIRED').length,
        totalSpent: subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0)
      }
    });
    
  } catch (error) {
    console.error("Error fetching user subscription history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user subscription history",
      message: error.message
    });
  }
});

// Update subscription status (admin function)
router.patch("/:subscriptionId/status", async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { status, reason } = req.body;
    
    if (!['ACTIVE', 'EXPIRED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be ACTIVE, EXPIRED, or CANCELLED"
      });
    }
    
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status,
        updatedAt: new Date(),
        notes: reason ? `${reason} (Updated by admin)` : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phonenumber: true
          }
        }
      }
    });
    
    const enrichedSubscription = enrichSubscriptionData(updatedSubscription);
    
    console.log(`📝 Subscription ${subscriptionId} status updated to ${status} for user ${updatedSubscription.user.name}`);
    // If the subscription was explicitly CANCELLED and was a SOLO with a selected module,
    // remove the user's performance data for that module so progress isn't retained.
    try {
      if (status === 'CANCELLED' && updatedSubscription.planType === 'SOLO') {
        // notes may be JSON with { selectedModule }
        let selectedModule = null;
        if (updatedSubscription.notes) {
          try {
            const parsed = JSON.parse(updatedSubscription.notes);
            selectedModule = parsed.selectedModule || null;
          } catch (e) {
            selectedModule = updatedSubscription.notes;
          }
        }

        if (selectedModule) {
          const deletedModulePerf = await prisma.modulePerformance.deleteMany({
            where: {
              userId: updatedSubscription.userId,
              moduleName: selectedModule
            }
          });

          const deletedTopicPerf = await prisma.topicPerformance.deleteMany({
            where: {
              userId: updatedSubscription.userId,
              moduleName: selectedModule
            }
          });

          console.log(`🗑️ Removed performance data for user ${updatedSubscription.userId}, module='${selectedModule}' - module: ${deletedModulePerf.count}, topics: ${deletedTopicPerf.count}`);
        }
      }
    } catch (cleanupErr) {
      console.error('Error cleaning up performance data after subscription update:', cleanupErr);
    }
    
    res.json({
      success: true,
      message: "Subscription status updated successfully",
      subscription: enrichedSubscription
    });
    
  } catch (error) {
    console.error("Error updating subscription status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update subscription status",
      message: error.message
    });
  }
});

// Extend subscription (admin function)
router.patch("/:subscriptionId/extend", async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { days, reason } = req.body;
    
    if (!days || days <= 0) {
      return res.status(400).json({
        success: false,
        error: "Days must be a positive number"
      });
    }
    
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phonenumber: true
          }
        }
      }
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found"
      });
    }
    
    const newEndDate = new Date(subscription.endDate);
    newEndDate.setDate(newEndDate.getDate() + parseInt(days));
    
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        endDate: newEndDate,
        status: 'ACTIVE', // Reactivate if it was expired
        updatedAt: new Date(),
        notes: reason ? `Extended by ${days} days: ${reason}` : `Extended by ${days} days`
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phonenumber: true
          }
        }
      }
    });
    
    const enrichedSubscription = enrichSubscriptionData(updatedSubscription);
    
    console.log(`⏰ Subscription ${subscriptionId} extended by ${days} days for user ${updatedSubscription.user.name}`);
    
    res.json({
      success: true,
      message: `Subscription extended by ${days} days`,
      subscription: enrichedSubscription
    });
    
  } catch (error) {
    console.error("Error extending subscription:", error);
    res.status(500).json({
      success: false,
      error: "Failed to extend subscription",
      message: error.message
    });
  }
});

// Get subscription details with full information
router.get("/:subscriptionId", async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phonenumber: true,
            email: true,
            userClass: true,
            selectedModule: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found"
      });
    }
    
    const enrichedSubscription = enrichSubscriptionData(subscription);
    
    res.json({
      success: true,
      subscription: enrichedSubscription
    });
    
  } catch (error) {
    console.error("Error fetching subscription details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subscription details",
      message: error.message
    });
  }
});

export default router;
