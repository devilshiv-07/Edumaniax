/**
 * Common Game Access Control Hook
 * 
 * This hook provides unified access control logic for all game modules.
 * It handles subscription fetching, module mapping, and challenge unlocking.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessControl, MODULE_CONFIGS } from '../utils/accessControl';

// Module mapping for all courses
const MODULE_MAPPING = {
  'Fundamentals of Finance': 'finance',
  'Computer Science': 'computers',
  'Fundamentals of Law': 'law',
  'Communication Mastery': 'communication',
  'Entrepreneurship Bootcamp': 'entrepreneurship',
  'Digital Marketing Pro': 'digital-marketing',
  'Leadership & Adaptability': 'leadership',
  'Environmental Sustainability': 'environment',
  'Wellness & Mental Health': 'sel'
};

/**
 * Custom hook for game access control
 * @param {string} moduleKey - The module key (e.g., 'leadership', 'entrepreneurship')
 * @param {Array} progress - Progress array from module context
 * @returns {Object} Access control utilities and state
 */
export const useGameAccess = (moduleKey, progress = []) => {
  const { user, role } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Access control hook
  const { hasLevelAccess, currentPlan, isTrialValid, getRemainingTrialDays, isModulePurchased, soloModules } = useAccessControl(subscriptions, selectedModule);

  // Debug: print access state after subscriptions load to diagnose purchased-level locking
  useEffect(() => {
    if (!isLoading) {
      try {
        // derive levels dynamically from MODULE_CONFIGS if available
        let levels = [1];
        try {
          const cfg = MODULE_CONFIGS[moduleKey];
          if (cfg && cfg.levels) {
            levels = Object.keys(cfg.levels).map((k) => parseInt(k, 10)).sort((a, b) => a - b);
          }
        } catch {
          // fallback to [1]
        }

        console.debug('[useGameAccess] debug', {
          moduleKey,
          currentPlan,
          selectedModule,
          soloModules,
          isPurchased: isModulePurchased(moduleKey),
          levelAccess: levels.map((l) => ({ level: l, access: hasLevelAccess(moduleKey, l) }))
        });
      } catch {
        // ignore
      }
    }
  }, [isLoading, subscriptions, moduleKey, currentPlan, selectedModule, soloModules, hasLevelAccess, isModulePurchased]);

  // Fetch user subscription data
  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/payment/subscriptions/${user.id}`
        );
        
        if (response.ok) {
          const subscriptionData = await response.json();
          // Handle the API response format {success: true, subscriptions: [...]}
          const userSubscriptions = subscriptionData.success ? subscriptionData.subscriptions : [];
          setSubscriptions(userSubscriptions);
          
          // For multiple SOLO subscriptions, check if current module is purchased
          // Set selectedModule to the first purchased module
          if (userSubscriptions.length > 0) {
            const activeSubscriptions = userSubscriptions.filter(sub => 
              sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()
            );
            
            // Check if the current module is purchased
            const currentModuleSubscription = activeSubscriptions.find(sub => {
              if (sub.notes && sub.planType === 'SOLO') {
                try {
                  const parsedNotes = JSON.parse(sub.notes);
                  const rawModule = parsedNotes.selectedModule;
                  const mappedModule = MODULE_MAPPING[rawModule] || rawModule?.toLowerCase();
                  return mappedModule === moduleKey;
                } catch {
                  console.error('Error parsing subscription notes');
                  return false;
                }
              }
              return false;
            });
            
            if (currentModuleSubscription) {
              // Current module is purchased
              setSelectedModule(moduleKey);
            } else {
              // Use the first active subscription's module as selectedModule
              const firstActiveSubscription = activeSubscriptions[0];
              if (firstActiveSubscription && firstActiveSubscription.notes) {
                try {
                  const parsedNotes = JSON.parse(firstActiveSubscription.notes);
                  const rawModule = parsedNotes.selectedModule;
                  setSelectedModule(MODULE_MAPPING[rawModule] || rawModule?.toLowerCase());
                } catch {
                  setSelectedModule(firstActiveSubscription.notes?.toLowerCase());
                }
              }
            }
          }
        }
      } catch {
        console.error('Error fetching subscriptions');
        setSubscriptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSubscriptions();

    // Listen for subscription updates from payment completion
    const handleSubscriptionUpdate = (event) => {
      console.log('useGameAccess: Subscription update detected');
      if (event.detail?.subscriptions) {
        const userSubscriptions = event.detail.subscriptions;
        setSubscriptions(userSubscriptions);
        
        // Update selected module based on current module purchase
        const activeSubscriptions = userSubscriptions.filter(sub => 
          sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()
        );
        
        const currentModuleSubscription = activeSubscriptions.find(sub => {
          if (sub.notes && sub.planType === 'SOLO') {
            try {
              const parsedNotes = JSON.parse(sub.notes);
              const rawModule = parsedNotes.selectedModule;
              const mappedModule = MODULE_MAPPING[rawModule] || rawModule?.toLowerCase();
              return mappedModule === moduleKey;
            } catch {
              return false;
            }
          }
          return false;
        });
        
        if (currentModuleSubscription) {
          setSelectedModule(moduleKey);
        }
      }
    };

    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    
    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, [user?.id, moduleKey]);

  // Helper function to check if a challenge is completed
  const isChallengeCompleted = (moduleIndex, challengeIndex) => {
    return progress.some(
      (p) =>
        p.moduleIndex === moduleIndex &&
        p.challengeIndex === challengeIndex &&
        p.completed
    );
  };

  // Main challenge unlock logic
  const isChallengeUnlocked = (moduleIndex, challengeIndex, modules = []) => {
    // Admin always has access
    if (role === "admin") return true;
    
    // STARTER plan users can only access the first challenge of level 1
    if (currentPlan === 'STARTER' && isTrialValid()) {
      // Only allow access to Challenge 1 in Level 1 (first challenge of first module)
      if (moduleIndex === 0 && challengeIndex === 0) return true;
      return false;
    }

    // SOLO plan users have different access based on whether they've purchased this module
    if (currentPlan === 'SOLO') {
      // If the user has purchased this module (may have multiple SOLO purchases), grant level access as per controller
      if (isModulePurchased(moduleKey)) {
        const levelNumber = moduleIndex + 1;
        const hasSubscriptionAccess = hasLevelAccess(moduleKey, levelNumber);
        if (hasSubscriptionAccess) return true;
        // otherwise continue to fallback checks
      } else {
        // For other modules (trial access), only allow Challenge 1 of Level 1
        if (moduleIndex === 0 && challengeIndex === 0) return true;
        return false;
      }
    }

    // Use access control system for subscription-based access (PRO, INSTITUTIONAL)
    const levelNumber = moduleIndex + 1; // Convert 0-based index to 1-based level
    const hasSubscriptionAccess = hasLevelAccess(moduleKey, levelNumber);
    
    // If user has subscription access to this level, unlock all challenges in that level
    if (hasSubscriptionAccess) return true;

    // Fallback to progress-based unlocking for users without subscription
    if (moduleIndex === 0 && challengeIndex === 0) return true;

    if (challengeIndex > 0) {
      return isChallengeCompleted(moduleIndex, challengeIndex - 1);
    }

    const prevModule = modules[moduleIndex - 1];
    if (!prevModule) return false;

    const lastChallengeIndex = prevModule.challenges.length - 1;
    return isChallengeCompleted(moduleIndex - 1, lastChallengeIndex);
  };

  // Get access info for debugging
  const getAccessInfo = (levelNumber) => {
    return {
      currentPlan,
  hasAccess: hasLevelAccess(moduleKey, levelNumber),
      selectedModule,
  isPurchased: isModulePurchased(moduleKey),
      isTrialValid: currentPlan === 'STARTER' ? isTrialValid() : null,
      remainingDays: currentPlan === 'STARTER' ? getRemainingTrialDays() : null
    };
  };
  // Get button config for challenge
  const getChallengeButtonConfig = (isUnlocked, challenge, navigate) => {
    if (isUnlocked || role === "admin") {
      return {
        type: 'start',
        className: 'bg-[#10903E] text-white hover:bg-[#0a7d35] hover:scale-[1.02] hover:shadow-md active:scale-[0.98] transition-transform duration-200',
        icon: '/imageForDesign/start.svg',
        text: 'Start Now',
        onClick: () => {
          if (role === "admin") navigate(challenge.path);
          else if (!user) navigate("/login");
          else navigate(challenge.path);
        }
      };
    } else {
      return {
        type: 'unlock',
        className: 'bg-[#BB8B00] text-white hover:bg-[#996600]',
        icon: '/imageForDesign/unlock.svg',
        text: 'Unlock Now',
        onClick: () => navigate("/pricing")
      };
    }
  };

  return {
    // State
    subscriptions,
    selectedModule,
    currentPlan,
    isLoading,
    
    // Access control functions
    isChallengeCompleted,
    isChallengeUnlocked,
    hasLevelAccess: (levelNumber) => hasLevelAccess(moduleKey, levelNumber),
    getAccessInfo,
    getChallengeButtonConfig,
    
    // Trial info (for STARTER plan)
    isTrialValid: currentPlan === 'STARTER' ? isTrialValid() : true,
    remainingTrialDays: currentPlan === 'STARTER' ? getRemainingTrialDays() : null
  };
};

export default useGameAccess;
