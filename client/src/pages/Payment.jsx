import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, Loader2, ArrowLeft, Shield, Building, Users } from 'lucide-react';
import usePayment from '../hooks/usePayment';
import { forceRefreshSubscriptions } from '../utils/subscriptionRefresh';
import { useAccessControl } from '../utils/accessControl';

const PLAN_DETAILS = {
  STARTER: {
    name: 'Starter Plan',
    price: 0,
    duration: '7 Days Free Trial',
    features: [
      'Access to 1 free game/module',
      'Notes for the selected module',
      'Access to basic learning tools',
      'Limited to 7 days trial period'
    ]
  },
  SOLO: {
    name: 'Solo Plan',
    price: 199,
    duration: '1 Month',
    features: [
      'Access to 1 premium module of choice',
      'Notes for the selected module',
      'Interactive activities and assessments',
      'Completion certificates'
    ]
  },
  PRO: {
    name: 'Pro Plan',
    price: 1433,
    duration: '3 Months',
    features: [
      'Access to all premium modules',
      'Notes for every module',
      'All interactive games and assessments',
      'AI powered personalized assessment',
      'Completion certificates for all modules'
    ],
    popular: true
  },
  INSTITUTIONAL: {
    name: 'Institutional Plan',
    price: 'Custom',
    duration: 'Custom',
    features: [
      'Access for 30+ users',
      'All modules notes & games included',
      'Custom onboarding & priority support',
      'Live Lectures by SME',
      'AI powered personalized assessment',
      'Completion certificates'
    ]
  }
};

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPaymentEnabled, loading, error, createOrder, processPayment } = usePayment();
  
  const [selectedPlan, setSelectedPlan] = useState('PRO');
  const [selectedModule, setSelectedModule] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [isAdditionalPurchase, setIsAdditionalPurchase] = useState(false);
  
  // Access control hook
  const accessControl = useAccessControl(userSubscriptions);
  
  const AVAILABLE_MODULES = [
    'Fundamentals of Finance',
    'Computer Science',
    'Fundamentals of Law',
    'Communication Mastery',
    'Entrepreneurship Bootcamp',
    'Digital Marketing Pro',
    'Leadership & Adaptability',
    'Environmental Sustainability',
    'Wellness & Mental Health'
  ];

  // Get available modules for SOLO plan (filter out already purchased for additional purchases)
  const getAvailableModulesForSelection = () => {
    // If accessControl is available, use it to filter out already purchased modules
    if (accessControl) {
      // If user is explicitly adding an additional module, rely on accessControl.getAvailableForPurchase
      if (isAdditionalPurchase && typeof accessControl.getAvailableForPurchase === 'function') {
        const availableForPurchase = accessControl.getAvailableForPurchase();
        return availableForPurchase.map((module) => module.name || module.key);
      }

      // Otherwise, filter the full list to remove already purchased modules
      if (typeof accessControl.getPurchasedModules === 'function') {
        const purchased = accessControl.getPurchasedModules().map((m) => m.name || m.key);
        return AVAILABLE_MODULES.filter((name) => !purchased.includes(name));
      }
    }

    // Fallback to the static list
    return AVAILABLE_MODULES;
  };

  // Get plan from URL params or default to PRO
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const planFromUrl = urlParams.get('plan');
    const additionalFlag = urlParams.get('additional');
    
    if (planFromUrl && PLAN_DETAILS[planFromUrl]) {
      setSelectedPlan(planFromUrl);
      
      // Check if this is an additional SOLO purchase
      if (additionalFlag === 'true' && planFromUrl === 'SOLO') {
        setIsAdditionalPurchase(true);
      }
      
      // If the user is coming for an institutional plan, prepare the contact form
      if (planFromUrl === 'INSTITUTIONAL') {
        // We'll show the contact form instead of the payment form
        console.log('Institutional plan selected - showing contact form');
      }
    }
  }, [location]);

  // Get user info from localStorage or context
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUserInfo(JSON.parse(userData));
    }
  }, []);

  // Fetch user subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (userInfo.id) {
        try {
          setSubscriptionsLoading(true);
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/payment/subscriptions/${userInfo.id}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUserSubscriptions(data.subscriptions || []);
            }
          } else {
            console.error('Failed to fetch subscriptions');
            setUserSubscriptions([]);
          }
        } catch (error) {
          console.error('Error fetching subscriptions:', error);
          setUserSubscriptions([]);
        } finally {
          setSubscriptionsLoading(false);
        }
      } else {
        setSubscriptionsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [userInfo.id]);

  // Function to get button text and action based on user's current plan and selected plan
  const getPlanButtonInfo = (planKey) => {
    if (subscriptionsLoading) {
      return { text: 'Loading...', disabled: true, action: 'loading' };
    }

    const plan = PLAN_DETAILS[planKey];
    
    // For INSTITUTIONAL plan, always show "Request Information"
    if (planKey === 'INSTITUTIONAL') {
      return { text: 'Request Information', disabled: false, action: 'contact' };
    }

    // Check if user already has this exact plan
    const hasThisPlan = accessControl.currentPlan === planKey;
    
    // For SOLO plans - special logic for multiple module purchases
    if (planKey === 'SOLO') {
      // If user is already on SOLO plan, show "Purchase Another Module"
      if (accessControl.currentPlan === 'SOLO') {
        const availableModules = accessControl.getAvailableForPurchase();
        if (availableModules.length > 0) {
          return { 
            text: 'Purchase Another Module', 
            disabled: false, 
            action: 'purchase_additional_module',
            subtitle: `${availableModules.length} modules available`
          };
        } else {
          return { 
            text: 'All Modules Purchased', 
            disabled: true, 
            action: 'all_purchased',
            subtitle: 'Consider upgrading to PRO for AI features'
          };
        }
      }
      
      // For non-SOLO users, show regular purchase option
      return { text: 'Choose SOLO Plan', disabled: false, action: 'purchase' };
    }

    // For PRO and STARTER plans
    if (hasThisPlan) {
      return { text: 'Current Plan', disabled: true, action: 'current' };
    }

    // Check if this is an upgrade or downgrade
    const currentPlanIndex = ['STARTER', 'SOLO', 'PRO', 'INSTITUTIONAL'].indexOf(accessControl.currentPlan);
    const targetPlanIndex = ['STARTER', 'SOLO', 'PRO', 'INSTITUTIONAL'].indexOf(planKey);
    
    if (targetPlanIndex > currentPlanIndex) {
      return { text: `Upgrade to ${plan.name}`, disabled: false, action: 'upgrade' };
    } else if (targetPlanIndex < currentPlanIndex) {
      return { text: 'Downgrade', disabled: true, action: 'downgrade' };
    }
    
    return { text: `Choose ${plan.name}`, disabled: false, action: 'purchase' };
  };

  // Show loading only when payment feature status is being checked
  if (isPaymentEnabled === null && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-4 border-green-400">
          <Loader2 className="w-16 h-16 text-green-500 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-green-800 mb-2">Loading Payment...</h1>
          <p className="text-green-700 mb-4">
            Please wait while we prepare your payment options.
          </p>
        </div>
      </div>
    );
  }

  // Check if payment feature is disabled - only after loading is complete
  if (!loading && !isPaymentEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-4 border-gray-400">
          <XCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Feature Disabled</h1>
          <p className="text-gray-700 mb-4">
            Payment functionality is currently not available.
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-full"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  // Show loading while subscriptions are being fetched (only if we have user info)
  if (userInfo.id && subscriptionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-4 border-green-400">
          <Loader2 className="w-16 h-16 text-green-500 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-green-800 mb-2">Loading Your Plans...</h1>
          <p className="text-green-700 mb-4">
            Please wait while we fetch your subscription details.
          </p>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!userInfo.id) {
      alert('Please login to continue with payment');
      navigate('/login');
      return;
    }

    if (selectedPlan === 'STARTER') {
      alert('Starter plan is free! You already have access.');
      navigate('/dashboard');
      return;
    }

    // INSTITUTIONAL plan users are directed to the contact form which is already displayed
    // instead of showing the payment form when selectedPlan === 'INSTITUTIONAL'
    if (selectedPlan === 'INSTITUTIONAL') {
      return; // Don't continue with payment processing
    }
    
    // Require module selection for SOLO plan
    if (selectedPlan === 'SOLO' && !selectedModule) {
      alert('Please select a module for your SOLO plan');
      return;
    }

    try {
      setPaymentStatus('processing');
      
      // Create order - pass selectedModule only for SOLO plan
      const orderData = await createOrder(
        userInfo.id, 
        selectedPlan, 
        selectedPlan === 'SOLO' ? selectedModule : null
      );
      
      // Process payment using Razorpay
      await processPayment(
        orderData,
        async () => {
          setPaymentStatus('success');
          
          // Force refresh subscription data using utility
          if (userInfo.id) {
            try {
              await forceRefreshSubscriptions(userInfo.id);
            } catch (error) {
              console.error('Error refreshing subscriptions after payment:', error);
            }
          }
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        },
        (error) => {
          console.error('Payment error:', error);
          setPaymentStatus('failed');
        }
      );
      
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentStatus('failed');
    }
  };

  // Calculate pricing based on user's current subscriptions
  const calculateOrderPrice = () => {
    const basePlan = PLAN_DETAILS[selectedPlan];
    
    // For PRO plan upgrades from SOLO, apply discount (only if accessControl is ready)
    if (selectedPlan === 'PRO' && accessControl && accessControl.qualifiesForUpgradePrice && accessControl.qualifiesForUpgradePrice('PRO')) {
      const upgradePrice = accessControl.calculateUpgradePrice('PRO');
      return {
        ...basePlan,
        originalPrice: upgradePrice.originalPrice,
        price: upgradePrice.totalPrice,
        discount: upgradePrice.soloDiscount,
        soloCount: upgradePrice.soloCount,
        isUpgrade: true,
        savingsMessage: upgradePrice.message
      };
    }
    
    // Regular pricing for all other cases
    return {
      ...basePlan,
      originalPrice: basePlan.price,
      isUpgrade: false
    };
  };

  const currentPlan = calculateOrderPrice();

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-4 border-green-400">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-800 mb-2">Payment Successful! 🎉</h1>
          <p className="text-green-700 mb-4">
            Your {currentPlan.name} subscription is now active.
          </p>
          <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-red-200 to-red-300 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-4 border-red-400">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Payment Failed</h1>
          <p className="text-red-700 mb-4">
            {error || 'Something went wrong with your payment.'}
          </p>
          <button
            onClick={() => setPaymentStatus(null)}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Contact Form component for Institutional Plan
  const InstitutionalContactForm = () => {
    const [formData, setFormData] = useState({
      name: userInfo.name || '',
      email: userInfo.email || '',
      organizationalEmail: '',  // Added field for organizational email
      organization: '',
      phone: '',
      employees: '',
      message: ''
    });
    const [formStatus, setFormStatus] = useState(null); // null, 'sending', 'success', 'error'

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Basic validation for the organizational email
      if (!formData.organizationalEmail) {
        alert("Please provide your organization's email address");
        return;
      }
      
      // Validate if organization name is provided
      if (!formData.organization) {
        alert("Please provide your organization name");
        return;
      }
      
      setFormStatus('sending');
      
      try {
        // Send inquiry to backend with properly mapped field names
        const mappedData = {
          contactName: formData.name,
          contactEmail: formData.email,
          contactPhone: formData.phone,
          organizationName: formData.organization,
          organizationType: formData.employees ? 'Educational' : 'Other', // Default to Educational if not specified
          studentCount: formData.employees || '30+', // Default to 30+ if not specified
          message: formData.message,
          organizationalEmail: formData.organizationalEmail // Additional field
        };
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/special/inquiries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mappedData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to submit inquiry');
        }
        
        console.log('Institutional plan inquiry submitted:', data);
        setFormStatus('success');
        
        // Redirect after a delay
        setTimeout(() => navigate('/dashboard'), 3000);
      } catch (error) {
        console.error('Error submitting inquiry:', error);
        alert(`Failed to submit inquiry: ${error.message}`);
        setFormStatus(null);
      }
    };

    if (formStatus === 'success') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-4 border-green-400">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-800 mb-2">Request Sent Successfully!</h1>
            <p className="text-green-700 mb-4">
              Thank you for your interest in our Institutional Plan for <strong>{formData.organization}</strong>.
            </p>
            <p className="text-gray-700 mb-4">
              Our team will contact you shortly at <strong>{formData.organizationalEmail}</strong> to discuss your requirements and provide a customized solution.
            </p>
            <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 mb-4"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>

          {/* Contact Form Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Institutional Plan Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Institutional Plan</h2>
                
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-green-700 mb-4">Perfect for:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Building size={20} className="text-green-600 mt-1 shrink-0" />
                      <span>Schools and educational institutions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Building size={20} className="text-green-600 mt-1 shrink-0" />
                      <span>Corporate training programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users size={20} className="text-green-600 mt-1 shrink-0" />
                      <span>Organizations with 30+ users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={20} className="text-green-500 mt-1 shrink-0" />
                      <span>Custom learning requirements</span>
                    </li>
                  </ul>
                  
                  <div className="mt-4 bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Note:</strong> This plan requires verification of your organizational status. Our team will review your application and contact you for further details.
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-green-50 p-6 rounded-2xl border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Institutional Benefits:</h3>
                  <ul className="space-y-2 text-gray-700">
                    {PLAN_DETAILS.INSTITUTIONAL.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-500 mt-1 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Us</h2>
                <p className="text-gray-600 mb-6">
                  Please fill out this form to get a custom quote for your organization. Our team will contact you shortly.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      readOnly={!!userInfo.name}
                      className={`w-full p-3 border ${userInfo.name ? 'bg-gray-100' : 'border-gray-300'} rounded-lg ${!userInfo.name ? 'focus:ring-2 focus:ring-green-500 focus:border-green-500' : ''}`}
                      placeholder="Your name"
                    />
                    {userInfo.name && (
                      <p className="text-xs text-gray-500 mt-1">This field is pre-filled from your profile and cannot be changed</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      readOnly={!!userInfo.email}
                      className={`w-full p-3 border ${userInfo.email ? 'bg-gray-100' : 'border-gray-300'} rounded-lg ${!userInfo.email ? 'focus:ring-2 focus:ring-green-500 focus:border-green-500' : ''}`}
                      placeholder="Your email"
                    />
                    {userInfo.email && (
                      <p className="text-xs text-gray-500 mt-1">This field is pre-filled from your profile and cannot be changed</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="organizationalEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Organizational Email*
                    </label>
                    <input
                      type="email"
                      id="organizationalEmail"
                      name="organizationalEmail"
                      value={formData.organizationalEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Your organization's email (e.g., info@yourschool.edu)"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name*
                    </label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Your organization"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Your phone number"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Users/Students
                    </label>
                    <select
                      id="employees"
                      name="employees"
                      value={formData.employees}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select an option</option>
                      <option value="30-50">30-50 users</option>
                      <option value="51-100">51-100 users</option>
                      <option value="101-500">101-500 users</option>
                      <option value="500+">500+ users</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Tell us about your specific requirements..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={formStatus === 'sending'}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {formStatus === 'sending' ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Sending...
                      </>
                    ) : (
                      'Request Information'
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    By submitting this form, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the appropriate component based on the selected plan
  if (selectedPlan === 'INSTITUTIONAL') {
    return <InstitutionalContactForm />;
  }

  // Regular payment form for non-institutional plans
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-700">{currentPlan.name}</span>
                  <span className="font-bold text-gray-900">
                    {typeof currentPlan.originalPrice === 'number' ? `₹${currentPlan.originalPrice}` : currentPlan.originalPrice}
                  </span>
                </div>
                
                {/* Show discount for PRO upgrades */}
                {currentPlan.isUpgrade && currentPlan.discount > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Original Price</span>
                      <span className="text-gray-600">₹{currentPlan.originalPrice}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>SOLO Plan Discount ({currentPlan.soloCount} module{currentPlan.soloCount > 1 ? 's' : ''})</span>
                      <span>-₹{currentPlan.discount}</span>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {currentPlan.savingsMessage}
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">
                      {typeof currentPlan.price === 'number' ? `₹${currentPlan.price}` : currentPlan.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="mt-6 flex items-start gap-3 text-sm text-gray-600">
                <Shield size={20} className="text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Secure Payment</p>
                  <p>Your payment information is encrypted and secure. Powered by Razorpay.</p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="flex flex-col justify-center">
              <div className="text-center">
                <CreditCard className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {isAdditionalPurchase ? 'Add Another Module' : 'Ready to unlock premium features?'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isAdditionalPurchase 
                    ? `Add another module to your SOLO plan collection`
                    : `Start your ${currentPlan.name} subscription today`
                  }
                </p>

                {/* Module selection for SOLO plan */}
                {selectedPlan === 'SOLO' && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 text-left">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {isAdditionalPurchase ? 'Select Additional Module' : 'Select Your Module'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {isAdditionalPurchase 
                        ? 'Choose another module to add to your SOLO plan collection.'
                        : 'With the SOLO plan, you get access to one premium module of your choice.'
                      }
                    </p>
                    {isAdditionalPurchase && accessControl?.getPurchasedModules && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500">
                          Already purchased: {accessControl.getPurchasedModules().map(m => m.name).join(', ')}
                        </p>
                      </div>
                    )}
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">
                        {isAdditionalPurchase ? 'Select additional module...' : 'Select a module...'}
                      </option>
                      {getAvailableModulesForSelection().map((module) => (
                        <option key={module} value={module}>
                          {module}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading || paymentStatus === 'processing'}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading || paymentStatus === 'processing' ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Pay {typeof currentPlan.price === 'number' ? `₹${currentPlan.price}` : 'Now'}
                    </>
                  )}
                </button>

                {error && (
                  <p className="text-red-600 text-sm mt-2">{error}</p>
                )}

                <p className="text-xs text-gray-500 mt-4">
                  By proceeding, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">We accept</p>
          <div className="flex justify-center items-center gap-4">
            <img src="/pricingDesign/cards.svg" alt="Credit Cards" className="h-8" />
            <img src="/pricingDesign/UPI-Logo-vector.svg" alt="UPI" className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
