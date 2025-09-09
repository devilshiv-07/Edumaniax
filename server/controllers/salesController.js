import { prisma } from "../utils/prisma.js";
import { createNotification } from "./notificationController.js";

/**
 * Creates a new institutional inquiry and sends notification
 */
export const createInstitutionalInquiry = async (req, res) => {
  try {
    const {
      contactName,
      contactEmail,
      contactPhone,
      organizationName,
      organizationType,
      studentCount,
      message,
    } = req.body;

    // Validate required fields
    if (
      !contactName ||
      !contactEmail ||
      !contactPhone ||
      !organizationName ||
      !organizationType ||
      !studentCount ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create institutional inquiry
    const inquiry = await prisma.institutionalInquiry.create({
      data: {
        contactName,
        contactEmail,
        contactPhone,
        organizationName,
        organizationType,
        studentCount,
        message,
      },
    });

    // Create sales notification for institutional inquiry
    const notification = await prisma.salesNotification.create({
      data: {
        type: "INSTITUTIONAL_INQUIRY",
        message: `New institutional inquiry from ${contactName} at ${organizationName}`,
        data: JSON.stringify({
          inquiryId: inquiry.id,
          contactName,
          contactEmail,
          contactPhone,
          organizationName,
          organizationType,
          studentCount,
          message,
        }),
        inquiryId: inquiry.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: {
        inquiry,
        notification,
      },
    });
  } catch (error) {
    console.error("Error creating institutional inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit inquiry",
      error: error.message,
    });
  }
};

/**
 * Get all institutional inquiries with filtering options
 */
export const getInquiries = async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
      search,
    } = req.query;

    // Build filter conditions
    let where = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { contactName: { contains: search, mode: "insensitive" } },
        { organizationName: { contains: search, mode: "insensitive" } },
        { contactEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get total count for pagination
    const totalCount = await prisma.institutionalInquiry.count({ where });

    // Execute query with filters, sorting, and pagination
    const inquiries = await prisma.institutionalInquiry.findMany({
      where,
      orderBy: {
        [sort]: order.toLowerCase(),
      },
      skip,
      take,
    });

    // Log for debugging
    console.log(
      `Found ${inquiries.length} inquiries out of ${totalCount} total`
    );

    res.status(200).json({
      success: true,
      count: totalCount,
      data: inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
      },
    });
  } catch (error) {
    console.error("Error getting inquiries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve inquiries",
      error: error.message,
    });
  }
};

/**
 * Update inquiry status and details
 */
export const updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, followUpDate, notes } = req.body;

    // Get the existing inquiry to track changes
    const existingInquiry = await prisma.institutionalInquiry.findUnique({
      where: { id },
    });

    if (!existingInquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    const updatedInquiry = await prisma.institutionalInquiry.update({
      where: { id },
      data: {
        status: status || undefined,
        assignedTo: assignedTo || undefined,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        notes: notes || undefined,
        updatedAt: new Date(),
      },
    });

    // Create notification for status change
    if (status && status !== existingInquiry.status) {
      await createNotification(
        "INQUIRY_UPDATED",
        `Inquiry status changed from ${existingInquiry.status} to ${status}`,
        updatedInquiry,
        id
      );
    }

    res.status(200).json({
      success: true,
      message: "Inquiry updated successfully",
      data: updatedInquiry,
    });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update inquiry",
      error: error.message,
    });
  }
};

/**
 * Get sales dashboard analytics
 */
