import dotenv from "dotenv";
dotenv.config();

import prisma from "../utils/prisma.js";
import connectionManager from "../connectionManager.js";
import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken"; 
import axios from "axios";
import cloudinary, { extractPublicIdFromUrl } from "../utils/cloudinary.js";
import fs from "fs";
import bcrypt from "bcrypt";


// Email + Password Registration (new)
// [DISABLED FOR NOW]: Export at declaration commented out to avoid duplicate named export
// export const registerWithEmailPassword = async (req, res) => {
const registerWithEmailPassword = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      age,
      userClass,
      characterGender,
      characterName,
      characterStyle,
      characterTraits,
      phonenumber, // keep accepting to preserve existing form data
    } = req.body;

    if (
      !email ||
      !password ||
      !name ||
      !age ||
      !userClass ||
      !characterGender ||
      !characterName ||
      !characterStyle ||
      !characterTraits
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingByEmail = await prisma.user.findFirst({ where: { email } });
    if (existingByEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Ensure optional phone number does not break schema that requires a unique value
    // [DISABLED FOR NOW]: If phone number is not provided, use a placeholder unique value
    const normalizedPhone = phonenumber && String(phonenumber).trim().length > 0
      ? phonenumber
      : `NA_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // TEMPORARY COMPAT: If database still has NOT NULL on phonenumber, store a hidden placeholder
    // This keeps phone removed from UI and responses, but avoids DB constraint crashes until migration is applied.
    const hiddenPhonePlaceholder = `NA_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          password: passwordHash,
          name,
          age,
          userClass,
          characterGender,
          characterName,
          characterStyle,
          characterTraits,
          // [DISABLED FOR NOW]: No real phone number; insert hidden placeholder to satisfy legacy NOT NULL schemas
          phonenumber: hiddenPhonePlaceholder,
        },
      });
    } catch (createErr) {
      const msg = String(createErr?.message || "");
      // Fallback if prisma schema hasn't added `password` yet
      if (msg.includes("Unknown argument `password`")) {
        console.warn("[Registration] Password column missing in DB. Creating user without password. Apply Prisma migration to enable password column.");
        user = await prisma.user.create({
          data: {
            email,
            // password excluded due to schema mismatch
            name,
            age,
            userClass,
            characterGender,
            characterName,
            characterStyle,
            characterTraits,
            phonenumber: hiddenPhonePlaceholder,
          },
        });
      } else {
        throw createErr;
      }
    }

    const token = jwt.sign({ id: user.id }, process.env.Jwt_sec, {
      expiresIn: "5d",
    });

    return res.status(201).json({ token, user });
  } catch (error) {
    console.error("Registration error:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    });
    const isDev = process.env.NODE_ENV !== 'production';
    return res.status(500).json({
      success: false,
      message: error?.message || "Registration failed",
      code: error?.code,
      detail: error?.meta?.cause || error?.meta?.target,
      ...(isDev && { stack: error?.stack })
    });
  }
};

