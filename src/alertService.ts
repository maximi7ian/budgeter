/**
 * Budget alert service - orchestrates fetching data, generating summaries, and sending emails
 * Now uses the modern HTML email template system with excluded expenses filtering
 */

import { WindowMode, ExcludedExpenseRow } from "./types";
import { calculateDateWindow, listAllTransactionsFromAllTokens, getDummyData, capDateForAPI } from "./data";
import { sendBudgetEmail } from "./email";
import { getWeeklyAllowance, getMonthlyAllowance, getLargeTransactionThreshold } from "./config";
import { fetchExcludedExpenses, isSheetsConfigured } from "./sheets";
import { calculateBudgetForPeriod } from "./budgetCalculator";

// Email template system
import { renderBudgetEmail } from "./email/budgetEmailTemplate";
import { BudgetEmailTemplateData, AdviceInput } from "./email/types";
import { generateFinancialAdviceAndBreakdown } from "./email/financialAdvice";
import { filterExcludedExpenses } from "./email/excludedExpensesFilter";
import {
  renderBiggestPurchasesSection,
  renderTopMerchantsSection,
  renderLargeTransactionsSection,
  renderExcludedExpensesSection
} from "./email/sections";
import {
  formatMoney,
  formatDateRange,
  generatePeriodLabel,
  extractBiggestPurchases,
  extractLargeTransactions,
  aggregateByMerchant,
  aggregateByCategory,
  calculateAverageTransaction
} from "./email/helpers";

const MODE = process.env.MODE || "live";
const CLIENT_ID = process.env.TL_CLIENT_ID!;
const CLIENT_SECRET = process.env.TL_CLIENT_SECRET!;
const TOKEN_URL = process.env.TL_TOKEN_URL || "https://auth.truelayer.com/connect/token";
const API_BASE = process.env.TL_API_BASE || "https://api.truelayer.com";

/**
 * Send budget alert for a specific period or custom date range
 */
