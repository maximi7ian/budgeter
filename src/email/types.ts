/**
 * Type definitions for email templates
 */

export interface Purchase {
  description: string;
  merchant: string;
  amountFormatted: string;
  date?: string;
}

export interface MerchantTotal {
  name: string;
  amountFormatted: string;
  transactionCount: number;
}

export interface CategoryTotal {
  name: string;
  amountFormatted: string;
  percentageOfTotal: number;
}

/**
 * Universal email template data for both weekly and monthly budget reports
 */
export interface BudgetEmailTemplateData {
  periodLabel: string;       // e.g. "Week of 3–9 March 2025" or "March 2025"
  dateRange: string;          // "3 Mar 2025 – 9 Mar 2025" or "1 Mar 2025 – 31 Mar 2025"
  totalSpend: string;         // formatted, e.g. "£482.10"
  budget: string;             // formatted budget
  overUnderLabel: string;     // e.g. "£17.90 under budget" or "£26.50 over budget"
  overUnderType: 'over' | 'under' | 'on-target';
  transactionCount: number;
  avgTransaction: string;     // formatted
  remainingBudget: string;    // formatted, can be negative
  biggestPurchasesHtml: string;   // already-rendered HTML fragment
  topMerchantsHtml: string;       // HTML fragment
  spendingBreakdownHtml: string;  // AI-generated spending breakdown (replaces categoryBreakdownHtml)
  largeTransactionsHtml: string;  // Large transactions excluded from budget
  excludedExpensesHtml: string;   // Excluded expenses (work reimbursements etc)
  advisorAdviceHtml: string;      // HTML fragment from OpenAI
}

// Alias for backward compatibility (deprecated - use BudgetEmailTemplateData)
export type WeeklyEmailTemplateData = BudgetEmailTemplateData;

/**
 * Vendor within a category
 */
export interface AIVendor {
  name: string;   // e.g. "Tesco"
  amount: number; // e.g. 45.67
}

/**
 * AI-generated spending category
 */
export interface AICategory {
  name: string;       // e.g. "Food & Dining"
  emoji: string;      // e.g. "🍔"
  amount: number;     // e.g. 123.45 (raw number, not formatted)
  percentage: number; // e.g. 25.5 (raw number, not formatted)
  topVendors?: AIVendor[]; // Top 3 vendors in this category
}

/**
 * AI response structure containing categories, spending breakdown, and advice
 */
export interface AIResponse {
  categories: AICategory[];  // AI-generated spending categories
  spendingBreakdown: string; // HTML content for spending breakdown
  advice: string;            // HTML content for financial advice
}

export interface AdviceInput {
  periodLabel: string;
  dateRange: string;
  totalSpend: number;          // raw numbers
  budget: number | null;
  overUnder: number | null;    // positive = over, negative = under
  transactionCount: number;
  biggestPurchases: Purchase[];    // raw data, not HTML
  topMerchants: MerchantTotal[];
  categoryTotals: CategoryTotal[];
  previousPeriodSpend?: number;    // optional for trend
  allTransactions?: Purchase[];    // full transaction list (capped), for more creative AI analysis
}