export const getSalesAnalytics = async (req, res) => {
  try {
    // Get inquiry statistics by status
    const inquiryStatusCounts = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM "InstitutionalInquiry"
      GROUP BY status
    `;

    // Get recent payment data
    const recentPayments = await prisma.payment.findMany({
      where: {
        status: "COMPLETED",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        subscription: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Get total revenue by plan type
    const revenueByPlan = await prisma.$queryRaw`
      SELECT "planType", SUM(amount) as total
      FROM "Payment"
      WHERE status = 'COMPLETED'
      GROUP BY "planType"
    `;

    // Get unread notification count
    const unreadNotificationsCount = await prisma.salesNotification.count({
      where: { status: "UNREAD" },
    });

    // Convert BigInt values to numbers for JSON serialization
    const processedInquiryStatusCounts = inquiryStatusCounts.map((item) => ({
      ...item,
      count: Number(item.count),
    }));

    const processedRevenueByPlan = revenueByPlan.map((item) => ({
      ...item,
      total: Number(item.total),
    }));

    res.status(200).json({
      success: true,
      data: {
        inquiryStatusCounts: processedInquiryStatusCounts,
        recentPayments,
        revenueByPlan: processedRevenueByPlan,
        unreadNotificationsCount,
      },
    });
  } catch (error) {
    console.error("Error getting sales analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sales analytics",
      error: error.message,
    });
  }
};

/**
 * Handle payment webhook from payment processor
 */
export const handlePaymentWebhook = async (req, res) => {
  try {
    const { event, payload } = req.body;

    if (event === "payment.success") {
      // Process successful payment
      const paymentId = payload.payment.entity.id;

      // Update payment status in database
      const payment = await prisma.payment.update({
        where: { razorpayPaymentId: paymentId },
        data: {
          status: "COMPLETED",
          updatedAt: new Date(),
        },
        include: {
          user: true,
          subscription: true,
        },
      });

      // Create notification for new payment
      await createNotification(
        "NEW_PAYMENT",
        `New payment of ₹${payment.amount} received for ${payment.planType} plan`,
        payment,
        null,
        payment.id
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing payment webhook:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createFreeTrialRequest = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      class: classGrade,
      state,
      city,
    } = req.body;

    // Validate required fields
    if (!fullName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create free trial request
    const trialRequest = await prisma.freeTrialRequest.create({
      data: {
        fullName,
        email,
        phoneNumber,
        class: classGrade,
        state,
        city,
      },
    });

    // Create sales notification
    const notification = await prisma.salesNotification.create({
      data: {
        type: "FREE_TRIAL",
        message: `New free trial request from ${fullName}`,
        data: JSON.stringify({
          trialId: trialRequest.id,
          fullName,
          email,
          phoneNumber,
          class: classGrade,
          state,
          city,
        }),
        trialId: trialRequest.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Free trial request submitted successfully",
      data: {
        trialRequest,
        notification,
      },
    });
  } catch (error) {
    console.error("Error creating free trial request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit free trial request",
      error: error.message,
    });
  }
};

export const getFreeTrialRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get free trial requests with pagination
    const [trialRequests, total] = await Promise.all([
      prisma.freeTrialRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.freeTrialRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: trialRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching free trial requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch free trial requests",
      error: error.message,
    });
  }
};

export const updateFreeTrialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, followUpDate } = req.body;

    const updatedTrial = await prisma.freeTrialRequest.update({
      where: { id },
      data: {
        status,
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Free trial request updated successfully",
      data: updatedTrial,
    });
  } catch (error) {
    console.error("Error updating free trial request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update free trial request",
      error: error.message,
    });
  }
};

export const getNotificationsByType = async (req, res) => {
  try {
    const { type, status = "UNREAD", limit = 50 } = req.query;

    const where = {};
    if (type && type !== "ALL") {
      where.type = type;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }

    const notifications = await prisma.salesNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      include: {
        inquiry: type === "INSTITUTIONAL_INQUIRY" ? true : false,
        // Note: We can't include freeTrialRequest directly due to Prisma limitations
        // We'll need to handle this in the frontend by parsing the data field
      },
    });

    // Parse the data field for free trial notifications
    const processedNotifications = notifications.map((notification) => {
      if (notification.type === "FREE_TRIAL" && notification.data) {
        try {
          const parsedData = JSON.parse(notification.data);
          return {
            ...notification,
            parsedData,
          };
        } catch (error) {
          console.error("Error parsing notification data:", error);
          return notification;
        }
      }
      return notification;
    });

    res.json({
      success: true,
      data: processedNotifications,
      count: processedNotifications.length,
    });
  } catch (error) {
    console.error("Error fetching notifications by type:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

/**
 * Delete an institutional inquiry
 */
export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if inquiry exists
    const inquiry = await prisma.institutionalInquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    // Delete associated notifications first
    await prisma.salesNotification.deleteMany({
      where: { inquiryId: id },
    });

    // Delete the inquiry
    await prisma.institutionalInquiry.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete inquiry",
      error: error.message,
    });
  }
};

/**
 * Delete a free trial request
 */
export const deleteFreeTrialRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if free trial request exists
    const freeTrial = await prisma.freeTrialRequest.findUnique({
      where: { id },
    });

    if (!freeTrial) {
      return res.status(404).json({
        success: false,
        message: "Free trial request not found",
      });
    }

    // Delete associated notifications first
    await prisma.salesNotification.deleteMany({
      where: { trialId: id },
    });

    // Delete the free trial request
    await prisma.freeTrialRequest.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Free trial request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting free trial request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete free trial request",
      error: error.message,
    });
  }
};

/**
 * Verify data integrity and show current state
 */
export const verifyDataIntegrity = async (req, res) => {
  try {
    // Get counts of different entities
    const inquiryCount = await prisma.institutionalInquiry.count();
    const notificationCount = await prisma.salesNotification.count();
    const institutionalNotificationCount = await prisma.salesNotification.count(
      {
        where: { type: "INSTITUTIONAL_INQUIRY" },
      }
    );
    const freeTrialNotificationCount = await prisma.salesNotification.count({
      where: { type: "FREE_TRIAL" },
    });

    // Get sample inquiries
    const sampleInquiries = await prisma.institutionalInquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Get sample notifications
    const sampleNotifications = await prisma.salesNotification.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: {
        counts: {
          institutionalInquiries: inquiryCount,
          totalNotifications: notificationCount,
          institutionalNotifications: institutionalNotificationCount,
          freeTrialNotifications: freeTrialNotificationCount,
        },
        sampleInquiries,
        sampleNotifications,
      },
    });
  } catch (error) {
    console.error("Error verifying data integrity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify data integrity",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    console.log("getAllUsers called with params:", req.query);

    const {
      page = 1,
      limit = 10,
      search = "",
      role = "ALL",
      sort = "createdAt",
      order = "desc",
    } = req.query;

    // Build filter conditions
    let where = {};

    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (role && role !== "ALL") {
      where.role = role;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where });

    // Execute query with filters, sorting, and pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phonenumber: true,
        age: true,
        userClass: true,
        role: true,
        createdAt: true,
        // Remove lastLogin since it doesn't exist in your schema
        _count: {
          select: {
            payments: true,
            subscriptions: true,
          },
        },
      },
      orderBy: {
        [sort]: order.toLowerCase(),
      },
      skip,
      take,
    });

    // Get user statistics
    const userStats = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        id: true,
      },
    });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
      statistics: userStats,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};
