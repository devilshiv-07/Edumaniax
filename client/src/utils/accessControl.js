/**
 * Client-Side Access Control Utilities for EduManiax Platform
 * 
 * This file provides utility functions to check access permissions
 * on the frontend and manage feature visibility.
 * 
 * KEY FEATURES:
 * - Support for multiple SOLO plan purchases (one per module)
 * - Users can purchase individual modules instead of upgrading to PRO
 * - Flexible upgrade suggestions (individual module purchase vs PRO upgrade)
 * - Maintains backward compatibility with existing single-module SOLO plans
 * 
 * SUBSCRIPTION STRUCTURE EXPECTED:
 * - Each subscription should have: planType, module/selectedModule, status, endDate
 * - Multiple active SOLO subscriptions allowed for different modules
 * - PRO/INSTITUTIONAL plans still provide access to all modules
 */

import React from 'react';

// Plan hierarchy for upgrade calculations
const PLAN_HIERARCHY = ['STARTER', 'SOLO', 'PRO', 'INSTITUTIONAL'];

// Feature categories for better organization
const FEATURE_CATEGORIES = {
  CORE: {
    name: 'Core Features',
    features: ['games', 'notes', 'basic_assessments']
  },
  PREMIUM: {
    name: 'Premium Features', 
    features: ['advanced_assessments', 'progress_tracking', 'certificates']
  },
  AI: {
    name: 'AI-Powered Features',
    features: ['ai_assessment', 'ai_personalization', 'ai_homework']
  },
  INSTITUTIONAL: {
    name: 'Institutional Features',
    features: ['bulk_management', 'custom_content', 'live_sessions']
  }
};

// Module configurations with access requirements
const MODULE_CONFIGS = {
  finance: {
    name: 'Finance Management',
    icon: '💰',
    minPlan: 'STARTER',
    levels: {
      1: { name: 'Budget Basics', minPlan: 'STARTER' },
      2: { name: 'Investment Fundamentals', minPlan: 'SOLO' },
      3: { name: 'Advanced Portfolio', minPlan: 'PRO' },
      4: { name: 'Finance Master', minPlan: 'PRO' }
    }
  },
  'digital-marketing': {
    name: 'Digital Marketing',
    icon: '📱',
    minPlan: 'STARTER',
    levels: {
      1: { name: 'Social Media Basics', minPlan: 'STARTER' },
      2: { name: 'Content Strategy', minPlan: 'SOLO' },
      3: { name: 'Analytics & ROI', minPlan: 'PRO' },
      4: { name: 'Marketing Guru', minPlan: 'PRO' }
    }
  },
  communication: {
    name: 'Communication Skills',
    icon: '🗣️',
    minPlan: 'STARTER',
    levels: {
      1: { name: 'Basic Speaking', minPlan: 'STARTER' },
      2: { name: 'Public Speaking', minPlan: 'SOLO' },
      3: { name: 'Leadership Communication', minPlan: 'PRO' },
      4: { name: 'Communication Expert', minPlan: 'PRO' }
    }
  },
  computers: {
    name: 'Computer Science',
    icon: '💻',
    minPlan: 'STARTER',
    levels: {
      1: { name: 'Programming Basics', minPlan: 'STARTER' },
      2: { name: 'Web Development', minPlan: 'SOLO' },
      3: { name: 'Advanced Algorithms', minPlan: 'PRO' },
      4: { name: 'Tech Wizard', minPlan: 'PRO' }
    }
  },
  entrepreneurship: {
    name: 'Entrepreneurship',
    icon: '🚀',
    minPlan: 'STARTER',
    levels: {
      1: { name: 'Innovation Explorer', minPlan: 'STARTER' },
      2: { name: 'Pitch Champion', minPlan: 'SOLO' },
      3: { name: 'MVP Strategist', minPlan: 'PRO' },
      4: { name: 'Business Tycoon', minPlan: 'PRO' }
    }
  },
  environment: {
    name: 'Environmental Science',
    icon: '🌱',
    minPlan: 'STARTER',
    levels: {
      1: { name: 'Eco Awareness', minPlan: 'STARTER' },
      2: { name: 'Sustainability Projects', minPlan: 'SOLO' },
      3: { name: 'Climate Solutions', minPlan: 'PRO' },
      4: { name: 'Environmental Guardian', minPlan: 'PRO' }
    }
  },
  law: {
    name: 'Legal Awareness',
    icon: '⚖️',
    minPlan: 'STARTER',
    levels: {
      1: { name: 'Basic Rights', minPlan: 'STARTER' },
      2: { name: 'Constitutional Law', minPlan: 'SOLO' },
      3: { name: 'Legal Practice', minPlan: 'PRO' },
      4: { name: 'The Law Challenger', minPlan: 'PRO' }
    }
  },
  leadership: {
    name: 'Leadership Skills',
    icon: '👑',
    minPlan: 'STARTER',
    levels: {
      1: { name: 'Team Basics', minPlan: 'STARTER' },
      2: { name: 'Management Skills', minPlan: 'SOLO' },
      3: { name: 'Strategic Leadership', minPlan: 'PRO' },
      4: { name: 'Visionary Leader', minPlan: 'PRO' }
    }
  },
  sel: {
    name: 'Social Emotional Learning',
    icon: '❤️',
    minPlan: 'STARTER',
    levels: {
      1: { name: 'Self Awareness', minPlan: 'STARTER' },
      2: { name: 'Social Skills', minPlan: 'SOLO' },
      3: { name: 'Emotional Intelligence', minPlan: 'PRO' },
      4: { name: 'Empathy Master', minPlan: 'PRO' }
    }
  }
};

