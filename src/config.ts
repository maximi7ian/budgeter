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

/**
 * Get list of excluded account/card IDs from environment
 * Returns array of account_id or card_id values that should be excluded from budget calculations
 * Example: TL_EXCLUDE_ACCOUNTS=account123,card456,account789
 */
export function getExcludedAccounts(): string[] {
  const value = process.env.TL_EXCLUDE_ACCOUNTS;
  if (!value || value.trim() === '') {
    return [];
  }
  // Split by comma and trim whitespace
  return value
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);
}

/**
 * Check if an account/card ID should be excluded from budget calculations
 */
export function isAccountExcluded(accountId: string): boolean {
  const excludedIds = getExcludedAccounts();
  return excludedIds.includes(accountId);
}
