import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
import authenticateUser from "../middlewares/authMiddleware.js";
import { 
  getUserSubscriptionsWithStatus, 
  getActiveUserSubscriptions,
  enrichSubscriptionData,
  markExpiredSubscriptions,
  getSubscriptionAnalytics,
  runManualSubscriptionCheck
} from "../utils/subscriptionManager.js";
import { subscriptionCheckMiddleware } from "../middlewares/subscriptionMiddleware.js";

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();

// Feature flag check middleware
const checkPaymentFeature = (req, res, next) => {
  if (process.env.PAYMENT_ENABLED !== 'true') {
    return res.status(503).json({
      error: 'Payment feature is currently disabled',
      message: 'Payment functionality is not available at the moment'
    });
  }
  next();
};

// Initialize Razorpay only if feature is enabled
let razorpay = null;
if (process.env.PAYMENT_ENABLED === 'true') {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });
}

// Plan configurations - amounts in rupees
const PLANS = {
  STARTER: { amount: 0, duration: 7, name: "Starter Plan" }, // Free trial
  SOLO: { amount: 199, duration: 30, name: "Solo Plan" }, // ₹199 for 1 month
  PRO: { amount: 1433, duration: 90, name: "Pro Plan" }, // ₹1433 for 3 months
  INSTITUTIONAL: { amount: 0, duration: 0, name: "Institutional Plan" } // Custom pricing
};

// Calculate upgrade pricing for PRO plans
const calculateUpgradePrice = async (userId, targetPlan = 'PRO') => {
  if (targetPlan !== 'PRO') {
    return { amount: PLANS[targetPlan].amount, discount: 0, soloCount: 0 };
  }

  // Get user's active SOLO subscriptions
  const activeSoloSubscriptions = await prisma.subscription.findMany({
    where: {
      userId: userId,
      planType: 'SOLO',
      status: 'ACTIVE',
      endDate: {
        gt: new Date()
      }
    }
  });

  const soloCount = activeSoloSubscriptions.length;
  const soloDiscount = soloCount * PLANS.SOLO.amount;
  const finalAmount = Math.max(0, PLANS.PRO.amount - soloDiscount);

  return {
    amount: finalAmount,
    originalAmount: PLANS.PRO.amount,
    discount: soloDiscount,
    soloCount: soloCount,
    savings: soloDiscount > 0 ? `You save ₹${soloDiscount} from your ${soloCount} SOLO plan${soloCount > 1 ? 's' : ''}!` : null
  };
};

// Test endpoint to check users (for debugging)
router.get("/test-users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phonenumber: true
      },
      take: 30
    });
    res.json({ users, count: users.length });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Debug endpoint to check recent payments
router.get("/test-payments", async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: { name: true, phonenumber: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    res.json({ payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Debug endpoint to check current authenticated user
router.get("/whoami", authenticateUser, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        phonenumber: req.user.phonenumber,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ error: "Failed to get current user" });
  }
});

// Create Razorpay order
router.post("/create-order", checkPaymentFeature, async (req, res) => {
  try {
    const { planType, userId, selectedModule } = req.body;

    if (!planType || !userId) {
      return res.status(400).json({ 
        success: false,
        error: "Plan type and user ID are required" 
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    const plan = PLANS[planType];
    if (!plan) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid plan type" 
      });
    }

    if (planType === "STARTER") {
      return res.status(400).json({ 
        success: false,
        error: "Starter plan is free" 
      });
    }

    // Calculate pricing (with upgrade discounts if applicable)
    const pricingInfo = await calculateUpgradePrice(userId, planType);
    const finalAmount = pricingInfo.amount;

    // Create Razorpay order
    // Generate a short receipt (max 40 chars for Razorpay)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const shortUserId = userId.toString().slice(-6); // Last 6 digits/chars
    const receipt = `ord_${shortUserId}_${timestamp}`;
    
    const orderOptions = {
      amount: finalAmount * 100, // Convert rupees to paisa for Razorpay
      currency: "INR",
      receipt: receipt,
      notes: {
        userId,
        planType,
        planName: plan.name,
        country: "IN",
        selectedModule: selectedModule || null,
        ...(pricingInfo.discount > 0 && {
          originalAmount: pricingInfo.originalAmount,
          discount: pricingInfo.discount,
          soloCount: pricingInfo.soloCount,
          upgradeDiscount: true
        })
      }
    };

    console.log('Creating Razorpay order with options:', orderOptions);

    const order = await razorpay.orders.create(orderOptions);

    // Don't store payment record in database until completion
    // Only return order information for frontend processing

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount, // Amount in paisa for Razorpay frontend
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      userId: userId,
      planType: planType,
      selectedModule: selectedModule || null,
      amountInRupees: finalAmount, // Final amount in rupees for display
      pricingInfo: pricingInfo // Include upgrade pricing details
    });

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to create order",
      message: error.message 
    });
  }
});

