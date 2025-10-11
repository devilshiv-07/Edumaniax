// middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token missing or malformed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.Jwt_sec);

    // Check if this is an admin token (virtual user)
    if (decoded.role === 'ADMIN' && decoded.username) {
      // Create virtual admin user object
      req.user = {
        id: decoded.id,
        name: "Administrator",
        role: "ADMIN",
        email: "admin@edumaniax.com",
        phonenumber: "agility",
        username: decoded.username
      };
      next();
      return;
    }

    // For regular users, check database
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid token - user not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT authentication error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authenticateUser;