/**
 * Access Control Class
 */
class AccessController {
  constructor(userSubscription = null, selectedModule = null) {
    // console.log('AccessController: Initializing with subscriptions:', userSubscription);
    // console.log('AccessController: Selected module:', selectedModule);
    
    this.userSubscription = userSubscription;
    this.selectedModule = selectedModule;
    this.currentPlan = this.getCurrentPlan();
    this.soloModules = this.getSoloModules();
    this.trialStartDate = this.getTrialStartDate();
    
    // console.log('AccessController: Initialized with currentPlan:', this.currentPlan);
    // console.log('AccessController: Initialized with soloModules:', this.soloModules);
    // console.log('AccessController: Trial start date:', this.trialStartDate);
    // console.log('AccessController: Trial valid:', this.isTrialValid());
    // console.log('AccessController: Remaining trial days:', this.getRemainingTrialDays());
  }

  /**
   * Get user's current highest plan
   */
  getCurrentPlan() {
    if (!this.userSubscription || !Array.isArray(this.userSubscription)) {
      // console.log('AccessController: No subscriptions, defaulting to STARTER (trial access)');
      return 'STARTER';
    }

    // Find the highest active subscription (using enriched data)
    const activeSubscriptions = this.userSubscription.filter(sub => {
      // Check if subscription is active and not expired
      const isActive = sub.status === 'ACTIVE';
      const isNotExpired = sub.isExpired === false || new Date(sub.endDate) > new Date();
      const hasRemainingDays = !Object.prototype.hasOwnProperty.call(sub, 'remainingDays') || sub.remainingDays > 0;
      
      return isActive && isNotExpired && hasRemainingDays;
    });

    // console.log('AccessController: Found', activeSubscriptions.length, 'active subscriptions');

    if (activeSubscriptions.length === 0) {
      // console.log('AccessController: No active subscriptions, defaulting to STARTER (trial access)');
      return 'STARTER';
    }

    // Return the highest tier among active subscriptions (don't mutate original array)
    for (const plan of [...PLAN_HIERARCHY].reverse()) {
      if (activeSubscriptions.some(sub => sub.planType === plan)) {
        // console.log('AccessController: Current plan determined as', plan);
        return plan;
      }
    }

    // console.log('AccessController: No matching plan found, defaulting to STARTER (trial access)');
    return 'STARTER';
  }

