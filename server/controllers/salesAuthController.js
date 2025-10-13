// controllers/salesAuthController.js

import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from '@prisma/client';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * Login handler for sales team members
 */
export const salesLogin = async (req, res) => {
  console.log("🔐 Sales login attempt started");
  
  try {
    // 1. Validate request body
    const { username, password } = req.body;
    console.log("📝 Request body:", { username: username ? "***" : "missing", password: password ? "***" : "missing" });

    if (!username || !password) {
      console.log("❌ Missing credentials");
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }

    // 2. Check environment variables
    const validSalesUsername = process.env.SALES_USERNAME;
    const validSalesPasswordHash = process.env.SALES_PASSWORD_HASH;
    const jwtSecret = process.env.Jwt_sec;

    console.log("🔧 Environment check:", {
      hasUsername: !!validSalesUsername,
      hasPasswordHash: !!validSalesPasswordHash,
      hasJwtSecret: !!jwtSecret,
      usernameValue: validSalesUsername || "NOT_SET",
      passwordHashLength: validSalesPasswordHash ? validSalesPasswordHash.length : 0
    });

    if (!validSalesUsername || !validSalesPasswordHash) {
      console.log("❌ Missing environment variables");
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error - missing credentials" 
      });
    }

    if (!jwtSecret) {
      console.log("❌ Missing JWT secret");
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error - missing JWT secret" 
      });
    }

    // 3. Verify username
    if (username !== validSalesUsername) {
      console.log("❌ Invalid username:", username);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // 4. Verify password using bcrypt
    console.log("🔐 Verifying password...");
    
    // Decode Base64 hash if needed
    let decodedHash = validSalesPasswordHash;
    try {
      // Check if it's Base64 encoded (doesn't start with $)
      if (!validSalesPasswordHash.startsWith('$')) {
        decodedHash = Buffer.from(validSalesPasswordHash, 'base64').toString('utf-8');
        console.log("🔓 Decoded Base64 hash");
      }
    } catch (decodeError) {
      console.log("⚠️ Hash decode failed, using original:", decodeError.message);
    }
    
    const fullHash = decodedHash.startsWith('$') ? decodedHash : `$${decodedHash}`;
    console.log("🔑 Hash format:", fullHash.substring(0, 10) + "...");
    
    const isPasswordValid = await bcrypt.compare(password, fullHash);
    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    console.log("✅ Password verified successfully");

    // 5. Find the sales user in database
    console.log("🔍 Looking up sales user in database...");
    let user;
    try {
      user = await prisma.user.findUnique({ 
        where: { phonenumber: "agilitySales" } 
      });
      console.log("👤 User lookup result:", user ? "Found" : "Not found");
    } catch (dbError) {
      console.error("❌ Database error:", dbError);
      return res.status(500).json({ 
        success: false, 
        message: "Database connection error" 
      });
    }
    
    if (!user) {
      console.log("❌ Sales user not found in database");
      return res.status(404).json({ 
        success: false, 
        message: "Sales user not found in database" 
      });
    }

    // 6. Check if user has sales role
    if (user.role !== 'SALES') {
      console.log("❌ User role mismatch:", user.role);
      return res.status(403).json({ 
        success: false, 
        message: "Access denied - insufficient privileges" 
      });
    }

    console.log("✅ User validation passed");

    // 7. Generate JWT token
    console.log("🎫 Generating JWT token...");
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role,
        username: validSalesUsername
      }, 
      jwtSecret, 
      { expiresIn: "7d" }
    );

    console.log("✅ Sales login successful");

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        phonenumber: user.phonenumber,
        username: validSalesUsername
      }
    });
  } catch (error) {
    console.error("💥 Sales login error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      ...(isDevelopment && { error: error.message, stack: error.stack })
    });
  }
};

/**
 * Login handler for admin users
 */
