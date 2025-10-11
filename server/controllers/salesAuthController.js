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
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }

    // Check against secure environment variables
    const validSalesUsername = process.env.SALES_USERNAME;
    const validSalesPasswordHash = process.env.SALES_PASSWORD_HASH;

    if (!validSalesUsername || !validSalesPasswordHash) {
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error" 
      });
    }

    // Verify username
    if (username !== validSalesUsername) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Verify password using bcrypt (add $ prefix if missing)
    const fullHash = validSalesPasswordHash.startsWith('$') ? validSalesPasswordHash : `$${validSalesPasswordHash}`;
    const isPasswordValid = await bcrypt.compare(password, fullHash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Find the sales user in database
    let user = await prisma.user.findUnique({ 
      where: { phonenumber: "agilitySales" } 
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Sales user not found in database" 
      });
    }

    // Check if user has sales role
    if (user.role !== 'SALES') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied - insufficient privileges" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role,
        username: validSalesUsername
      }, 
      process.env.Jwt_sec, 
      { expiresIn: "7d" }
    );

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
    console.error("Sales login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

/**
 * Login handler for admin users
 */
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }

    // Check against secure environment variables
    const validAdminUsername = process.env.ADMIN_USERNAME;
    const validAdminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!validAdminUsername || !validAdminPasswordHash) {
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error" 
      });
    }

    // Verify username
    if (username !== validAdminUsername) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Verify password using bcrypt (add $ prefix if missing)
    const fullHash = validAdminPasswordHash.startsWith('$') ? validAdminPasswordHash : `$${validAdminPasswordHash}`;
    const isPasswordValid = await bcrypt.compare(password, fullHash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Create a virtual admin user object (since admin doesn't exist in DB)
    const adminUser = {
      id: "admin-" + Date.now(),
      name: "Administrator",
      role: "ADMIN",
      email: "admin@edumaniax.com",
      phonenumber: "agility",
      username: validAdminUsername
    };

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: adminUser.id,
        role: adminUser.role,
        username: validAdminUsername
      }, 
      process.env.Jwt_sec, 
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      user: adminUser
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
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
