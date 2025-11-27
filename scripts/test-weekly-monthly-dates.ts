/**
 * Test weekly and monthly date window calculations with exclusive 'to' date
 */

import "dotenv/config";
import { calculateDateWindow } from "./src/data";
import { calculateBudgetForPeriod } from "./src/budgetCalculator";

console.log("\n" + "=".repeat(60));
console.log("📅 TESTING WEEKLY & MONTHLY DATE WINDOWS");
console.log("=".repeat(60));

// Test Weekly
console.log("\n🧪 Test Case 1: Weekly Date Window");
const weekly = calculateDateWindow("weekly");
console.log(`From: ${weekly.from} (inclusive)`);
console.log(`To:   ${weekly.to} (exclusive)`);

// Calculate days between
const weeklyBudget = calculateBudgetForPeriod(weekly.from, weekly.to, "weekly");
console.log(`Days: ${weeklyBudget.days}`);
console.log(`Budget: £${weeklyBudget.amount.toFixed(2)}`);
console.log(`Source: ${weeklyBudget.source}`);

// Verify it's 7 days
if (weeklyBudget.days === 7) {
  console.log("✅ PASS: Weekly window is exactly 7 days");
} else {
  console.log(`❌ FAIL: Expected 7 days, got ${weeklyBudget.days}`);
}

// Test Monthly
console.log("\n🧪 Test Case 2: Monthly Date Window");
const monthly = calculateDateWindow("monthly");
console.log(`From: ${monthly.from} (inclusive)`);
console.log(`To:   ${monthly.to} (exclusive)`);

// Calculate days between
const monthlyBudget = calculateBudgetForPeriod(monthly.from, monthly.to, "monthly");
console.log(`Days: ${monthlyBudget.days}`);
console.log(`Budget: £${monthlyBudget.amount.toFixed(2)}`);
console.log(`Source: ${monthlyBudget.source}`);

// Verify it's a reasonable month length (28-31 days)
if (monthlyBudget.days >= 28 && monthlyBudget.days <= 31) {
  console.log(`✅ PASS: Monthly window is ${monthlyBudget.days} days (valid month length)`);
} else {
  console.log(`❌ FAIL: Expected 28-31 days, got ${monthlyBudget.days}`);
}

// Manual verification example
console.log("\n🧪 Test Case 3: Manual Date Verification");
console.log("If today is 2025-11-26:");
console.log("  Weekly (7 days): 2025-11-20 to 2025-11-27");
console.log("    → Includes: Nov 20, 21, 22, 23, 24, 25, 26");
console.log("    → Excludes: Nov 27");
console.log("  Monthly (Oct 2024): 2024-10-01 to 2024-11-01");
console.log("    → Includes: All 31 days of October");
console.log("    → Excludes: Nov 1");

console.log("\n" + "=".repeat(60));
console.log("Current actual values:");
console.log(`Weekly: ${weekly.from} to ${weekly.to} (${weeklyBudget.days} days)`);
console.log(`Monthly: ${monthly.from} to ${monthly.to} (${monthlyBudget.days} days)`);
console.log("=".repeat(60) + "\n");