  /**
   * Get all modules that user has SOLO plan access to
   */
  getSoloModules() {
    if (!this.userSubscription || !Array.isArray(this.userSubscription)) {
      // console.log('AccessController: No subscriptions or not an array');
      return [];
    }

    // Find all active SOLO subscriptions using enriched data
    const activeSoloSubscriptions = this.userSubscription.filter(sub => {
      const isActive = sub.status === 'ACTIVE';
      const isSolo = sub.planType === 'SOLO';
      const isNotExpired = sub.isExpired === false || new Date(sub.endDate) > new Date();
      const hasRemainingDays = !Object.prototype.hasOwnProperty.call(sub, 'remainingDays') || sub.remainingDays > 0;
      
      return isActive && isSolo && isNotExpired && hasRemainingDays;
    });

    // console.log('AccessController: Found', activeSoloSubscriptions.length, 'active SOLO subscriptions');

    // Extract module names from SOLO subscriptions
    // Use a robust normalisation & mapping strategy to handle many display-name variants
    const mapping = {
      'fundamentalsoffinance': 'finance',
      'fundamentals of finance': 'finance',
      'finance': 'finance',
      'computer science': 'computers',
      'computers': 'computers',
      'fundamentalsoflaw': 'law',
      'fundamentals of law': 'law',
      'law': 'law',
      'communicationmastery': 'communication',
      'communication mastery': 'communication',
      'communicationskills': 'communication',
      'communication skills': 'communication',
      'entrepreneurshipbootcamp': 'entrepreneurship',
      'entrepreneurship bootcamp': 'entrepreneurship',
      'entrepreneurship': 'entrepreneurship',
      'digitalmarketingpro': 'digital-marketing',
      'digital marketing pro': 'digital-marketing',
      'digital marketing': 'digital-marketing',
      'leadership&adaptability': 'leadership',
      'leadership & adaptability': 'leadership',
      'leadership': 'leadership',
      'environmentalsustainability': 'environment',
      'environmental sustainability': 'environment',
      'environment': 'environment',
      'wellness&mentalhealth': 'sel',
      'wellness & mental health': 'sel',
      'social emotional learning': 'sel',
      'sel': 'sel'
    };

    const normalize = (s) => (s || '').toString().trim().toLowerCase();

    const modules = activeSoloSubscriptions
      .map((sub) => {
        // candidate values to inspect (expanded to be more tolerant of subscription shapes)
        const candidates = [];
        // Common fields used by various payment providers / backends
        const fieldsToInspect = [
          'selectedModule',
          'module',
          'notes',
          'planName',
          'productName',
          'subscriptionName',
          'displayName',
          'description',
          'packageName',
          'item',
        ];

        for (const f of fieldsToInspect) {
          if (sub[f]) candidates.push(sub[f]);
        }

        // If notes contains JSON with nested selectedModule, try to parse and extract it
        if (sub.notes && typeof sub.notes === 'string') {
          try {
            const parsed = JSON.parse(sub.notes);
            if (parsed && parsed.selectedModule) candidates.push(parsed.selectedModule);
            if (parsed && parsed.module) candidates.push(parsed.module);
          } catch {
            // notes might be plain text; keep as-is
          }
        }

        // Try mapping each candidate to a module key
        for (const raw of candidates) {
          const n = normalize(raw);
          // direct mapping
          if (mapping[n]) return mapping[n];

          // try relaxed matching: check whether a module key or module name is contained in the normalized string
          for (const k of Object.keys(MODULE_CONFIGS)) {
            const moduleName = MODULE_CONFIGS[k].name.toLowerCase();
            if (
              n.includes(k) ||
              k.includes(n) ||
              moduleName.includes(n) ||
              n.includes(moduleName)
            ) {
              return k;
            }
          }

          // try token-based matching (split words and check for key/name tokens)
          const tokens = n.split(/[^a-z0-9]+/).filter(Boolean);
          for (const token of tokens) {
            if (mapping[token]) return mapping[token];
            for (const k of Object.keys(MODULE_CONFIGS)) {
              if (k.includes(token) || MODULE_CONFIGS[k].name.toLowerCase().includes(token)) {
                return k;
              }
            }
          }
        }

        // fallback to module field raw value
        if (sub.module) {
          const nm = normalize(sub.module);
          if (mapping[nm]) return mapping[nm];
          if (MODULE_CONFIGS[nm]) return nm;
        }

        return null;
      })
      .filter(Boolean);

    // remove duplicates
    const unique = Array.from(new Set(modules));
    return unique;
  }

  /**
   * Get trial start date for STARTER plan users
   */
  getTrialStartDate() {
    if (this.currentPlan !== 'STARTER') return null;
    
    // If user has subscriptions, check for any STARTER plan creation date
    if (this.userSubscription && Array.isArray(this.userSubscription)) {
      const starterSub = this.userSubscription.find(sub => sub.planType === 'STARTER');
      if (starterSub) {
        return new Date(starterSub.createdAt || starterSub.startDate);
      }
    }
    
    // For users without subscriptions (new users), start trial from current date
    // This ensures they get full trial access
    // console.log('AccessController: No STARTER subscription found, starting trial from current date');
    return new Date();
  }

