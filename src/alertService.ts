/**
 * Budget alert service - orchestrates fetching data, generating summaries, and sending emails
 * Now uses the modern HTML email template system with excluded expenses filtering
 */

import { WindowMode, ExcludedExpenseRow } from "./types";
import { calculateDateWindow, listAllTransactionsFromAllTokens, getDummyData } from "./data";
import { sendBudgetEmail } from "./email";
import { getWeeklyAllowance, getMonthlyAllowance, getLargeTransactionThreshold } from "./config";
import { fetchExcludedExpenses, isSheetsConfigured } from "./sheets";

// Email template system
import { renderBudgetEmail } from "./email/budgetEmailTemplate";
import { BudgetEmailTemplateData, AdviceInput } from "./email/types";
import { generateFinancialAdviceAndBreakdown } from "./email/financialAdvice";
import { filterExcludedExpenses } from "./email/excludedExpensesFilter";
import {
  renderBiggestPurchasesSection,
  renderTopMerchantsSection,
  renderLargeTransactionsSection
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
 * Send budget alert for a specific period
 */
export async function sendBudgetAlertForPeriod(
  period: "weekly" | "monthly",
  recipient?: string
): Promise<void> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 BUDGET ALERT: ${period.toUpperCase()}`);
  console.log("=".repeat(60));

  // Step 1: Fetch transaction data
  let transactions;
  let dateWindow;

  console.log("\n🔄 Step 1: Fetching transaction data...");
  if (MODE === "dummy") {
    console.log("   📦 Using dummy data (MODE=dummy)");
    const dummyData = getDummyData(period);
    transactions = dummyData.transactions;
    dateWindow = dummyData.window;
  } else {
    dateWindow = calculateDateWindow(period);
    console.log(`   📅 Date range: ${dateWindow.from} to ${dateWindow.to}`);
    const result = await listAllTransactionsFromAllTokens(
      CLIENT_ID,
      CLIENT_SECRET,
      TOKEN_URL,
      dateWindow.from,
      dateWindow.to,
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

  const budget = period === "weekly" ? getWeeklyAllowance() : getMonthlyAllowance();

  const totalSpend = Math.abs(
    regularTransactions.filter(t => t.amountGBP < 0).reduce((sum, t) => sum + t.amountGBP, 0)
  );

  const transactionCount = regularTransactions.length;
  const avgTransaction = calculateAverageTransaction(regularTransactions);
  const overUnder = budget ? totalSpend - budget : null;
  const remainingBudget = budget ? budget - totalSpend : 0;

  // Determine over/under type
  let overUnderType: 'over' | 'under' | 'on-target' = 'on-target';
  let overUnderLabel = 'On target';
  if (overUnder !== null) {
    if (Math.abs(overUnder) < 1) {
      overUnderType = 'on-target';
      overUnderLabel = 'Right on budget!';
    } else if (overUnder > 0) {
      overUnderType = 'over';
      overUnderLabel = `${formatMoney(overUnder)} over budget`;
    } else {
      overUnderType = 'under';
      overUnderLabel = `${formatMoney(Math.abs(overUnder))} under budget`;
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

  console.log("   ✓ Sections rendered");

  // Step 7: Generate AI financial advice and spending breakdown
  console.log("\n🤖 Step 7: Generating AI analysis...");

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
    advisorAdviceHtml: aiResponse.advice,
  };

  const htmlContent = renderBudgetEmail(templateData);
  console.log("   ✓ Email HTML generated");

  // Step 9: Send email with emoji in subject
  const periodLabel = period === "weekly" ? "Weekly" : "Monthly";
  const emoji = period === "weekly" ? "📅" : "📊";
  const subject = `${emoji} ${periodLabel} Budget Summary`;

  console.log(`\n📧 Step 9: Sending email...`);
  await sendBudgetEmail(subject, htmlContent, recipient);

  console.log(`\n✅ ${periodLabel} budget alert completed successfully!`);
  console.log("=".repeat(60) + "\n");
}
