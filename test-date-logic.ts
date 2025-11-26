/**
 * Test the new exclusive "to" date logic
 */

import "dotenv/config";
import { calculateBudgetForPeriod } from "./src/budgetCalculator";

console.log("\n" + "=".repeat(60));
console.log("📅 TESTING EXCLUSIVE 'TO' DATE LOGIC");
console.log("=".repeat(60));

// Test Case 1: Single day (from Jan 1 to Jan 2 should be 1 day)
console.log("\n🧪 Test Case 1: Single Day");
console.log("From: 2025-01-01 (inclusive)");
console.log("To:   2025-01-02 (exclusive)");
console.log("Expected: 1 day (only Jan 1)");
const test1 = calculateBudgetForPeriod("2025-01-01", "2025-01-02", "custom");
console.log(`Result: ${test1.days} days ✅ ${test1.days === 1 ? 'PASS' : 'FAIL'}`);

// Test Case 2: Week (from Jan 1 to Jan 8 should be 7 days)
console.log("\n🧪 Test Case 2: One Week");
console.log("From: 2025-01-01 (inclusive)");
console.log("To:   2025-01-08 (exclusive)");
console.log("Expected: 7 days (Jan 1-7)");
const test2 = calculateBudgetForPeriod("2025-01-01", "2025-01-08", "custom");
console.log(`Result: ${test2.days} days ✅ ${test2.days === 7 ? 'PASS' : 'FAIL'}`);

// Test Case 3: Month (from Jan 1 to Feb 1 should be 31 days)
console.log("\n🧪 Test Case 3: Full Month (January)");
console.log("From: 2025-01-01 (inclusive)");
console.log("To:   2025-02-01 (exclusive)");
console.log("Expected: 31 days (all of January)");
const test3 = calculateBudgetForPeriod("2025-01-01", "2025-02-01", "custom");
console.log(`Result: ${test3.days} days ✅ ${test3.days === 31 ? 'PASS' : 'FAIL'}`);

// Test Case 4: Budget calculation with daily rate
console.log("\n🧪 Test Case 4: Budget Calculation");
console.log("From: 2025-01-01 (inclusive)");
console.log("To:   2025-01-08 (exclusive)");
console.log("Expected: 7 days × daily rate");
const test4 = calculateBudgetForPeriod("2025-01-01", "2025-01-08", "custom");
console.log(`Days: ${test4.days}`);
console.log(`Daily Rate: £${test4.dailyRate.toFixed(2)}`);
console.log(`Total Budget: £${test4.amount.toFixed(2)}`);
console.log(`Source: ${test4.source}`);

// Test Case 5: Custom budget
console.log("\n🧪 Test Case 5: Custom Budget Override");
console.log("From: 2025-01-01 (inclusive)");
console.log("To:   2025-01-08 (exclusive)");
console.log("Custom Budget: £500");
const test5 = calculateBudgetForPeriod("2025-01-01", "2025-01-08", "custom", 500);
console.log(`Days: ${test5.days}`);
console.log(`Total Budget: £${test5.amount.toFixed(2)}`);
console.log(`Source: ${test5.source}`);
console.log(`✅ ${test5.amount === 500 && test5.source === 'custom' ? 'PASS' : 'FAIL'}`);

console.log("\n" + "=".repeat(60));
console.log("✅ All tests completed!");
console.log("=".repeat(60) + "\n");
