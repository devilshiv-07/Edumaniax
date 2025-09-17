// routes/certificationRoutes.js

import { Router } from "express";
import {
  createCertification,
  getUserCertifications,
  getCertificationsByModule,
  getCertificationsByClass,
  cleanupExpiredCertifications,
} from "../controllers/certificationController.js";
import authenticateUser from "../middlewares/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// POST /api/certifications - Create a new certification
router.post("/", createCertification);

// GET /api/certifications - Get all certifications for the authenticated user
// Optional query parameters: moduleName, userClass
router.get("/", getUserCertifications);

// GET /api/certifications/module/:moduleName - Get certifications by module name
router.get("/module/:moduleName", getCertificationsByModule);

// GET /api/certifications/class/:userClass - Get certifications by user class
router.get("/class/:userClass", getCertificationsByClass);

// POST /api/certifications/cleanup - Clean up expired certifications (admin/maintenance)
router.post("/cleanup", cleanupExpiredCertifications);

export default router;
