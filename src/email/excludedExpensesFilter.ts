/**
 * Utility for filtering excluded expenses from transactions
 * Uses fuzzy matching to handle cases where dates/vendors don't match exactly
 */

import { Txn, ExcludedExpenseRow } from "../types";

/**
 * Calculate string similarity using Levenshtein distance
 * Returns a value between 0 (completely different) and 1 (identical)
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Quick check: if one string contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8; // High similarity if substring match
  }

  // Levenshtein distance calculation
  const matrix: number[][] = [];

  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  const distance = matrix[s2.length][s1.length];
  return 1 - distance / maxLength;
}

/**
 * Calculate date proximity score
 * Returns 1 for exact match, decreasing as dates get further apart
 */
function dateSimilarity(date1: string, date2: string, maxDaysDiff: number = 3): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const diffMs = Math.abs(d1.getTime() - d2.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return 1;
  if (diffDays > maxDaysDiff) return 0;

  // Linear decay: 1.0 at 0 days, 0.0 at maxDaysDiff
  return 1 - (diffDays / maxDaysDiff);
}

/**
 * Check if a transaction matches an excluded expense
 * Uses fuzzy matching with configurable thresholds
 */
interface MatchScore {
  matches: boolean;
  score: number;
  reason?: string;
}

function matchesExcludedExpense(
  transaction: Txn,
  excludedExpense: ExcludedExpenseRow,
  dateWindow: { from: string; to: string }
): MatchScore {
  // Amount must match exactly (or very close, within 1 penny)
  const txnAmount = Math.abs(transaction.amountGBP);
  const excludedAmount = excludedExpense.amountGBP;
  const amountDiff = Math.abs(txnAmount - excludedAmount);

  if (amountDiff > 0.01) {
    // Amounts don't match - not the same transaction
    return { matches: false, score: 0 };
  }

  // Amount matches! Now check if this excluded expense is within the date window
  const excludedDate = excludedExpense.dateISO;
  const isInWindow = excludedDate >= dateWindow.from && excludedDate <= dateWindow.to;

  if (!isInWindow) {
    // Excluded expense is outside the date window - don't filter this transaction
    return { matches: false, score: 0 };
  }

  // Now check vendor/description similarity
  const txnVendor = (transaction.merchant || transaction.description || '').toLowerCase().trim();
  const excludedVendor = excludedExpense.vendor.toLowerCase().trim();

  // Check transaction date proximity (for cases where multiple matching amounts exist)
  const dateScore = dateSimilarity(transaction.postedDate, excludedExpense.dateISO);
  const vendorScore = stringSimilarity(txnVendor, excludedVendor);

  // Combined matching logic:
  // 1. If dates match exactly and vendor is similar (> 0.6), it's a match
  // 2. If vendor matches very closely (> 0.8), date proximity matters less
  // 3. Otherwise, need both reasonable date and vendor similarity

  if (dateScore >= 0.9 && vendorScore >= 0.6) {
    return {
      matches: true,
      score: dateScore * 0.5 + vendorScore * 0.5,
      reason: `Exact date + vendor match (${vendorScore.toFixed(2)})`
    };
  }

  if (vendorScore >= 0.8) {
    return {
      matches: true,
      score: vendorScore,
      reason: `Strong vendor match (${vendorScore.toFixed(2)})`
    };
  }

  if (dateScore >= 0.7 && vendorScore >= 0.5) {
    return {
      matches: true,
      score: dateScore * 0.4 + vendorScore * 0.6,
      reason: `Date proximity + vendor similarity (date: ${dateScore.toFixed(2)}, vendor: ${vendorScore.toFixed(2)})`
    };
  }

  // No sufficient match
  return { matches: false, score: dateScore * 0.4 + vendorScore * 0.6 };
}

/**
 * Filter out excluded expenses from a list of transactions
 * Returns transactions that are NOT excluded expenses
 */
export function filterExcludedExpenses(
  transactions: Txn[],
  excludedExpenses: ExcludedExpenseRow[],
  dateWindow: { from: string; to: string }
): Txn[] {
  if (!excludedExpenses || excludedExpenses.length === 0) {
    return transactions;
  }

  const filtered: Txn[] = [];
  let excludedCount = 0;

  for (const txn of transactions) {
    // Only check negative amounts (spending)
    if (txn.amountGBP >= 0) {
      filtered.push(txn);
      continue;
    }

    // Check if this transaction matches any excluded expense
    let isExcluded = false;
    for (const excluded of excludedExpenses) {
      const matchResult = matchesExcludedExpense(txn, excluded, dateWindow);
      if (matchResult.matches) {
        console.log(`   ⊖ Excluding: ${txn.merchant || txn.description} £${Math.abs(txn.amountGBP).toFixed(2)} - ${matchResult.reason}`);
        isExcluded = true;
        excludedCount++;
        break;
      }
    }

    if (!isExcluded) {
      filtered.push(txn);
    }
  }

  if (excludedCount > 0) {
    console.log(`   ✓ Filtered out ${excludedCount} excluded expense(s) from ${transactions.length} transactions`);
  }

  return filtered;
}

/**
 * Get list of excluded expenses that were actually matched and filtered
 * Useful for showing "what was excluded" in reports
 */
export function getMatchedExcludedExpenses(
  transactions: Txn[],
  excludedExpenses: ExcludedExpenseRow[],
  dateWindow: { from: string; to: string }
): ExcludedExpenseRow[] {
  if (!excludedExpenses || excludedExpenses.length === 0) {
    return [];
  }

  const matched: ExcludedExpenseRow[] = [];

  for (const excluded of excludedExpenses) {
    // Check if this excluded expense matches any transaction in the window
    for (const txn of transactions) {
      if (txn.amountGBP >= 0) continue; // Only check spending

      const matchResult = matchesExcludedExpense(txn, excluded, dateWindow);
      if (matchResult.matches) {
        matched.push(excluded);
        break; // Found a match, move to next excluded expense
      }
    }
  }

  return matched;
}
