/**
 * Subscription Management Utilities
 * 
 * This file contains utilities for managing subscription lifecycle,
 * including automatic expiry detection and remaining days calculation.
 */

import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();

/**
 * Calculate remaining days for a subscription
 * @param {Date} endDate - Subscription end date
 * @returns {number} - Remaining days (0 if expired)
 */
export const calculateRemainingDays = (endDate) => {
  const currentDate = new Date();
  const timeDifference = new Date(endDate) - currentDate;
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  
  // Return 0 if subscription has expired, otherwise return remaining days
  return Math.max(0, daysDifference);
};

/**
 * Calculate days since purchase
 * @param {Date} startDate - Subscription start date
 * @returns {number} - Days since purchase
 */
export const calculateDaysSincePurchase = (startDate) => {
  const currentDate = new Date();
  const timeDifference = currentDate - new Date(startDate);
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysDifference);
};

/**
 * Check if a subscription is expired
 * @param {Date} endDate - Subscription end date
 * @returns {boolean} - True if expired
 */
export const isSubscriptionExpired = (endDate) => {
  return new Date() > new Date(endDate);
};

/**
 * Get subscription with remaining days information
 * @param {Object} subscription - Raw subscription object
 * @returns {Object} - Subscription with additional fields
 */
export const enrichSubscriptionData = (subscription) => {
  if (!subscription) return null;
  
  const remainingDays = calculateRemainingDays(subscription.endDate);
  const daysSincePurchase = calculateDaysSincePurchase(subscription.startDate);
  const isExpired = isSubscriptionExpired(subscription.endDate);
  
  // Parse module information from notes for SOLO plans
  let selectedModule = null;
  if (subscription.planType === 'SOLO' && subscription.notes) {
    try {
      const parsedNotes = JSON.parse(subscription.notes);
      selectedModule = parsedNotes.selectedModule;
    } catch {
      // If notes is not JSON, treat as plain text
      selectedModule = subscription.notes;
    }
  }
  
  return {
    ...subscription,
    remainingDays,
    daysSincePurchase,
    isExpired,
    selectedModule,
    // Helper fields for display
    status: isExpired ? 'EXPIRED' : subscription.status,
    daysUsed: daysSincePurchase,
    totalDays: calculateTotalDays(subscription.planType),
    usagePercentage: calculateUsagePercentage(daysSincePurchase, subscription.planType)
  };
};

/**
 * Calculate total days for a plan type
 * @param {string} planType - Type of plan
 * @returns {number} - Total days for the plan
 */
const calculateTotalDays = (planType) => {
  const planDays = {
    'STARTER': 7,
    'SOLO': 30,
    'PRO': 90,
    'INSTITUTIONAL': 365 // Default for custom plans
  };
  
  return planDays[planType] || 30;
};

/**
 * Calculate usage percentage
 * @param {number} daysUsed - Days since purchase
 * @param {string} planType - Type of plan
 * @returns {number} - Usage percentage (0-100)
 */
const calculateUsagePercentage = (daysUsed, planType) => {
  const totalDays = calculateTotalDays(planType);
  return Math.min(100, Math.round((daysUsed / totalDays) * 100));
};

/**
 * Find and mark expired subscriptions as EXPIRED
 * @returns {Object} - Summary of expired subscriptions
 */
export const markExpiredSubscriptions = async () => {
  try {
    console.log('🔍 Checking for expired subscriptions...');
    
    // Find all active subscriptions that have passed their end date
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: new Date() // Less than current date
        }
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
    
    if (expiredSubscriptions.length === 0) {
      console.log('✅ No expired subscriptions found');
      return { expired: 0, updated: 0 };
    }
    
    console.log(`⚠️  Found ${expiredSubscriptions.length} expired subscriptions`);
    
    // Update all expired subscriptions to EXPIRED status
    const updateResult = await prisma.subscription.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: new Date()
        }
      },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date()
      }
    });
    
    // Log details for each expired subscription
    expiredSubscriptions.forEach(sub => {
      console.log(`📅 Expired: ${sub.user.name} (${sub.user.phonenumber}) - ${sub.planType} plan expired on ${sub.endDate}`);
    });
    
    console.log(`✅ Updated ${updateResult.count} subscriptions to EXPIRED status`);

  // NOTE: do not delete user progress when subscriptions expire; explicit cancellation only
    
    return {
      expired: expiredSubscriptions.length,
      updated: updateResult.count,
      details: expiredSubscriptions.map(sub => ({
        userId: sub.userId,
        userName: sub.user.name,
        planType: sub.planType,
        endDate: sub.endDate,
        selectedModule: sub.notes ? (function() {
          try {
            return JSON.parse(sub.notes).selectedModule;
          } catch {
            return sub.notes;
          }
        })() : null
      }))
    };
    
  } catch (error) {
    console.error('❌ Error checking expired subscriptions:', error);
    throw error;
  }
};