// Email + Password Login (new)
// [DISABLED FOR NOW]: Export at declaration commented out to avoid duplicate named export
// export const loginWithEmailPassword = async (req, res) => {
const loginWithEmailPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If password column doesn't exist yet (free mode fallback), allow login
    if (typeof user.password === 'string' && user.password.length > 0) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      console.warn("[Login] Password column missing or empty for user. Allowing login in free mode. Apply Prisma migration to enable secure password login.");
    }

    const token = jwt.sign({ id: user.id }, process.env.Jwt_sec, {
      expiresIn: "5d",
    });

    return res.status(200).json({ success: true, message: "Logged in", token, user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// [DISABLED FOR NOW]: OTP verification logic commented for free access mode and email+password switch
// const sendOtpForRegistration = async (req, res) => {
//   const { phonenumber } = req.body;

//   if (!phonenumber) {
//     return res.status(400).json({ message: "Phone number is required" });
//   }

//   const existingUser = await prisma.user.findUnique({ where: { phonenumber } });
//   if (existingUser) {
//     return res.status(400).json({ message: "User already exists. Please login." });
//   }

//   return sendOtpHelper(phonenumber, res);
// };

// const sendOtpForLogin = async (req, res) => {
//   const { phonenumber } = req.body;

//   if (!phonenumber) {
//     return res.status(400).json({ message: "Phone number is required" });
//   }

//   const existingUser = await prisma.user.findUnique({ where: { phonenumber } });
//   if (!existingUser) {
//     return res.status(404).json({ message: "User not found. Please register." });
//   }

//   return sendOtpHelper(phonenumber, res);
// };


// const sendOtpHelper = async (phonenumber, res) => {
//   // Validate required environment variables in runtime (useful on Cloud Run)
//   if (!process.env.EDUMARC_API_KEY) {
//     console.error("Missing EDUMARC_API_KEY environment variable");
//     return res.status(500).json({ message: "SMS service misconfigured" });
//   }
//   const otp = otpGenerator.generate(6, {
//     upperCaseAlphabets: false,
//     specialChars: false,
//     lowerCaseAlphabets: false,
//   });

//   const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

//   try {
//     await prisma.otpVerification.upsert({
//       where: { phonenumber },
//       update: { otp, otpExpiration },
//       create: { phonenumber, otp, otpExpiration },
//     });

//     const message = `Your EduManiax OTP for verification is: ${otp}. OTP is confidential, refrain from sharing it with anyone. By Edumarc Technologies`;

//     // Retry mechanism for SMS API
//     const maxRetries = 3;
//     let lastError = null;

//     for (let attempt = 1; attempt <= maxRetries; attempt++) {
//       try {
//         console.log(`SMS API attempt ${attempt}/${maxRetries} for phone: ${phonenumber}`);
        
//         const response = await axios.post(
//           "https://smsapi.edumarcsms.com/api/v1/sendsms",
//           {
//             number: [phonenumber],
//             message,
//             senderId: "EDUMRC",
//             templateId: "1707168926925165526",
//           },
//           {
//             headers: {
//               apikey: process.env.EDUMARC_API_KEY,
//               "Content-Type": "application/json",
//             },
//             timeout: 30000, // 30 second timeout
//           }
//         );

//         const { success, data } = response.data;

//         if (success) {
//           console.log(`SMS sent successfully on attempt ${attempt}`);
//           return res.status(200).json({ message: "OTP sent successfully" });
//         } else {
//           console.error(`SMS API returned failure on attempt ${attempt}:`, response.data);
//           lastError = new Error(`SMS API failure: ${JSON.stringify(response.data)}`);
          
//           // If it's a rate limit or temporary error, wait before retry
//           if (attempt < maxRetries) {
//             const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
//             console.log(`Waiting ${waitTime}ms before retry...`);
//             await new Promise(resolve => setTimeout(resolve, waitTime));
//           }
//         }
//       } catch (axiosErr) {
//         const status = axiosErr.response?.status;
//         const data = axiosErr.response?.data;
//         const code = axiosErr.code;
//         const message = axiosErr.message;
        
//         console.error(`SMS API attempt ${attempt} failed:`, {
//           status,
//           data,
//           code,
//           message,
//           phone: phonenumber
//         });

//         lastError = axiosErr;

//         // Handle specific error types
//         if (status === 429) {
//           // Rate limited - wait longer
//           const waitTime = Math.pow(2, attempt) * 2000; // Longer wait for rate limits
//           console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
//           if (attempt < maxRetries) {
//             await new Promise(resolve => setTimeout(resolve, waitTime));
//           }
//         } else if (status >= 500) {
//           // Server error - retry with backoff
//           if (attempt < maxRetries) {
//             const waitTime = Math.pow(2, attempt) * 1000;
//             console.log(`Server error, waiting ${waitTime}ms before retry...`);
//             await new Promise(resolve => setTimeout(resolve, waitTime));
//           }
//         } else if (code === 'ECONNABORTED' || code === 'ETIMEDOUT') {
//           // Timeout - retry immediately
//           if (attempt < maxRetries) {
//             console.log(`Timeout, retrying immediately...`);
//             continue;
//           }
//         } else {
//           // Other errors - don't retry
//           break;
//         }
//       }
//     }

//     // All retries failed
//     console.error(`SMS API failed after ${maxRetries} attempts for phone: ${phonenumber}`, lastError);
    
//     return res.status(500).json({
//       message: "Failed to send OTP after multiple attempts. Please try again later.",
//       error: "SMS_SERVICE_UNAVAILABLE",
//       details: lastError?.response?.data || lastError?.message
//     });

//   } catch (err) {
//     console.error("Error in sendOtpHelper:", err.message || err);
//     return res.status(500).json({
//       message: "Internal server error",
//       error: "INTERNAL_ERROR"
//     });
//   }
// };

// [DISABLED FOR NOW]: OTP verification logic commented for free access mode and email+password switch
// Verify OTP and Register
// const verifyOtpAndRegister = async (req, res) => {
//   const {
//     phonenumber,
//     otp,
//     name,
//     age,
//     userClass,
//     characterGender,
//     characterName,
//     characterStyle,
//     characterTraits,
//   } = req.body;

//   if (
//     !phonenumber ||
//     !otp ||
//     !name ||
//     !age ||
//     !userClass ||
//     !characterGender ||
//     !characterName ||
//     !characterStyle ||
//     !characterTraits
//   ) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   const otpRecord = await prisma.otpVerification.findUnique({
//     where: { phonenumber },
//   });

//   if (
//     !otpRecord ||
//     otpRecord.otp !== otp ||
//     new Date() > otpRecord.otpExpiration
//   ) {
//     return res.status(400).json({ message: "Invalid or expired OTP" });
//   }

//   const existingUser = await prisma.user.findUnique({ where: { phonenumber } });
//   if (existingUser) {
//     return res.status(400).json({ message: "User already exists" });
//   }

//   const user = await prisma.user.create({
//     data: {
//       phonenumber,
//       name,
//       age,
//       userClass,
//       characterGender,
//       characterName,
//       characterStyle,
//       characterTraits,
//     },
//   });

//   await prisma.otpVerification.delete({ where: { phonenumber } });

//   const token = jwt.sign({ id: user.id }, process.env.Jwt_sec, {
//     expiresIn: "5d",
//   });

//   res.status(201).json({ token, user });
// };

// Verify OTP and Login
// const verifyOtpAndLogin = async (req, res) => {
//   const { phonenumber, otp } = req.body;

//   if (!phonenumber || !otp) {
//     return res
//       .status(400)
//       .json({ message: "Phone number and OTP are required" });
//   }

//   const otpRecord = await prisma.otpVerification.findUnique({
//     where: { phonenumber },
//   });

//   if (
//     !otpRecord ||
//     otpRecord.otp !== otp ||
//     new Date() > otpRecord.otpExpiration
//   ) {
//     return res.status(400).json({ message: "Invalid or expired OTP" });
//   }

//   const user = await prisma.user.findUnique({ where: { phonenumber } });
//   if (!user) {
//     return res
//       .status(404)
//       .json({ message: "User not found. Please register." });
//   }

//   await prisma.otpVerification.delete({ where: { phonenumber } });

//   const token = jwt.sign({ id: user.id }, process.env.Jwt_sec, {
//     expiresIn: "5d",
//   });

//   res.status(200).json({ success: true, message: "Logged in", token, user });
// };

const getMe = async (req, res) => {
  try {
    // User is already authenticated by middleware and available in req.user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        // [DISABLED FOR NOW]: phone removed
        // phonenumber: true,
        email: true,
        name: true,
        age: true,
        userClass: true,
        characterGender: true,
        characterName: true,
        characterStyle: true,
        characterTraits: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Test Route
const test = async (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to EduManiax!" });
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    // User is already authenticated by middleware and available in req.user
    const userId = req.user.id;
    const allowedFields = ['name', 'age', 'userClass', /* 'phonenumber', */ 'email', 'avatar'];
    const updateData = {};

    // Only allow updating specific fields
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Additional validation
    if (updateData.age) {
      const age = parseInt(updateData.age);
      if (age < 1 || age > 100) {
        return res.status(400).json({ message: "Age must be between 1 and 100" });
      }
      updateData.age = age;
    }

    // [DISABLED FOR NOW]: phone update logic removed
    // if (updateData.phonenumber) { ... }

    if (updateData.email) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      // Check if email is already taken by another user
      const existingEmailUser = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          NOT: { id: userId }
        }
      });
      
      if (existingEmailUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        // phonenumber: true,
        email: true,
        name: true,
        age: true,
        userClass: true,
        characterGender: true,
        characterName: true,
        characterStyle: true,
        characterTraits: true,
        createdAt: true,
      },
    });

    res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Upload Avatar
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file uploaded" 
      });
    }

    console.log('Uploading file:', req.file.path);

    // Check if file exists
    if (!fs.existsSync(req.file.path)) {
      return res.status(400).json({ 
        success: false, 
        message: "Uploaded file not found" 
      });
    }

    // Get current user data to check for existing avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true }
    });

    // Extract public_id from old avatar URL if it exists
    let oldPublicId = null;
    if (currentUser?.avatar) {
      oldPublicId = extractPublicIdFromUrl(currentUser.avatar);
    }

    // Upload to Cloudinary with organized folder structure
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "edumaniax/avatars/users", // Organized folder structure
      public_id: `user_${userId}_avatar`, // Clear naming convention
      overwrite: true, // Replace existing avatar with same public_id
      transformation: [
        { width: 300, height: 300, crop: "fill" }, // Ensure square aspect ratio
        { quality: "auto" }, // Optimize quality
        { format: "auto" } // Auto format selection
      ]
    });

    // If there was an old avatar with different public_id, delete it
    if (oldPublicId && oldPublicId !== `edumaniax/avatars/users/user_${userId}_avatar`) {
      try {
        const deleteResult = await cloudinary.uploader.destroy(oldPublicId);
        if (deleteResult.result === 'ok') {
          console.log(`Successfully deleted old avatar: ${oldPublicId}`);
        } else {
          console.log(`Old avatar not found or already deleted: ${oldPublicId}`);
        }
      } catch (deleteError) {
        console.error("Error deleting old avatar:", deleteError);
        // Don't fail the upload if deletion fails
      }
    }

    // Delete temporary file
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.error("Error deleting temporary file:", unlinkError);
    }

    // Update user's avatar URL in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        avatar: result.secure_url 
      }
    });

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatarUrl: result.secure_url,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    // Clean up temporary file if it exists
    if (req.file && req.file.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (unlinkError) {
        console.error("Error deleting temporary file:", unlinkError);
      }
    }
    
    console.error("Error uploading avatar:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload avatar", 
      error: error.message 
    });
  }
};