export async function sendBudgetAlertForPeriod(
  period: "weekly" | "monthly" | "custom",
  recipient?: string,
  customDates?: { from: string; to: string; budget?: number }
): Promise<void> {
  const reportType = period === "custom" ? "CUSTOM" : period.toUpperCase();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 BUDGET ALERT: ${reportType}`);
  console.log("=".repeat(60));

  // Step 1: Fetch transaction data
  let transactions;
  let dateWindow;

  console.log("\n🔄 Step 1: Fetching transaction data...");
  if (MODE === "dummy") {
    console.log("   📦 Using dummy data (MODE=dummy)");
    const dummyData = getDummyData(period === "custom" ? "weekly" : period);
    transactions = dummyData.transactions;
    dateWindow = period === "custom" && customDates
      ? { mode: "custom" as WindowMode, from: customDates.from, to: customDates.to }
      : dummyData.window;
  } else {
    if (period === "custom" && customDates) {
      dateWindow = { mode: "custom" as WindowMode, from: customDates.from, to: customDates.to };
    } else {
      dateWindow = calculateDateWindow(period as "weekly" | "monthly");
    }
    console.log(`   📅 Date range: ${dateWindow.from} to ${dateWindow.to}`);
    const result = await listAllTransactionsFromAllTokens(
      CLIENT_ID,
      CLIENT_SECRET,
      TOKEN_URL,
      dateWindow.from,
      capDateForAPI(dateWindow.to), // Cap to today to avoid API errors
      API_BASE
    );
    transactions = result.transactions;
  }

  console.log(`   ✓ Found ${transactions.length} transactions`);

  if (transactions.length === 0) {
    console.log("   ⚠️  No transactions found for this period, skipping alert");
    return;
  }

  // Step 2: Fetch and filter excluded expenses
  console.log("\n📋 Step 2: Fetching excluded expenses...");
  let excludedExpenses: ExcludedExpenseRow[] = [];

  if (isSheetsConfigured()) {
    try {
      excludedExpenses = await fetchExcludedExpenses();
      console.log(`   ✓ Found ${excludedExpenses.length} excluded expense(s) in sheet`);

      // Filter transactions to remove excluded expenses
      const originalCount = transactions.length;
      transactions = filterExcludedExpenses(transactions, excludedExpenses, dateWindow);
      const filteredCount = originalCount - transactions.length;

      if (filteredCount > 0) {
        console.log(`   ✓ Filtered out ${filteredCount} excluded expense(s)`);
      }
    } catch (error: any) {
      console.warn(`   ⚠️  Failed to fetch excluded expenses: ${error.message}`);
      console.log("   Continuing without excluded expenses filtering...");
    }
  } else {
    console.log("   ℹ️  Google Sheets not configured, skipping excluded expenses");
  }

  // Step 3: Extract large transactions and filter them out for budget calculations
  console.log("\n💰 Step 3: Processing large transactions...");
  const largeTransactionThreshold = getLargeTransactionThreshold();
  const largeTransactions = extractLargeTransactions(transactions, largeTransactionThreshold);

  console.log(`   📊 Found ${largeTransactions.length} large transaction(s) over £${largeTransactionThreshold}`);

  // Filter out large transactions for budget calculations
  const regularTransactions = transactions.filter(
    t => !(t.amountGBP < 0 && Math.abs(t.amountGBP) >= largeTransactionThreshold)
  );

  // Step 4: Calculate statistics from REGULAR transactions only
  console.log("\n📊 Step 4: Computing statistics from regular transactions...");

  // Use calculateBudgetForPeriod for consistent budget calculation
  const budgetInfo = calculateBudgetForPeriod(
    dateWindow.from,
    dateWindow.to,
    period,
    customDates?.budget
  );
  const budget = budgetInfo.amount;
  console.log(`   💰 Budget calculation: ${budgetInfo.source} = £${budget.toFixed(2)} (${budgetInfo.days} days @ £${budgetInfo.dailyRate.toFixed(2)}/day)`);

  const totalSpend = Math.abs(
    regularTransactions.filter(t => t.amountGBP < 0).reduce((sum, t) => sum + t.amountGBP, 0)
  );

  const transactionCount = regularTransactions.length;
  const avgTransaction = calculateAverageTransaction(regularTransactions);
  const overUnder = budget ? totalSpend - budget : null;
  const remainingBudget = budget ? budget - totalSpend : 0;

  // Determine over/under type with nuanced categories
  let overUnderType: 'over' | 'just-over' | 'under' | 'just-under' | 'on-target' = 'on-target';
  let overUnderLabel = 'On target';

  if (overUnder !== null && budget) {
    const percentageVariance = (overUnder / budget) * 100;

    if (Math.abs(overUnder) < 1) {
      overUnderType = 'on-target';
      overUnderLabel = 'Right on budget!';
    } else if (overUnder > 0) {
      // Over budget
      if (percentageVariance <= 15) {
        overUnderType = 'just-over';
        overUnderLabel = `${formatMoney(overUnder)} over budget (${percentageVariance.toFixed(1)}%)`;
      } else {
        overUnderType = 'over';
        overUnderLabel = `${formatMoney(overUnder)} over budget (${percentageVariance.toFixed(1)}%)`;
      }
    } else {
      // Under budget
      if (Math.abs(percentageVariance) <= 15) {
        overUnderType = 'just-under';
        overUnderLabel = `${formatMoney(Math.abs(overUnder))} under budget (${Math.abs(percentageVariance).toFixed(1)}%)`;
      } else {
        overUnderType = 'under';
        overUnderLabel = `${formatMoney(Math.abs(overUnder))} under budget (${Math.abs(percentageVariance).toFixed(1)}%)`;
      }
    }
  }

  console.log(`   💰 Total spend (regular): ${formatMoney(totalSpend)}`);
  console.log(`   🎯 Budget: ${budget ? formatMoney(budget) : 'Not set'}`);
  console.log(`   📊 ${overUnderLabel}`);

  // Step 5: Generate data aggregations from REGULAR transactions
  console.log("\n📈 Step 5: Aggregating spending data...");

  const biggestPurchases = extractBiggestPurchases(regularTransactions, 5);
  const topMerchants = aggregateByMerchant(regularTransactions, 5);
  const categoryTotals = aggregateByCategory(regularTransactions);

  console.log(`   🛍️  Biggest regular purchases: ${biggestPurchases.length}`);
  console.log(`   🏪 Top merchants: ${topMerchants.length}`);
  console.log(`   📊 Categories: ${categoryTotals.length}`);

  // Step 6: Render HTML sections
  console.log("\n🎨 Step 6: Rendering email sections...");

  const biggestPurchasesHtml = renderBiggestPurchasesSection(biggestPurchases);
  const topMerchantsHtml = renderTopMerchantsSection(topMerchants);
  const largeTransactionsHtml = renderLargeTransactionsSection(largeTransactions);
  const excludedExpensesHtml = renderExcludedExpensesSection(excludedExpenses);

  console.log("   ✓ Sections rendered");

  // Step 7: Generate AI financial advice and spending breakdown
  console.log("\n🤖 Step 7: Generating AI analysis...");

  // Prepare all transactions for AI (capped at 100 for token efficiency)
  const allTransactionsForAI = regularTransactions
    .filter(t => t.amountGBP < 0) // Only spending transactions
    .sort((a, b) => a.amountGBP - b.amountGBP) // Sort by amount (biggest first)
    .slice(0, 100) // Cap at 100 transactions
    .map(t => ({
      description: t.description || 'Unknown',
      merchant: t.merchant || t.description || 'Unknown Merchant',
      amountFormatted: `£${Math.abs(t.amountGBP).toFixed(2)}`,
      date: t.postedDate,
    }));

  const adviceInput: AdviceInput = {
    periodLabel: generatePeriodLabel(dateWindow.from, dateWindow.to, period),
    dateRange: formatDateRange(dateWindow.from, dateWindow.to),
    totalSpend,
    budget,
    overUnder,
    transactionCount,
    biggestPurchases,
    topMerchants,
    categoryTotals,
    allTransactions: allTransactionsForAI,
  };

  const aiResponse = await generateFinancialAdviceAndBreakdown(adviceInput);
  console.log("   ✓ AI analysis complete");

  // Step 8: Build template data and render email
  console.log("\n📧 Step 8: Building email from template...");

  const templateData: BudgetEmailTemplateData = {
    periodLabel: adviceInput.periodLabel,
    dateRange: adviceInput.dateRange,
    totalSpend: formatMoney(totalSpend),
    budget: budget ? formatMoney(budget) : 'Not set',
    overUnderLabel,
    overUnderType,
    transactionCount,
    avgTransaction: formatMoney(avgTransaction),
    remainingBudget: formatMoney(remainingBudget),
    biggestPurchasesHtml,
    topMerchantsHtml,
    spendingBreakdownHtml: aiResponse.spendingBreakdown,
    largeTransactionsHtml,
    excludedExpensesHtml,
    advisorAdviceHtml: aiResponse.advice,
  };

  const htmlContent = renderBudgetEmail(templateData);
  console.log("   ✓ Email HTML generated");

  // Step 9: Send email with emoji in subject
  const periodLabel = period === "weekly" ? "Weekly" : period === "monthly" ? "Monthly" : "Custom";
  const emoji = period === "weekly" ? "📅" : period === "monthly" ? "📊" : "📋";
  const subject = `${emoji} ${periodLabel} Budget Report`;

  console.log(`\n📧 Step 9: Sending email...`);
  await sendBudgetEmail(subject, htmlContent, recipient);

  console.log(`\n✅ ${periodLabel} budget alert completed successfully!`);
  console.log("=".repeat(60) + "\n");
}
