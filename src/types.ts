/**
 * Type definitions for TrueLayer transaction aggregator
 */

/**
 * Stored token information
 */
export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch milliseconds
  token_type: string;
}

/**
 * TrueLayer account from Data API
 */
export interface TLAccount {
  account_id: string;
  account_type: string;
  display_name: string;
  currency: string;
  account_number?: {
    iban?: string;
    number?: string;
    sort_code?: string;
  };
  provider?: {
    provider_id: string;
    display_name: string;
  };
}

/**
 * TrueLayer card from Cards API
 */
export interface TLCard {
  card_id: string;
  card_type: string;
  display_name: string;
  currency: string;
  partial_card_number?: string;
  name_on_card?: string;
  valid_from?: string;
  valid_to?: string;
  provider?: {
    provider_id: string;
    display_name: string;
  };
}

/**
 * TrueLayer transaction from Data API
 */
export interface TLTransaction {
  transaction_id: string;
  timestamp: string;
  description: string;
  amount: number;
  currency: string;
  transaction_type: string;
  transaction_category: string;
  merchant_name?: string;
  running_balance?: {
    amount: number;
    currency: string;
  };
  meta?: any;
}

/**
 * Normalized transaction (no reconciliation)
 */
export interface Txn {
  sourceKind: "account" | "card";
  sourceId: string; // account_id or card_id
  provider: string;
  postedDate: string; // YYYY-MM-DD
  amountGBP: number; // negative for spend, positive for refunds
  currency: string;
  description: string;
  merchant?: string;
  status: "posted" | "pending";
  raw?: any; // original TL item for debugging
}

/**
 * Connected item (account or card)
 */
export type ConnectedItem =
  | {
      kind: "account";
      account_id: string;
      account_type: string;
      provider: string;
      display_name: string;
      currency: string;
    }
  | {
      kind: "card";
      card_id: string;
      card_type: string;
      provider: string;
      display_name: string;
      currency: string;
    };

/**
 * Account summary for output (backward compatibility)
 */
export interface AccountSummary {
  kind: "account" | "card";
  id: string; // account_id or card_id
  provider: string;
  type: string; // account_type or card_type
  display_name: string;
  currency: string;
}

/**
 * Excluded Expense row from Google Sheets
 * Required columns: Date, Vendor, Amount
 * Optional columns: Note
 */
export interface ExcludedExpenseRow {
  dateISO: string; // YYYY-MM-DD (required)
  vendor: string;   // (required)
  amountGBP: number; // positive value (required)
  note?: string;    // (optional)
}

// Backward compatibility alias
export type ReimbursementRow = ExcludedExpenseRow;

/**
 * Final output structure
 */
export interface TransactionOutput {
  window: {
    from: string;
    to: string;
    mode: WindowMode;
    customBudget?: number; // Optional custom budget for custom date ranges
  };
  budget: {
    amount: number; // The budget amount for this period
    source: 'weekly' | 'monthly' | 'custom' | 'calculated'; // Where the budget came from
    days: number; // Number of days in the period
    dailyRate: number; // Budget per day (for display/reference)
  };
  accounts: AccountSummary[];
  transactions: Txn[];
  excludedExpenses?: ExcludedExpenseRow[]; // Optional Google Sheets data
  reimbursements?: ExcludedExpenseRow[]; // Deprecated: use excludedExpenses instead (kept for backward compatibility)
  sheetsError?: string; // Error message if sheets fetch failed
}

/**
 * Window calculation mode
 */
export type WindowMode = "weekly" | "monthly" | "custom";
