// lib/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export interface JWTPayload {
  id?: string;
  business_email: string;
  role: "admin" | "business";
}

export const JWT_SECRET = process.env.JWT_SECRET!;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const extractTokenFromRequest = (req: NextRequest): string | null => {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
};

export const authenticateRequest = (req: NextRequest): JWTPayload => {
  const token = extractTokenFromRequest(req);
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    return verifyToken(token);
  } catch (error) {
    console.log("Token verification failed:", error);
    throw new Error("Invalid token");
  }
};