// Cleanup orphaned avatars (for maintenance purposes)
const cleanupOrphanedAvatars = async (req, res) => {
  try {
    // This function is for admin use only
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    // Get all users with avatars
    const usersWithAvatars = await prisma.user.findMany({
      where: { 
        avatar: { not: null } 
      },
      select: { id: true, avatar: true }
    });

    // Get all avatars from Cloudinary in the edumaniax/avatars/users folder
    const cloudinaryResources = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'edumaniax/avatars/users/',
      max_results: 500
    });

    const validPublicIds = new Set();
    usersWithAvatars.forEach(user => {
      const publicId = extractPublicIdFromUrl(user.avatar);
      if (publicId) {
        validPublicIds.add(publicId);
      }
    });

    const orphanedResources = cloudinaryResources.resources.filter(
      resource => !validPublicIds.has(resource.public_id)
    );

    // Delete orphaned resources
    const deletionResults = [];
    for (const resource of orphanedResources) {
      try {
        const result = await cloudinary.uploader.destroy(resource.public_id);
        deletionResults.push({
          public_id: resource.public_id,
          result: result.result
        });
      } catch (error) {
        deletionResults.push({
          public_id: resource.public_id,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Cleanup completed`,
      totalCloudinaryResources: cloudinaryResources.resources.length,
      validAvatars: validPublicIds.size,
      orphanedFound: orphanedResources.length,
      deletionResults
    });

  } catch (error) {
    console.error("Error during cleanup:", error);
    res.status(500).json({ 
      success: false, 
      message: "Cleanup failed", 
      error: error.message 
    });
  }
};


export {
  // [DISABLED FOR NOW]: OTP endpoints commented out for email+password switch
  // sendOtpForRegistration,
  // sendOtpForLogin,
  // verifyOtpAndRegister,
  // verifyOtpAndLogin,
  registerWithEmailPassword,
  loginWithEmailPassword,
  getMe,
  test,
  updateProfile,
  uploadAvatar,
  cleanupOrphanedAvatars
};