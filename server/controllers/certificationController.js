import dotenv from "dotenv";
dotenv.config();

import prisma from "../utils/prisma.js";

// Create a new certification
const createCertification = async (req, res) => {
  try {
    const { moduleName, userClass } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;

    // Validate required fields
    if (!moduleName || !userClass) {
      return res.status(400).json({
        success: false,
        message: "Module name and user class are required",
      });
    }

    // Check if certification already exists for this user, module, and class
    const existingCertification = await prisma.certification.findUnique({
      where: {
        userId_moduleName_userClass: {
          userId,
          moduleName,
          userClass,
        },
      },
    });

    if (existingCertification) {
      return res.status(400).json({
        success: false,
        message: "Certification already exists for this module and class",
      });
    }

    // Calculate expiry date (30 days from now)
    const earnedDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // Create the certification
    const certification = await prisma.certification.create({
      data: {
        userId,
        userName,
        moduleName,
        userClass,
        earnedDate,
        expiryDate,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userClass: true,
          },
        },
      },
    });

    // Format dates for response
    const formattedCertification = {
      ...certification,
      earnedDateFormatted: formatDate(certification.earnedDate),
      expiryDateFormatted: formatDate(certification.expiryDate),
    };

    res.status(201).json({
      success: true,
      message: "Certification created successfully",
      certification: formattedCertification,
    });
  } catch (error) {
    console.error("Error creating certification:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all certifications for a user
const getUserCertifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { moduleName, userClass } = req.query;

    // Build where clause for filtering
    const whereClause = {
      userId,
      // Only show non-expired certifications
      expiryDate: {
        gt: new Date(),
      },
    };

    // Add optional filters
    if (moduleName) {
      whereClause.moduleName = moduleName;
    }
    if (userClass) {
      whereClause.userClass = userClass;
    }

    const certifications = await prisma.certification.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userClass: true,
          },
        },
      },
      orderBy: {
        earnedDate: "desc",
      },
    });

    // Format dates for response
    const formattedCertifications = certifications.map((cert) => ({
      ...cert,
      earnedDateFormatted: formatDate(cert.earnedDate),
      expiryDateFormatted: formatDate(cert.expiryDate),
    }));

    res.status(200).json({
      success: true,
      message: "Certifications retrieved successfully",
      certifications: formattedCertifications,
      count: formattedCertifications.length,
    });
  } catch (error) {
    console.error("Error fetching certifications:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get certifications by module name
const getCertificationsByModule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { moduleName } = req.params;

    if (!moduleName) {
      return res.status(400).json({
        success: false,
        message: "Module name is required",
      });
    }

    const certifications = await prisma.certification.findMany({
      where: {
        userId,
        moduleName,
        // Only show non-expired certifications
        expiryDate: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userClass: true,
          },
        },
      },
      orderBy: {
        earnedDate: "desc",
      },
    });

    // Format dates for response
    const formattedCertifications = certifications.map((cert) => ({
      ...cert,
      earnedDateFormatted: formatDate(cert.earnedDate),
      expiryDateFormatted: formatDate(cert.expiryDate),
    }));

    res.status(200).json({
      success: true,
      message: `Certifications for module '${moduleName}' retrieved successfully`,
      moduleName,
      certifications: formattedCertifications,
      count: formattedCertifications.length,
    });
  } catch (error) {
    console.error("Error fetching certifications by module:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get certifications by user class
const getCertificationsByClass = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userClass } = req.params;

    if (!userClass) {
      return res.status(400).json({
        success: false,
        message: "User class is required",
      });
    }

    const certifications = await prisma.certification.findMany({
      where: {
        userId,
        userClass,
        // Only show non-expired certifications
        expiryDate: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userClass: true,
          },
        },
      },
      orderBy: {
        earnedDate: "desc",
      },
    });

    // Format dates for response
    const formattedCertifications = certifications.map((cert) => ({
      ...cert,
      earnedDateFormatted: formatDate(cert.earnedDate),
      expiryDateFormatted: formatDate(cert.expiryDate),
    }));

    res.status(200).json({
      success: true,
      message: `Certifications for class '${userClass}' retrieved successfully`,
      userClass,
      certifications: formattedCertifications,
      count: formattedCertifications.length,
    });
  } catch (error) {
    console.error("Error fetching certifications by class:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Clean up expired certifications (for maintenance)
const cleanupExpiredCertifications = async (req, res) => {
  try {
    // This function can be called by admin or as a scheduled job
    const currentDate = new Date();

    const deletedCertifications = await prisma.certification.deleteMany({
      where: {
        expiryDate: {
          lt: currentDate,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Expired certifications cleaned up successfully",
      deletedCount: deletedCertifications.count,
      cleanupDate: formatDate(currentDate),
    });
  } catch (error) {
    console.error("Error cleaning up expired certifications:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Helper function to format dates as dd/mm/yyyy
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export {
  createCertification,
  getUserCertifications,
  getCertificationsByModule,
  getCertificationsByClass,
  cleanupExpiredCertifications,
};
