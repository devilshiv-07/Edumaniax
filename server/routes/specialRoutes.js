import express from 'express';
import { 
  createInstitutionalInquiry,
  getInquiries, 
  updateInquiry,
  getSalesAnalytics,
  handlePaymentWebhook,
  createFreeTrialRequest,
  getFreeTrialRequests,
  updateFreeTrialStatus,
  getNotificationsByType,
  deleteInquiry,
  deleteFreeTrialRequest,
  verifyDataIntegrity,
  getAllUsers,
  
} from '../controllers/salesController.js';
import { 
  salesLogin,
  createSalesUser
} from '../controllers/salesAuthController.js';
import {
  getNotifications,
  markNotificationsAsRead,
  getUnreadCount
} from '../controllers/notificationController.js';
import authenticateUser from '../middlewares/authMiddleware.js';
import checkRole from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public route for creating inquiries (from contact form)
router.post('/inquiries', createInstitutionalInquiry);

// Public route for creating free trial requests
router.post('/free-trial', createFreeTrialRequest);

// Sales authentication routes
router.post('/login', salesLogin);
router.post('/users', authenticateUser, checkRole(['ADMIN']), createSalesUser);

// Notification routes
router.get('/notifications', authenticateUser, checkRole(['ADMIN', 'SALES']), getNotifications);
router.post('/notifications/read', authenticateUser, checkRole(['ADMIN', 'SALES']), markNotificationsAsRead);
router.get('/notifications/unread-count', authenticateUser, checkRole(['ADMIN', 'SALES']), getUnreadCount);

// Protected routes requiring authentication and sales/admin role
router.get('/inquiries', authenticateUser, checkRole(['ADMIN', 'SALES']), getInquiries);
router.put('/inquiries/:id', authenticateUser, checkRole(['ADMIN', 'SALES']), updateInquiry);
router.delete('/inquiries/:id', authenticateUser, checkRole(['ADMIN', 'SALES']), deleteInquiry);
router.get('/analytics', authenticateUser, checkRole(['ADMIN', 'SALES']), getSalesAnalytics);

// Free trial routes
router.get('/free-trial', authenticateUser, checkRole(['ADMIN', 'SALES']), getFreeTrialRequests);
router.put('/free-trial/:id', authenticateUser, checkRole(['ADMIN', 'SALES']), updateFreeTrialStatus);
router.delete('/free-trial/:id', authenticateUser, checkRole(['ADMIN', 'SALES']), deleteFreeTrialRequest);

// Enhanced notifications route
router.get('/notifications-by-type', authenticateUser, checkRole(['ADMIN', 'SALES']), getNotificationsByType);


router.get('/users', authenticateUser, checkRole(['ADMIN', 'SALES']), getAllUsers);


// Data verification route (for debugging)
router.get('/verify-data', authenticateUser, checkRole(['ADMIN', 'SALES']), verifyDataIntegrity);

// Webhook endpoint for payment notifications
router.post('/payment-webhook', handlePaymentWebhook);

export default router;