// Verify payment
router.post("/verify-payment", checkPaymentFeature, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      userId 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Get order details from Razorpay to extract information
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const { userId: orderUserId, planType, selectedModule, originalAmount, discount, soloCount } = order.notes;

    // Calculate the final amount (for verification)
    const pricingInfo = await calculateUpgradePrice(orderUserId, planType);
    const finalAmount = pricingInfo.amount;

    // Create payment record only after successful verification
    const payment = await prisma.payment.create({
      data: {
        userId: orderUserId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: finalAmount, // Store final amount paid
        planType: planType,
        status: "COMPLETED", // Only store completed payments
        notes: selectedModule ? JSON.stringify({ 
          selectedModule,
          ...(pricingInfo.discount > 0 && {
            originalAmount: pricingInfo.originalAmount,
            discount: pricingInfo.discount,
            soloCount: pricingInfo.soloCount,
            upgradeDiscount: true
          })
        }) : null
      }
    });

    // Create or update subscription
    const plan = PLANS[planType];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    // Get notes from payment for SOLO plans that have a selected module
    let subscriptionNotes = null;
    if (planType === 'SOLO' && selectedModule) {
      subscriptionNotes = JSON.stringify({ selectedModule });
    }

    // For PRO upgrades, expire existing SOLO subscriptions and remove their progress
    if (planType === 'PRO' && pricingInfo.soloCount > 0) {
      // Find active SOLO subscriptions so we can inspect notes.selectedModule
      const activeSoloSubs = await prisma.subscription.findMany({
        where: {
          userId: orderUserId,
          planType: 'SOLO',
          status: 'ACTIVE'
        }
      });

      // Cancel them
      await prisma.subscription.updateMany({
        where: {
          userId: orderUserId,
          planType: 'SOLO',
          status: 'ACTIVE'
        },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });

  // NOTE: per requirement, do not remove SOLO module progress when expiring/cancelling during PRO upgrade
    }

    // For SOLO plans, create a new subscription each time (multiple SOLO subscriptions allowed)
    // For other plans, check for existing subscription and update or create
    let subscription;
    
    if (planType === 'SOLO') {
      // Create a new SOLO subscription (allow multiple per user)
      subscription = await prisma.subscription.create({
        data: {
          userId: orderUserId,
          planType: planType,
          status: "ACTIVE",
          endDate,
          amount: finalAmount,
          notes: subscriptionNotes
        }
      });
    } else {
      // For PRO/INSTITUTIONAL, check for existing and update or create
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId: orderUserId,
          planType: planType
        }
      });

      if (existingSubscription) {
        subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: "ACTIVE",
            endDate,
            amount: finalAmount,
            notes: subscriptionNotes
          }
        });
      } else {
        subscription = await prisma.subscription.create({
          data: {
            userId: orderUserId,
            planType: planType,
            status: "ACTIVE",
            endDate,
            amount: finalAmount,
            notes: subscriptionNotes
          }
        });
      }
    }

    console.log('Created/Updated subscription:', {
      subscriptionId: subscription.id,
      userId: orderUserId,
      planType: planType,
      status: subscription.status,
      endDate: subscription.endDate,
      notes: subscription.notes
    });

    // Link payment to subscription
    await prisma.payment.update({
      where: { id: payment.id },
      data: { subscriptionId: subscription.id }
    });

    res.json({ 
      success: true, 
      message: "Payment verified successfully",
      subscription
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// Get user subscriptions
router.get("/subscriptions/:userId", subscriptionCheckMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Use the new utility function to get enriched subscription data
    const subscriptions = await getUserSubscriptionsWithStatus(userId);

    res.json({
      success: true,
      subscriptions: subscriptions || [],
      metadata: {
        total: subscriptions.length,
        active: subscriptions.filter(sub => !sub.isExpired && sub.status === 'ACTIVE').length,
        expired: subscriptions.filter(sub => sub.isExpired || sub.status === 'EXPIRED').length,
        lastChecked: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch subscriptions",
      message: error.message
    });
  }
});

// Check if user has active subscription for a plan
router.get("/check-subscription/:userId/:planType", subscriptionCheckMiddleware, async (req, res) => {
  try {
    const { userId, planType } = req.params;

    // Get active subscriptions for the user
    const activeSubscriptions = await getActiveUserSubscriptions(userId);
    
    // Check if user has an active subscription of the specified type
    const hasActiveSubscription = activeSubscriptions.some(sub => 
      sub.planType === planType && !sub.isExpired
    );
    
    const subscription = activeSubscriptions.find(sub => sub.planType === planType);

    res.json({ 
      hasAccess: hasActiveSubscription || planType === "STARTER",
      subscription: hasActiveSubscription ? enrichSubscriptionData(subscription) : null,
      remainingDays: subscription ? subscription.remainingDays : 0,
      isExpired: subscription ? subscription.isExpired : false
    });

  } catch (error) {
    console.error("Error checking subscription:", error);
    res.status(500).json({ error: "Failed to check subscription" });
  }
});

// Get active subscriptions only
router.get("/active-subscriptions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const activeSubscriptions = await getActiveUserSubscriptions(userId);

    res.json({
      success: true,
      subscriptions: activeSubscriptions,
      count: activeSubscriptions.length
    });

  } catch (error) {
    console.error("Error fetching active subscriptions:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch active subscriptions",
      message: error.message
    });
  }
});

