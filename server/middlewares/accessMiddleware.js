/**
 * Access Control Middleware for EduManiax Server
 * 
 * This middleware enforces access control rules for API endpoints
 * based on user subscription plans.
 */

import { PrismaClient } from '@prisma/client';
import { 
  hasModuleAccess, 
  hasFeatureAccess, 
  getUpgradeInfo,
  MODULES,
  FEATURES 
} from '../utils/accessControl.js';

const prisma = new PrismaClient();

// Module name mapping - converts frontend display names to backend module keys
const FRONTEND_TO_BACKEND_MODULE_MAPPING = {
  'Fundamentals of Finance': 'finance',
  'Computer Science': 'computers',
  'Fundamentals of Law': 'law',
  'Communication Mastery': 'communication',
  'Entrepreneurship Bootcamp': 'entrepreneurship',
  'Digital Marketing Pro': 'digital-marketing',
  'Leadership & Adaptability': 'leadership',
  'Environmental Sustainability': 'environment',
  'Wellness & Mental Health': 'sel',
};

/**
 * Get user's active subscriptions and highest plan
 */
async function getUserSubscriptionInfo(userId) {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Plan hierarchy for determining highest tier
    const planHierarchy = ['STARTER', 'SOLO', 'PRO', 'INSTITUTIONAL'];
    
    // Find highest tier subscription
    let highestPlan = 'STARTER';
    for (const plan of planHierarchy.reverse()) {
      if (subscriptions.some(sub => sub.planType === plan)) {
        highestPlan = plan;
        break;
      }
    }

    // Get the SOLO plan's module from subscription notes if available
    let selectedModule = null;
    const soloSubscription = subscriptions.find(sub => sub.planType === 'SOLO');
    if (soloSubscription && soloSubscription.notes) {
      try {
        const notesData = JSON.parse(soloSubscription.notes);
        const frontendModuleName = notesData.selectedModule;
        
        // Convert frontend display name to backend module key
        if (frontendModuleName) {
          selectedModule = FRONTEND_TO_BACKEND_MODULE_MAPPING[frontendModuleName] || frontendModuleName.toLowerCase();
        }
      } catch (e) {
        // If notes is not valid JSON or doesn't contain selectedModule
        selectedModule = null;
      }
    }

    return {
      subscriptions,
      highestPlan,
      selectedModule
    };

  } catch (error) {
    console.error('Error fetching user subscription info:', error);
    return {
      subscriptions: [],
      highestPlan: 'STARTER',
      selectedModule: null
    };
  }
}

/**
 * Middleware to check if user has valid authentication
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Extract user ID from request (adjust based on your auth implementation)
    const userId = req.headers['user-id'] || req.body.userId || req.params.userId || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User ID is required to access this resource'
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'Invalid user ID'
      });
    }

    // Attach user info to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'Failed to authenticate user'
    });
  }
};

/**
 * Middleware to check module access
 */
export const requireModuleAccess = (moduleKey) => {
  return async (req, res, next) => {
    // [DISABLED FOR NOW]: Always allow module access in free mode (login still required upstream)
    return next();
  };
};

/**
 * Middleware to check feature access
 */
export const requireFeatureAccess = (feature) => {
  return async (req, res, next) => {
    // [DISABLED FOR NOW]: Always allow feature access in free mode
    return next();
  };
};

/**
 * Middleware to check plan level access
 */
export const requirePlanLevel = (requiredPlan) => {
  return async (req, res, next) => {
    // [DISABLED FOR NOW]: Always allow plan-level access in free mode
    return next();
  };
};

/**
 * Middleware to check challenge/activity access within a module
 */
export const requireChallengeAccess = (moduleKey, challengeLevel = 1) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access challenges'
        });
      }

      const { highestPlan, selectedModule } = await getUserSubscriptionInfo(userId);

      // First check module access
      if (!hasModuleAccess(highestPlan, moduleKey, selectedModule)) {
        return res.status(403).json({
          error: 'Module access denied',
          message: `Access to ${moduleKey} module is not available in your current plan`,
          currentPlan: highestPlan,
          requiredModule: moduleKey,
          upgradeInfo: getUpgradeInfo(highestPlan, 'SOLO')
        });
      }

      // Check challenge level access based on plan
      const maxLevelsPerPlan = {
        'STARTER': 1,
        'SOLO': 3,
        'PRO': 'unlimited',
        'INSTITUTIONAL': 'unlimited'
      };

      const maxLevels = maxLevelsPerPlan[highestPlan];
      if (maxLevels !== 'unlimited' && challengeLevel > maxLevels) {
        return res.status(403).json({
          error: 'Challenge level access denied',
          message: `Level ${challengeLevel} requires a higher subscription plan`,
          currentPlan: highestPlan,
          maxAvailableLevel: maxLevels,
          upgradeInfo: getUpgradeInfo(highestPlan, 'PRO')
        });
      }

      req.userSubscription = { highestPlan, selectedModule };
      next();

    } catch (error) {
      console.error('Challenge access middleware error:', error);
      res.status(500).json({
        error: 'Access check failed',
        message: 'Failed to verify challenge access'
      });
    }
  };
};

/**
 * Middleware to add subscription info to all requests (non-blocking)
 */
export const attachSubscriptionInfo = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['user-id'] || req.body.userId || req.params.userId;
    
    if (userId) {
      const subscriptionInfo = await getUserSubscriptionInfo(userId);
      req.userSubscription = subscriptionInfo;
    } else {
      req.userSubscription = {
        subscriptions: [],
        highestPlan: 'STARTER',
        selectedModule: null
      };
    }

    next();

  } catch (error) {
    console.error('Subscription info middleware error:', error);
    // Don't fail the request, just continue without subscription info
    req.userSubscription = {
      subscriptions: [],
      highestPlan: 'STARTER',
      selectedModule: null
    };
    next();
  }
};

/**
 * Helper function to get access summary for a user
 */
export const getAccessSummary = async (userId) => {
  try {
    const { highestPlan, selectedModule, subscriptions } = await getUserSubscriptionInfo(userId);
    
    // Get accessible modules
    const accessibleModules = Object.values(MODULES).filter(module => 
      hasModuleAccess(highestPlan, module, selectedModule)
    );

    // Get accessible features
    const accessibleFeatures = Object.values(FEATURES).filter(feature => 
      hasFeatureAccess(highestPlan, feature)
    );

    return {
      userId,
      currentPlan: highestPlan,
      selectedModule,
      activeSubscriptions: subscriptions,
      accessibleModules,
      accessibleFeatures,
      limitations: {
        maxModules: highestPlan === 'STARTER' || highestPlan === 'SOLO' ? 1 : 'unlimited',
        aiFeatures: hasFeatureAccess(highestPlan, FEATURES.AI_ASSESSMENT),
        certificates: hasFeatureAccess(highestPlan, FEATURES.CERTIFICATES),
        liveSupport: hasFeatureAccess(highestPlan, FEATURES.PRIORITY_SUPPORT)
      }
    };

  } catch (error) {
    console.error('Error getting access summary:', error);
    throw error;
  }
};

/**
 * Endpoint to get user's access summary
 */
export const getAccessSummaryHandler = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID required',
        message: 'Please provide a valid user ID'
      });
    }

    const accessSummary = await getAccessSummary(userId);
    res.json(accessSummary);

  } catch (error) {
    console.error('Error in getAccessSummaryHandler:', error);
    res.status(500).json({
      error: 'Failed to get access summary',
      message: 'An error occurred while retrieving access information'
    });
  }
};
