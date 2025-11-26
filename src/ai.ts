/**
 * OpenAI integration for generating budget summaries
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { Txn } from "./types";
import { getWeeklyAllowance, getMonthlyAllowance, getLargeTransactionThreshold } from "./config";

const PROMPT_TEMPLATE_PATH = path.join(process.cwd(), "prompt-template.txt");

/**
 * Check if OpenAI is configured
 */
export function isAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Load prompt template from file
 */
function loadPromptTemplate(): string {
  try {
    if (fs.existsSync(PROMPT_TEMPLATE_PATH)) {
      return fs.readFileSync(PROMPT_TEMPLATE_PATH, "utf-8");
    }
  } catch (error: any) {
    console.warn("Failed to load prompt-template.txt, using default:", error.message);
  }

  // Default fallback if file doesn't exist
  return `You are a financial advisor. Analyze my spending for the period and provide personalized advice.

Key figures:
- Total spent: {{totalSpend}}
- Weekly Budget: {{weeklyAllowance}}
- Monthly Budget: {{monthlyAllowance}}
- Transactions count: {{transactionCount}}
- Large purchases (over £{{largeTransactionLimit}}): {{largePurchaseCount}}

Recent transactions (grouped by merchant):
{{transactionsSummary}}

Please provide:
1. A brief summary of my spending pattern
2. Whether I'm on track with my budget (ignoring large irregular purchases)
3. Two specific actionable tips to save money next week/month
4. Any notable spending patterns or concerns

Format your response as HTML with proper headings, bullet points, and bold text for emphasis.`;
}

/**
 * Group transactions by merchant and calculate totals
 */
function groupTransactionsByMerchant(transactions: Txn[]): any[] {
  const groups: { [key: string]: { merchant: string; count: number; total: number } } = {};

  for (const txn of transactions) {
    // Only include spending (negative amounts)
    if (txn.amountGBP >= 0) continue;

    const merchant = txn.merchant || txn.description || "Unknown";
    if (!groups[merchant]) {
      groups[merchant] = { merchant, count: 0, total: 0 };
    }
    groups[merchant].count++;
    groups[merchant].total += Math.abs(txn.amountGBP);
  }

  // Sort by total spending descending
  return Object.values(groups).sort((a, b) => b.total - a.total);
}

/**
 * Generate budget summary using OpenAI
 */
export async function generateBudgetSummary(
  transactions: Txn[],
  period: "weekly" | "monthly",
  dateFrom: string,
  dateTo: string
): Promise<string> {
  if (!isAIConfigured()) {
    throw new Error("OpenAI not configured. Please set OPENAI_API_KEY in .env");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Get budget settings from environment
  const weeklyAllowance = getWeeklyAllowance();
  const monthlyAllowance = getMonthlyAllowance();
  const largeTransactionThreshold = getLargeTransactionThreshold();

  // Calculate key figures
  const totalSpend = Math.abs(
    transactions.filter((t) => t.amountGBP < 0).reduce((sum, t) => sum + t.amountGBP, 0)
  );
  const totalCredits = transactions
    .filter((t) => t.amountGBP > 0)
    .reduce((sum, t) => sum + t.amountGBP, 0);
  const transactionCount = transactions.length;

  // Filter out large transactions
  const largePurchases = transactions.filter(
    (t) => t.amountGBP < 0 && Math.abs(t.amountGBP) >= largeTransactionThreshold
  );
  const regularTransactions = transactions.filter(
    (t) => !(t.amountGBP < 0 && Math.abs(t.amountGBP) >= largeTransactionThreshold)
  );
  const regularSpend = Math.abs(
    regularTransactions.filter((t) => t.amountGBP < 0).reduce((sum, t) => sum + t.amountGBP, 0)
  );

  // Group regular transactions by merchant
  const merchantGroups = groupTransactionsByMerchant(regularTransactions);
  const topMerchants = merchantGroups.slice(0, 10); // Top 10 merchants

  // Build transactions summary for prompt
  const transactionsSummary = topMerchants
    .map((g) => `- ${g.merchant}: £${g.total.toFixed(2)} (${g.count} transaction${g.count !== 1 ? "s" : ""})`)
    .join("\n");

  // Build large purchases list
  const largePurchasesList = largePurchases
    .map((t) => `- ${t.merchant || t.description}: £${Math.abs(t.amountGBP).toFixed(2)}`)
    .join("\n");

  // Load and prepare the prompt template
  let prompt = loadPromptTemplate();
  prompt = prompt.replace(/\{\{totalSpend\}\}/g, `£${regularSpend.toFixed(2)}`);
  prompt = prompt.replace(/\{\{weeklyAllowance\}\}/g, `£${weeklyAllowance}`);
  prompt = prompt.replace(/\{\{monthlyAllowance\}\}/g, `£${monthlyAllowance}`);
  prompt = prompt.replace(/\{\{transactionCount\}\}/g, transactionCount.toString());
  prompt = prompt.replace(/\{\{largeTransactionLimit\}\}/g, largeTransactionThreshold.toString());
  prompt = prompt.replace(/\{\{largePurchaseCount\}\}/g, largePurchases.length.toString());
  prompt = prompt.replace(/\{\{transactionsSummary\}\}/g, transactionsSummary);

  // Add context about large purchases if any
  if (largePurchases.length > 0) {
    prompt += `\n\nNote: The following large irregular purchases (over £${largeTransactionThreshold}) were excluded from the budget analysis:\n${largePurchasesList}`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful financial advisor. Provide clear, actionable advice in HTML format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("OpenAI returned empty response");
    }

    // Add period summary at the top
    const periodLabel = period === "weekly" ? "Weekly" : "Monthly";
    const budgetAmount = period === "weekly" ? weeklyAllowance : monthlyAllowance;
    const header = `
      <h1>${periodLabel} Budget Summary</h1>
      <p><strong>Period:</strong> ${dateFrom} to ${dateTo}</p>
      <hr>
      <h2>Key Figures</h2>
      <ul>
        <li><strong>Total Spend (regular):</strong> £${regularSpend.toFixed(2)}</li>
        <li><strong>Large Purchases (excluded):</strong> £${Math.abs(largePurchases.reduce((sum, t) => sum + t.amountGBP, 0)).toFixed(2)} (${largePurchases.length} transaction${largePurchases.length !== 1 ? "s" : ""})</li>
        <li><strong>Total Credits:</strong> £${totalCredits.toFixed(2)}</li>
        <li><strong>Transactions:</strong> ${transactionCount}</li>
        <li><strong>${periodLabel} Budget:</strong> £${budgetAmount}</li>
      </ul>
      <hr>
    `;

    return header + response;
  } catch (error: any) {
    console.error("❌ OpenAI API error:", error.message);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}
