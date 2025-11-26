/**
 * Configuration storage system
 * All settings are now environment-driven
 * This file provides helper functions to read from environment variables
 */

/**
 * Get weekly allowance from environment (defaults to £100)
 */
export function getWeeklyAllowance(): number {
  const value = process.env.WEEKLY_ALLOWANCE;
  return value ? parseFloat(value) : 100;
}

/**
 * Get monthly allowance from environment
 * If not set, defaults to 4x weekly allowance
 */
export function getMonthlyAllowance(): number {
  const value = process.env.MONTHLY_ALLOWANCE;
  if (value) {
    return parseFloat(value);
  }
  // Default to 4 weeks worth of weekly allowance
  return getWeeklyAllowance() * 4;
}

/**
 * Get large transaction threshold from environment (defaults to £100)
 */
export function getLargeTransactionThreshold(): number {
  const value = process.env.LARGE_TRANSACTION_THRESHOLD;
  return value ? parseFloat(value) : 100;
}