  /**
   * Check if STARTER plan trial is still valid (within 7 days)
   */
  isTrialValid() {
    if (this.currentPlan !== 'STARTER') return true; // Non-starter plans don't have trial limits
    
    // If no trial start date, allow trial (new users)
    if (!this.trialStartDate) {
      // console.log('AccessController: No trial start date, allowing trial access');
      return true;
    }
    
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate - this.trialStartDate) / (1000 * 60 * 60 * 24));
    const isValid = daysDifference <= 7;
    
    // console.log('AccessController: Trial validation - days difference:', daysDifference, 'isValid:', isValid);
    return isValid;
  }

  /**
   * Get remaining trial days for STARTER plan
   */
  getRemainingTrialDays() {
    if (this.currentPlan !== 'STARTER') return null;
    
    // If no trial start date, give full 7 days (new users)
    if (!this.trialStartDate) {
      // console.log('AccessController: No trial start date, returning 7 days');
      return 7;
    }
    
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate - this.trialStartDate) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, 7 - daysDifference);
    
    // console.log('AccessController: Remaining trial days:', remainingDays);
    return remainingDays;
  }

  /**
   * Check if user has access to a specific module
   */
  hasModuleAccess(moduleKey) {
    const module = MODULE_CONFIGS[moduleKey];
    if (!module) return false;

    const currentPlanIndex = PLAN_HIERARCHY.indexOf(this.currentPlan);
    const requiredPlanIndex = PLAN_HIERARCHY.indexOf(module.minPlan);

    // STARTER plan users can see all modules during trial period
    if (this.currentPlan === 'STARTER') {
      const hasAccess = this.isTrialValid();
      // console.log('AccessController: STARTER plan access to', moduleKey, ':', hasAccess);
      return hasAccess;
    }

    // For SOLO plans, check if user has purchased this specific module
    // OR if they have trial access to other modules
    if (this.currentPlan === 'SOLO') {
      // Check if user has purchased this specific module
      const hasPurchasedModule = this.soloModules.includes(moduleKey);
      
      if (hasPurchasedModule) {
        return currentPlanIndex >= requiredPlanIndex;
      }
      
      // If not purchased, provide trial access to level 1 of other modules
      return true; // Trial access to other modules
    }

    // PRO and INSTITUTIONAL have access to all modules
    return currentPlanIndex >= requiredPlanIndex;
  }

  /**
   * Check if user has access to a specific level within a module
   */
  hasLevelAccess(moduleKey, levelNumber) {
    if (!this.hasModuleAccess(moduleKey)) return false;

    const module = MODULE_CONFIGS[moduleKey];
    const level = module?.levels?.[levelNumber];
    
    // PRO and INSTITUTIONAL plans have access to ALL levels of ALL modules
    // (even if the level is not explicitly defined in MODULE_CONFIGS)
    if (this.currentPlan === 'PRO' || this.currentPlan === 'INSTITUTIONAL') {
      return true;
    }
    
    // SOLO plan users have access to ALL levels of their purchased modules
    // OR only level 1 of other modules (trial access)
    if (this.currentPlan === 'SOLO') {
      const hasPurchasedModule = this.soloModules.includes(moduleKey);
      
      if (hasPurchasedModule) {
        return true; // Full access to all levels of purchased modules
      } else {
        return levelNumber === 1; // Only level 1 access for non-purchased modules
      }
    }
    
    // For other plans, the level must exist in MODULE_CONFIGS
    if (!level) return false;

    // STARTER plan users can see ALL levels during trial period
    // but only level 1 games will be unlocked (handled by hasGameLevelAccess)
    if (this.currentPlan === 'STARTER') {
      return this.isTrialValid(); // Show all levels during trial
    }

    // For any other plans, check individual level requirements
    const currentPlanIndex = PLAN_HIERARCHY.indexOf(this.currentPlan);
    const requiredPlanIndex = PLAN_HIERARCHY.indexOf(level.minPlan);
    return currentPlanIndex >= requiredPlanIndex;
  }

  /**
   * Check if user has access to games for a specific module
   */
  hasGameAccess(moduleKey) {
    // STARTER plan users can access games for all modules (level 1 only) during trial
    if (this.currentPlan === 'STARTER') {
      const hasAccess = this.hasModuleAccess(moduleKey) && this.isTrialValid();
      // console.log('AccessController: STARTER plan game access to', moduleKey, ':', hasAccess);
      return hasAccess;
    }

    // SOLO plan users have full game access to their selected module
    // AND trial game access (level 1) to other modules
    if (this.currentPlan === 'SOLO') {
      return this.hasModuleAccess(moduleKey); // This now includes trial access to other modules
    }

    // Other plans follow normal module access rules
    return this.hasModuleAccess(moduleKey);
  }

  /**
   * Check if user has access to games at a specific level
   */
  hasGameLevelAccess(moduleKey, levelNumber) {
    if (!this.hasGameAccess(moduleKey)) return false;
    
    // STARTER plan users can only access level 1 games during trial
    if (this.currentPlan === 'STARTER') {
      return levelNumber === 1 && this.isTrialValid();
    }
    
    // For other plans, check level access
    return this.hasLevelAccess(moduleKey, levelNumber);
  }

  /**
   * Check if user has access to specific features
   */
  hasFeatureAccess(feature) {
    const featureRequirements = {
      games: 'STARTER',
      notes: 'STARTER',
      basic_assessments: 'STARTER',
      advanced_assessments: 'SOLO',
      progress_tracking: 'SOLO',
      certificates: 'SOLO', // Now available from SOLO plan
      ai_assessment: 'PRO',
      ai_personalization: 'PRO',
      ai_homework: 'PRO',
      live_sessions: 'INSTITUTIONAL',
      bulk_management: 'INSTITUTIONAL',
      custom_content: 'INSTITUTIONAL',
      priority_support: 'INSTITUTIONAL'
    };

    const requiredPlan = featureRequirements[feature];
    if (!requiredPlan) return false;

    const currentPlanIndex = PLAN_HIERARCHY.indexOf(this.currentPlan);
    const requiredPlanIndex = PLAN_HIERARCHY.indexOf(requiredPlan);

    return currentPlanIndex >= requiredPlanIndex;
  }

  /**
   * Get accessible modules for current user
   */
  getAccessibleModules() {
    return Object.entries(MODULE_CONFIGS).filter(([key]) => 
      this.hasModuleAccess(key)
    ).map(([key, config]) => ({
      key,
      ...config,
      hasAccess: true,
      isPurchased: this.isModulePurchased(key),
      accessType: this.getModuleAccessType(key),
      canPurchase: this.canPurchaseModule(key),
      purchaseStatus: this.getModulePurchaseStatus(key)
    }));
  }

  /**
   * Check if a specific module is purchased (for SOLO users)
   */
  isModulePurchased(moduleKey) {
    if (this.currentPlan === 'PRO' || this.currentPlan === 'INSTITUTIONAL') {
      return true; // All modules are included in these plans
    }
    
    if (this.currentPlan === 'SOLO') {
      return this.soloModules.includes(moduleKey);
    }
    
    return false; // STARTER users don't have purchased modules
  }

  /**
   * Get the type of access for a module (purchased, trial, or premium)
   */
  getModuleAccessType(moduleKey) {
    if (this.currentPlan === 'PRO' || this.currentPlan === 'INSTITUTIONAL') {
      return 'premium';
    }
    
    if (this.currentPlan === 'SOLO' && this.soloModules.includes(moduleKey)) {
      return 'purchased';
    }
    
    if (this.hasModuleAccess(moduleKey)) {
      return 'trial';
    }
    
    return 'locked';
  }

  /**
   * Get modules that user has purchased with SOLO plans
   */
  getPurchasedModules() {
    if (this.currentPlan !== 'SOLO') {
      return [];
    }
    
    return this.soloModules.map(moduleKey => ({
      key: moduleKey,
      ...MODULE_CONFIGS[moduleKey],
      accessType: 'purchased'
    })).filter(module => module.name); // Filter out invalid modules
  }

  /**
   * Get modules available for purchase (not yet purchased SOLO modules)
   */
  getAvailableForPurchase() {
    if (this.currentPlan === 'PRO' || this.currentPlan === 'INSTITUTIONAL') {
      return []; // No need to purchase individual modules
    }
    
    return Object.entries(MODULE_CONFIGS).filter(([key]) => 
      !this.soloModules.includes(key)
    ).map(([key, config]) => ({
      key,
      ...config,
      hasAccess: false,
      canPurchase: true,
      isPurchased: false,
      requiredPlan: 'SOLO'
    }));
  }

  /**
   * Get all modules with their purchase and access status
   */
  getAllModulesWithStatus() {
    return Object.entries(MODULE_CONFIGS).map(([key, config]) => {
      const isPurchased = this.isModulePurchased(key);
      const hasAccess = this.hasModuleAccess(key);
      const accessType = this.getModuleAccessType(key);
      
      return {
        key,
        ...config,
        isPurchased,
        hasAccess,
        accessType,
        canPurchase: this.canPurchaseModule(key),
        purchaseStatus: this.getModulePurchaseStatus(key)
      };
    });
  }

  /**
   * Check if a module can be purchased
   */
  canPurchaseModule(moduleKey) {
    // PRO and INSTITUTIONAL users don't need to purchase individual modules
    if (this.currentPlan === 'PRO' || this.currentPlan === 'INSTITUTIONAL') {
      return false;
    }
    
    // Can't purchase if already purchased
    if (this.soloModules.includes(moduleKey)) {
      return false;
    }
    
    // STARTER and SOLO users can purchase modules they don't have
    return true;
  }

  /**
   * Get detailed purchase status for a module
   */
  getModulePurchaseStatus(moduleKey) {
    if (this.currentPlan === 'PRO' || this.currentPlan === 'INSTITUTIONAL') {
      return {
        status: 'included',
        message: 'Included in your plan',
        actionRequired: false
      };
    }
    
    if (this.soloModules.includes(moduleKey)) {
      return {
        status: 'purchased',
        message: 'Already purchased',
        actionRequired: false
      };
    }
    
    return {
      status: 'available',
      message: 'Available for purchase',
      actionRequired: true
    };
  }

  /**
   * Get locked modules (require upgrade)
   */
  getLockedModules() {
    return Object.entries(MODULE_CONFIGS).filter(([key]) => 
      !this.hasModuleAccess(key)
    ).map(([key, config]) => ({
      key,
      ...config,
      hasAccess: false,
      requiredPlan: config.minPlan
    }));
  }

  /**
   * Get accessible levels within a module
   */
  getAccessibleLevels(moduleKey) {
    const module = MODULE_CONFIGS[moduleKey];
    if (!module || !this.hasModuleAccess(moduleKey)) return [];

    return Object.entries(module.levels).filter(([levelNum]) => 
      this.hasLevelAccess(moduleKey, parseInt(levelNum))
    ).map(([levelNum, levelConfig]) => ({
      number: parseInt(levelNum),
      ...levelConfig,
      hasAccess: true
    }));
  }

  /**
   * Get locked levels within a module
   */
  getLockedLevels(moduleKey) {
    const module = MODULE_CONFIGS[moduleKey];
    if (!module) return [];

    return Object.entries(module.levels).filter(([levelNum]) => 
      !this.hasLevelAccess(moduleKey, parseInt(levelNum))
    ).map(([levelNum, levelConfig]) => ({
      number: parseInt(levelNum),
      ...levelConfig,
      hasAccess: false,
      requiredPlan: levelConfig.minPlan
    }));
  }

  /**
   * Get upgrade suggestions
   */
  getUpgradeSuggestions(targetModule = null, targetLevel = null) {
    if (targetModule) {
      const module = MODULE_CONFIGS[targetModule];
      
      // Check if user already has access
      if (this.hasModuleAccess(targetModule) && 
          (!targetLevel || this.hasLevelAccess(targetModule, targetLevel))) {
        return null; // No upgrade needed
      }

      // For SOLO plan users, suggest purchasing the specific module
      if (this.currentPlan === 'SOLO') {
        // If they don't have this module, suggest purchasing it
        if (!this.soloModules.includes(targetModule)) {
          return {
            type: 'purchase_module',
            currentPlan: this.currentPlan,
            targetModule: targetModule,
            moduleName: module.name,
            recommendedAction: 'Purchase SOLO plan for this module',
            benefits: [
              `Full access to all levels of ${module.name}`,
              'Completion certificates for this module',
              'Progress tracking',
              'Downloadable content'
            ],
            cost: 'Additional SOLO plan purchase',
            alternative: {
              type: 'upgrade_to_pro',
              plan: 'PRO',
              benefits: this.getPlanBenefits('PRO'),
              note: 'Get access to ALL modules with PRO plan'
            }
          };
        }
      }

      // For STARTER users, suggest SOLO for specific module or PRO for all
      if (this.currentPlan === 'STARTER') {
        return {
          type: 'upgrade_options',
          currentPlan: this.currentPlan,
          targetModule: targetModule,
          moduleName: module.name,
          options: [
            {
              type: 'purchase_solo',
              plan: 'SOLO',
              scope: 'single_module',
              benefits: [
                `Full access to ${module.name}`,
                'All levels and activities',
                'Completion certificates',
                'Progress tracking'
              ],
              cost: 'SOLO plan for one module'
            },
            {
              type: 'upgrade_to_pro',
              plan: 'PRO',
              scope: 'all_modules',
              benefits: this.getPlanBenefits('PRO'),
              cost: 'PRO plan for all modules',
              recommended: this.soloModules.length >= 2 // Recommend PRO if user already has 2+ SOLO modules
            }
          ]
        };
      }

      // For users needing PRO features (AI, advanced features)
      if (targetLevel && module?.levels?.[targetLevel]) {
        const levelRequiredPlan = module.levels[targetLevel].minPlan;
        
        if (levelRequiredPlan === 'PRO' || levelRequiredPlan === 'INSTITUTIONAL') {
          return {
            type: 'upgrade_to_premium',
            currentPlan: this.currentPlan,
            recommendedPlan: levelRequiredPlan,
            reason: 'advanced_features',
            benefits: this.getPlanBenefits(levelRequiredPlan),
            unlockedModules: this.getUnlockedModulesForPlan(levelRequiredPlan),
            note: 'Required for advanced features and AI-powered content'
          };
        }
      }
    }

    return null; // No upgrade needed
  }

  /**
   * Calculate upgrade pricing when moving from multiple SOLO plans to PRO
   */
  calculateUpgradePrice(targetPlan = 'PRO') {
    const SOLO_PRICE = 199;
    const PRO_PRICE = 1433;
    
    if (targetPlan !== 'PRO') {
      return { totalPrice: 0, discount: 0, soloCount: 0 };
    }
    
    // Count number of active SOLO subscriptions
    const activeSoloCount = this.soloModules.length;
    
    // Calculate discount based on existing SOLO purchases
    const soloDiscount = activeSoloCount * SOLO_PRICE;
    const finalPrice = Math.max(0, PRO_PRICE - soloDiscount);
    
    return {
      totalPrice: finalPrice,
      originalPrice: PRO_PRICE,
      soloDiscount: soloDiscount,
      soloCount: activeSoloCount,
      savings: soloDiscount,
      message: activeSoloCount > 0 
        ? `You save ₹${soloDiscount} from your ${activeSoloCount} SOLO plan${activeSoloCount > 1 ? 's' : ''}!`
        : 'Regular PRO plan pricing'
    };
  }

  /**
   * Check if user qualifies for upgrade pricing
   */
  qualifiesForUpgradePrice(targetPlan = 'PRO') {
    return this.currentPlan === 'SOLO' && this.soloModules.length > 0 && targetPlan === 'PRO';
  }

  /**
   * Get plan benefits
   */
  getPlanBenefits(planType) {
    const benefits = {
      STARTER: [
        'Access to ALL modules for 7 days',
        'Level 1 games for each module',
        'Basic notes and content',
        'Community access'
      ],
      SOLO: [
        'Full access to selected premium module',
        'All levels and activities for purchased module',
        'Trial access to Challenge 1 of Level 1 in other modules',
        'Completion certificates for purchased modules',
        'Progress tracking',
        'Downloadable content',
        'Can purchase multiple SOLO plans for different modules'
      ],
      PRO: [
        'Access to all modules',
        'AI-powered assessments',
        'Completion certificates for all modules',
        'Advanced analytics',
        'Priority support',
        '3 months access',
        'Better value than multiple SOLO plans'
      ],
      INSTITUTIONAL: [
        'Everything in PRO',
        'Bulk user management',
        'Live expert sessions',
        'Custom content creation',
        'Dedicated support'
      ]
    };

    return benefits[planType] || [];
  }

  /**
   * Get modules that would be unlocked with a specific plan
   */
  getUnlockedModulesForPlan(planType) {
    const planIndex = PLAN_HIERARCHY.indexOf(planType);
    
    return Object.entries(MODULE_CONFIGS).filter(([, config]) => {
      const requiredIndex = PLAN_HIERARCHY.indexOf(config.minPlan);
      return requiredIndex <= planIndex;
    }).map(([key, config]) => ({
      key,
      name: config.name,
      icon: config.icon
    }));
  }

  /**
   * Get features that would be unlocked with a specific plan
   */
  getUnlockedFeaturesForPlan() {
    const features = [];
    
    Object.entries(FEATURE_CATEGORIES).forEach(([, categoryInfo]) => {
      categoryInfo.features.forEach(feature => {
        if (this.hasFeatureAccess(feature)) {
          features.push({
            name: feature,
            category: categoryInfo.name
          });
        }
      });
    });

    return features;
  }

  /**
   * Check if content should show upgrade prompt
   */
  shouldShowUpgradePrompt(moduleKey, levelNumber = null) {
    if (!moduleKey) return false;

    if (!this.hasModuleAccess(moduleKey)) return true;
    
    if (levelNumber && !this.hasLevelAccess(moduleKey, levelNumber)) return true;

    return false;
  }

  /**
   * Generate access status object for UI components
   */
  getAccessStatus(moduleKey, levelNumber = null) {
    const hasModuleAccess = this.hasModuleAccess(moduleKey);
    const hasLevelAccess = levelNumber ? this.hasLevelAccess(moduleKey, levelNumber) : true;
    
    return {
      hasAccess: hasModuleAccess && hasLevelAccess,
      needsUpgrade: !hasModuleAccess || !hasLevelAccess,
      currentPlan: this.currentPlan,
      requiredPlan: this.getRequiredPlan(moduleKey, levelNumber),
      upgradeInfo: this.getUpgradeSuggestions(moduleKey, levelNumber)
    };
  }

  /**
   * Get minimum required plan for access
   */
  getRequiredPlan(moduleKey, levelNumber = null) {
    const module = MODULE_CONFIGS[moduleKey];
    if (!module) return 'SOLO'; // Default to SOLO for individual module purchase

    // For SOLO users accessing their purchased modules, SOLO plan is sufficient for all levels
    if (levelNumber && this.currentPlan === 'SOLO' && this.soloModules.includes(moduleKey)) {
      return 'SOLO';
    }

    // For PRO/INSTITUTIONAL users, their current plan is always sufficient for any level
    if (levelNumber && (this.currentPlan === 'PRO' || this.currentPlan === 'INSTITUTIONAL')) {
      return this.currentPlan;
    }

    // For specific levels that require PRO features (AI, advanced analytics)
    if (levelNumber && module.levels?.[levelNumber]) {
      const levelRequiredPlan = module.levels[levelNumber].minPlan;
      if (levelRequiredPlan === 'PRO' || levelRequiredPlan === 'INSTITUTIONAL') {
        return levelRequiredPlan;
      }
    }

    // For basic module access, SOLO plan is sufficient for individual purchase
    return 'SOLO';
  }
}