/**
 * Get user subscriptions with enriched data
 * @param {string} userId - User ID
 * @returns {Array} - Array of enriched subscriptions
 */
export const getUserSubscriptionsWithStatus = async (userId) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Enrich each subscription with remaining days and status info
    return subscriptions.map(enrichSubscriptionData);
    
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    throw error;
  }
};

/**
 * Get active subscriptions for a user (non-expired)
 * @param {string} userId - User ID
 * @returns {Array} - Array of active subscriptions
 */
export const getActiveUserSubscriptions = async (userId) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          gt: new Date() // Greater than current date
        }
      },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return subscriptions.map(enrichSubscriptionData);
    
  } catch (error) {
    console.error('Error fetching active user subscriptions:', error);
    throw error;
  }
};

/**
 * Get subscriptions expiring soon (within specified days)
 * @param {number} withinDays - Number of days to look ahead (default: 3)
 * @returns {Array} - Array of subscriptions expiring soon
 */
export const getSubscriptionsExpiringSoon = async (withinDays = 3) => {
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + withinDays);
    
    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: new Date(), // Not yet expired
          lte: futureDate  // But expires within specified days
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phonenumber: true,
            email: true
          }
        }
      },
      orderBy: { endDate: 'asc' }
    });
    
    return expiringSoon.map(enrichSubscriptionData);
    
  } catch (error) {
    console.error('Error fetching subscriptions expiring soon:', error);
    throw error;
  }
};

/**
 * Initialize subscription monitoring
 * This function sets up the cron job to check for expired subscriptions
 */
export const initializeSubscriptionMonitoring = () => {
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Running scheduled subscription expiry check...');
    try {
      await markExpiredSubscriptions();
    } catch (error) {
      console.error('❌ Scheduled subscription check failed:', error);
    }
  });
  
  // Also run every 6 hours during business hours (9 AM, 3 PM, 9 PM)
  cron.schedule('0 9,15,21 * * *', async () => {
    console.log('🔄 Running business hours subscription check...');
    try {
      await markExpiredSubscriptions();
    } catch (error) {
      console.error('❌ Business hours subscription check failed:', error);
    }
  });
  
  console.log('✅ Subscription monitoring initialized');
  console.log('📅 Scheduled checks: Daily at 2:00 AM and every 6 hours at 9 AM, 3 PM, 9 PM');
};

/**
 * Manual subscription check (for admin use)
 * @returns {Object} - Results of the check
 */
export const runManualSubscriptionCheck = async () => {
  console.log('🔄 Running manual subscription expiry check...');
  return await markExpiredSubscriptions();
};

/**
 * Get subscription analytics
 * @returns {Object} - Analytics data
 */
export const getSubscriptionAnalytics = async () => {
  try {
    const totalSubscriptions = await prisma.subscription.count();
    
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        endDate: {
          gt: new Date()
        }
      }
    });
    
    const expiredSubscriptions = await prisma.subscription.count({
      where: {
        OR: [
          { status: 'EXPIRED' },
          {
            status: 'ACTIVE',
            endDate: {
              lt: new Date()
            }
          }
        ]
      }
    });
    
    const expiringSoon = await getSubscriptionsExpiringSoon(7); // Next 7 days
    
    const planDistribution = await prisma.subscription.groupBy({
      by: ['planType'],
      where: {
        status: 'ACTIVE',
        endDate: {
          gt: new Date()
        }
      },
      _count: {
        id: true
      }
    });
    
    return {
      total: totalSubscriptions,
      active: activeSubscriptions,
      expired: expiredSubscriptions,
      expiringSoon: expiringSoon.length,
      planDistribution: planDistribution.reduce((acc, plan) => {
        acc[plan.planType] = plan._count.id;
        return acc;
      }, {}),
      lastChecked: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error getting subscription analytics:', error);
    throw error;
  }
};

export default {
  calculateRemainingDays,
  calculateDaysSincePurchase,
  isSubscriptionExpired,
  enrichSubscriptionData,
  markExpiredSubscriptions,
  getUserSubscriptionsWithStatus,
  getActiveUserSubscriptions,
  getSubscriptionsExpiringSoon,
  initializeSubscriptionMonitoring,
  runManualSubscriptionCheck,
  getSubscriptionAnalytics
};