// Admin endpoint: Get subscription analytics
router.get("/admin/analytics", async (req, res) => {
  try {
    const analytics = await getSubscriptionAnalytics();
    
    res.json({
      success: true,
      analytics
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

// Admin endpoint: Manual subscription check
router.post("/admin/check-expired", async (req, res) => {
  try {
    const result = await runManualSubscriptionCheck();
    
    res.json({
      success: true,
      message: "Manual subscription check completed",
      result
    });

  } catch (error) {
    console.error("Error running manual subscription check:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to run subscription check",
      message: error.message
    });
  }
});

// Get subscription details with remaining days
router.get("/subscription-details/:subscriptionId", async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        payments: {
          orderBy: { createdAt: "desc" }
        },
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

// Get payment history
router.get("/payments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        subscription: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(payments);

  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Webhook for Razorpay events
router.post("/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
      .update(body)
      .digest("hex");

    if (signature === expectedSignature) {
      const event = req.body;
      
      // Handle different webhook events
      switch (event.event) {
        case "payment.captured":
          // Payment successful
          console.log("Payment captured:", event.payload.payment.entity);
          break;
        case "payment.failed":
          // Payment failed
          console.log("Payment failed:", event.payload.payment.entity);
          break;
        default:
          console.log("Unhandled webhook event:", event.event);
      }
    }

    res.status(200).json({ status: "ok" });

  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// Check feature availability
router.get("/feature-status", (req, res) => {
  res.json({
    paymentEnabled: process.env.PAYMENT_ENABLED === 'true',
    message: process.env.PAYMENT_ENABLED === 'true' 
      ? 'Payment feature is enabled' 
      : 'Payment feature is currently disabled'
  });
});

// Delete test payments (for development/testing only)
router.delete("/cleanup-test-payments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Delete payments with PENDING status for the user
    const deletedPayments = await prisma.payment.deleteMany({
      where: {
        userId: userId,
        status: "PENDING"
      }
    });

    // Also delete any related subscriptions that might be in testing state
    const deletedSubscriptions = await prisma.subscription.deleteMany({
      where: {
        userId: userId,
        payments: {
          none: {} // Delete subscriptions with no associated payments
        }
      }
    });

    res.json({
      success: true,
      message: `Cleanup completed for user ${userId}`,
      deletedPayments: deletedPayments.count,
      deletedSubscriptions: deletedSubscriptions.count
    });

  } catch (error) {
    console.error("Error cleaning up test payments:", error);
    res.status(500).json({ error: "Failed to cleanup test payments" });
  }
});

// Delete completed payments for a user
router.delete("/delete-completed-payments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Delete payments with COMPLETED status for the user
    const deletedPayments = await prisma.payment.deleteMany({
      where: {
        userId: userId,
        status: "COMPLETED"
      }
    });

    res.json({
      success: true,
      message: `Deleted ${deletedPayments.count} completed payments for user ${userId}`,
      deletedPayments: deletedPayments.count
    });

  } catch (error) {
    console.error("Error deleting completed payments:", error);
    res.status(500).json({ error: "Failed to delete completed payments" });
  }
});

// Delete all payments for a user (regardless of status)
router.delete("/delete-all-payments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Delete all payments for the user
    const deletedPayments = await prisma.payment.deleteMany({
      where: {
        userId: userId
      }
    });

    res.json({
      success: true,
      message: `Deleted ${deletedPayments.count} payments for user ${userId}`,
      deletedPayments: deletedPayments.count
    });

  } catch (error) {
    console.error("Error deleting all payments:", error);
    res.status(500).json({ error: "Failed to delete all payments" });
  }
});

// Delete all payments and subscriptions for a user (complete cleanup)
router.delete("/delete-all-user-data/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // First, delete all payments for the user
      const deletedPayments = await tx.payment.deleteMany({
        where: {
          userId: userId
        }
      });

      // Then, delete all subscriptions for the user
      const deletedSubscriptions = await tx.subscription.deleteMany({
        where: {
          userId: userId
        }
      });

      // Also delete module and topic performance for the user to fully remove progress data
      const deletedModulePerformances = await tx.modulePerformance.deleteMany({
        where: { userId: userId }
      });

      const deletedTopicPerformances = await tx.topicPerformance.deleteMany({
        where: { userId: userId }
      });

      return {
        deletedPayments: deletedPayments.count,
        deletedSubscriptions: deletedSubscriptions.count,
        deletedModulePerformances: deletedModulePerformances.count,
        deletedTopicPerformances: deletedTopicPerformances.count
      };
    });

    res.json({
      success: true,
      message: `Complete cleanup completed for user ${userId}`,
      deletedPayments: result.deletedPayments,
      deletedSubscriptions: result.deletedSubscriptions,
      totalDeleted: result.deletedPayments + result.deletedSubscriptions
    });

  } catch (error) {
    console.error("Error performing complete cleanup:", error);
    res.status(500).json({ error: "Failed to perform complete cleanup" });
  }
});

// Test endpoint for subscription expiry functionality
router.get("/test-expiry-system", async (req, res) => {
  try {
    console.log('🧪 Running subscription expiry system test...');
    
    // Get analytics
    const analytics = await getSubscriptionAnalytics();
    
    // Check for expired subscriptions
    const expiredResult = await runManualSubscriptionCheck();
    
    // Get subscriptions expiring soon
    const expiringSoon = await getSubscriptionsExpiringSoon(7);
    
    res.json({
      success: true,
      message: "Subscription expiry system test completed",
      results: {
        analytics: analytics,
        expiredCheck: expiredResult,
        expiringSoon: {
          count: expiringSoon.length,
          subscriptions: expiringSoon.map(sub => ({
            userId: sub.userId,
            userName: sub.user?.name,
            planType: sub.planType,
            remainingDays: sub.remainingDays,
            endDate: sub.endDate,
            selectedModule: sub.selectedModule
          }))
        }
      }
    });

  } catch (error) {
    console.error("Error testing expiry system:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to test expiry system",
      message: error.message 
    });
  }
});

export default router;