/**
 * Hook for React components to use access control
 */
export const useAccessControl = (userSubscription = null, selectedModule = null) => {
  // console.log('useAccessControl: Called with userSubscription:', userSubscription);
  // console.log('useAccessControl: Called with selectedModule:', selectedModule);
  
  // Use React.useMemo to recreate the AccessController only when dependencies change
  const accessController = React.useMemo(() => {
    // console.log('useAccessControl: Creating new AccessController');
    return new AccessController(userSubscription, selectedModule);
  }, [userSubscription, selectedModule]);

  // Use React.useMemo for the return object to avoid recreating it on every render
  return React.useMemo(() => {
    // console.log('useAccessControl: Returning access control methods');
    return {
      currentPlan: accessController.currentPlan,
      soloModules: accessController.soloModules,
      isTrialValid: () => accessController.isTrialValid(),
      getRemainingTrialDays: () => accessController.getRemainingTrialDays(),
      hasModuleAccess: (moduleKey) => accessController.hasModuleAccess(moduleKey),
      hasLevelAccess: (moduleKey, levelNumber) => accessController.hasLevelAccess(moduleKey, levelNumber),
      hasGameAccess: (moduleKey) => accessController.hasGameAccess(moduleKey),
      hasGameLevelAccess: (moduleKey, levelNumber) => accessController.hasGameLevelAccess(moduleKey, levelNumber),
      hasFeatureAccess: (feature) => accessController.hasFeatureAccess(feature),
      isModulePurchased: (moduleKey) => accessController.isModulePurchased(moduleKey),
      canPurchaseModule: (moduleKey) => accessController.canPurchaseModule(moduleKey),
      getModuleAccessType: (moduleKey) => accessController.getModuleAccessType(moduleKey),
      getModulePurchaseStatus: (moduleKey) => accessController.getModulePurchaseStatus(moduleKey),
      getPurchasedModules: () => accessController.getPurchasedModules(),
      getAvailableForPurchase: () => accessController.getAvailableForPurchase(),
      getAllModulesWithStatus: () => accessController.getAllModulesWithStatus(),
      getAccessibleModules: () => accessController.getAccessibleModules(),
      getLockedModules: () => accessController.getLockedModules(),
      getAccessibleLevels: (moduleKey) => accessController.getAccessibleLevels(moduleKey),
      getLockedLevels: (moduleKey) => accessController.getLockedLevels(moduleKey),
      getUpgradeSuggestions: (moduleKey, levelNumber) => accessController.getUpgradeSuggestions(moduleKey, levelNumber),
      shouldShowUpgradePrompt: (moduleKey, levelKey) => accessController.shouldShowUpgradePrompt(moduleKey, levelKey),
      getAccessStatus: (moduleKey, levelNumber) => accessController.getAccessStatus(moduleKey, levelNumber),
      getPlanBenefits: (planType) => accessController.getPlanBenefits(planType),
      calculateUpgradePrice: (targetPlan) => accessController.calculateUpgradePrice(targetPlan),
      qualifiesForUpgradePrice: (targetPlan) => accessController.qualifiesForUpgradePrice(targetPlan)
    };
  }, [accessController]);
};

// Export configurations and utilities
export {
  MODULE_CONFIGS,
  FEATURE_CATEGORIES,
  PLAN_HIERARCHY,
  AccessController
};
