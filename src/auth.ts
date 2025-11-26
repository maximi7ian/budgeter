/**
 * Authentication middleware and utilities
 */

import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

/**
 * Check if authentication is enabled
 */
export function isAuthEnabled(): boolean {
  return !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  return { valid: true };
}

/**
 * Verify login credentials
 */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return false;
  }

  // Compare email (case-insensitive)
  if (email.toLowerCase() !== adminEmail.toLowerCase()) {
    return false;
  }

  // Check if password is already hashed (starts with bcrypt prefix)
  if (adminPassword.startsWith("$2a$") || adminPassword.startsWith("$2b$")) {
    // Password is hashed, use bcrypt compare
    return await bcrypt.compare(password, adminPassword);
  } else {
    // Password is plain text (for backward compatibility), do direct comparison
    return password === adminPassword;
  }
}

/**
 * Authentication middleware - require login for protected routes
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // If auth is not enabled, allow all requests
  if (!isAuthEnabled()) {
    return next();
  }

  // Check if user is logged in
  if (req.session && (req.session as any).userId) {
    return next();
  }

  // Not authenticated, redirect to login
  res.redirect("/login");
}

/**
 * Redirect to home if already logged in
 */
export function redirectIfAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!isAuthEnabled()) {
    return next();
  }

  if (req.session && (req.session as any).userId) {
    return res.redirect("/");
  }

  next();
}
