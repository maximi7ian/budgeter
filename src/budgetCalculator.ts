/**
 * Budget calculation utilities
 * Handles budget calculation for any date range (weekly, monthly, custom)
 */

import { getWeeklyAllowance, getMonthlyAllowance } from "./config";
import { WindowMode } from "./types";

export interface BudgetInfo {
  amount: number; // The budget amount for this period
  source: 'weekly' | 'monthly' | 'custom' | 'calculated'; // Where the budget came from
  days: number; // Number of days in the period
  dailyRate: number; // Budget per day (for display/reference)
}

/**
 * Calculate the number of days between two dates
 * From date is INCLUSIVE, To date is EXCLUSIVE
 * Example: from="2025-01-01" to="2025-01-03" = 2 days (Jan 1 and Jan 2, NOT Jan 3)
 */
function calculateDays(from: string, to: string): number {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays; // No +1: from is inclusive, to is exclusive
}

/**
 * Calculate budget for a given date range and mode
 * @param from - Start date (YYYY-MM-DD) - INCLUSIVE
 * @param to - End date (YYYY-MM-DD) - EXCLUSIVE
 * @param mode - Window mode (weekly, monthly, custom)
 * @param customBudget - Optional custom budget amount (for custom mode)
 */
export function calculateBudgetForPeriod(
  from: string,
  to: string,
  mode: WindowMode,
  customBudget?: number
): BudgetInfo {
  const days = calculateDays(from, to);

  // If custom budget is provided, use it
  if (customBudget !== undefined && customBudget > 0) {
    return {
      amount: customBudget,
      source: 'custom',
      days,
      dailyRate: customBudget / days,
    };
  }

  // For weekly mode, use weekly allowance
  if (mode === 'weekly') {
    const weeklyBudget = getWeeklyAllowance();
    return {
      amount: weeklyBudget,
      source: 'weekly',
      days,
      dailyRate: weeklyBudget / days,
    };
  }

  // For monthly mode, use monthly allowance
  if (mode === 'monthly') {
    const monthlyBudget = getMonthlyAllowance();
    return {
      amount: monthlyBudget,
      source: 'monthly',
      days,
      dailyRate: monthlyBudget / days,
    };
  }

  // For custom mode without custom budget, calculate based on daily rate from weekly budget
  const weeklyBudget = getWeeklyAllowance();
  const dailyRate = weeklyBudget / 7;
  const calculatedBudget = dailyRate * days;

  return {
    amount: calculatedBudget,
    source: 'calculated',
    days,
    dailyRate,
  };
}