export const adminLogin = async (req, res) => {
  console.log("🔐 Admin login attempt started");
  
  try {
    // 1. Validate request body
    const { username, password } = req.body;
    console.log("📝 Request body:", { username: username ? "***" : "missing", password: password ? "***" : "missing" });

    if (!username || !password) {
      console.log("❌ Missing credentials");
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }

    // 2. Check environment variables
    const validAdminUsername = process.env.ADMIN_USERNAME;
    const validAdminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.Jwt_sec;

    console.log("🔧 Environment check:", {
      hasUsername: !!validAdminUsername,
      hasPasswordHash: !!validAdminPasswordHash,
      hasJwtSecret: !!jwtSecret,
      usernameValue: validAdminUsername || "NOT_SET",
      passwordHashLength: validAdminPasswordHash ? validAdminPasswordHash.length : 0
    });

    if (!validAdminUsername || !validAdminPasswordHash) {
      console.log("❌ Missing environment variables");
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error - missing credentials" 
      });
    }

    if (!jwtSecret) {
      console.log("❌ Missing JWT secret");
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error - missing JWT secret" 
      });
    }

    // 3. Verify username
    if (username !== validAdminUsername) {
      console.log("❌ Invalid username:", username);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // 4. Verify password using bcrypt
    console.log("🔐 Verifying password...");
    
    // Decode Base64 hash if needed
    let decodedHash = validAdminPasswordHash;
    try {
      // Check if it's Base64 encoded (doesn't start with $)
      if (!validAdminPasswordHash.startsWith('$')) {
        decodedHash = Buffer.from(validAdminPasswordHash, 'base64').toString('utf-8');
        console.log("🔓 Decoded Base64 hash");
      }
    } catch (decodeError) {
      console.log("⚠️ Hash decode failed, using original:", decodeError.message);
    }
    
    const fullHash = decodedHash.startsWith('$') ? decodedHash : `$${decodedHash}`;
    console.log("🔑 Hash format:", fullHash.substring(0, 10) + "...");
    
    const isPasswordValid = await bcrypt.compare(password, fullHash);
    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    console.log("✅ Password verified successfully");

    // 5. Create a virtual admin user object (since admin doesn't exist in DB)
    const adminUser = {
      id: "admin-" + Date.now(),
      name: "Administrator",
      role: "ADMIN",
      email: "admin@edumaniax.com",
      phonenumber: "agility",
      username: validAdminUsername
    };

    console.log("✅ Admin user object created");

    // 6. Generate JWT token
    console.log("🎫 Generating JWT token...");
    const token = jwt.sign(
      { 
        id: adminUser.id,
        role: adminUser.role,
        username: validAdminUsername
      }, 
      jwtSecret, 
      { expiresIn: "7d" }
    );

    console.log("✅ Admin login successful");

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      user: adminUser
    });
  } catch (error) {
    console.error("💥 Admin login error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      ...(isDevelopment && { error: error.message, stack: error.stack })
    });
  }
};

/**
 * Create a new sales user (admin only)
 */
export const createSalesUser = async (req, res) => {
  try {
    const { name, phonenumber, email, password } = req.body;

    // Check if the requesting user is an admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: "Only administrators can create sales accounts" 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { phonenumber } 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this phone number already exists" 
      });
    }

    // Create a new sales user
    // For simplicity, we're creating a standard user with SALES role
    // In a real application, you might have a separate table for staff users
    const newUser = await prisma.user.create({
      data: {
        name,
        phonenumber,
        email,
        role: 'SALES',
        // Dummy values for required fields (in a real application, you'd have different models)
        age: 0,
        userClass: 'SALES',
        characterGender: 'N/A',
        characterName: 'N/A',
        characterStyle: 'N/A',
        characterTraits: ['SALES'],
      }
    });

    res.status(201).json({
      success: true,
      message: "Sales user created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        email: newUser.email,
        phonenumber: newUser.phonenumber
      }
    });
  } catch (error) {
    console.error("Create sales user error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
};
