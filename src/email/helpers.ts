/**
 * Helper functions for data aggregation and formatting for email templates
 */

import { Txn } from "../types";
import { Purchase, MerchantTotal, CategoryTotal } from "./types";

/**
 * Format money value to string with currency symbol
 */
export function formatMoney(amount: number): string {
  return `£${Math.abs(amount).toFixed(2)}`;
}

/**
 * Format date range for display
 */
export function formatDateRange(fromDate: string, toDate: string): string {
  const from = new Date(fromDate);
  const to = new Date(toDate);

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return `${from.toLocaleDateString('en-GB', options)} – ${to.toLocaleDateString('en-GB', options)}`;
}

/**
 * Generate period label (e.g., "Week of 3–9 March 2025")
 */
export function generatePeriodLabel(fromDate: string, toDate: string, period: 'weekly' | 'monthly'): string {
  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (period === 'weekly') {
    const monthName = from.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    return `Week of ${from.getDate()}–${to.getDate()} ${monthName}`;
  } else {
    return from.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }
}

/**
 * Extract large transactions (above threshold, excluded from budget)
 * These are shown separately to highlight them
 */
export function extractLargeTransactions(transactions: Txn[], threshold: number): Purchase[] {
  return transactions
    .filter(t => t.amountGBP < 0 && Math.abs(t.amountGBP) >= threshold) // Spending only, above threshold
    .sort((a, b) => a.amountGBP - b.amountGBP) // Most negative first (biggest spend)
    .map(t => ({
      description: t.description || 'Unknown',
      merchant: t.merchant || t.description || 'Unknown Merchant',
      amountFormatted: formatMoney(t.amountGBP),
      date: t.postedDate,
    }));
}

/**
 * Extract biggest purchases from REGULAR transactions (not large, not excluded)
 * These are the largest regular expenses within the budget
 */
export function extractBiggestPurchases(transactions: Txn[], limit: number = 5): Purchase[] {
  return transactions
    .filter(t => t.amountGBP < 0) // Spending only (already filtered for large/excluded elsewhere)
    .sort((a, b) => a.amountGBP - b.amountGBP) // Most negative first (biggest spend)
    .slice(0, limit)
    .map(t => ({
      description: t.description || 'Unknown',
      merchant: t.merchant || t.description || 'Unknown Merchant',
      amountFormatted: formatMoney(t.amountGBP),
      date: t.postedDate,
    }));
}

/**
 * Aggregate spending by merchant
 */
export function aggregateByMerchant(transactions: Txn[], limit: number = 5): MerchantTotal[] {
  const merchantMap = new Map<string, { total: number; count: number }>();

  for (const txn of transactions) {
    if (txn.amountGBP >= 0) continue; // Only spending

    const merchant = txn.merchant || txn.description || 'Unknown';
    const existing = merchantMap.get(merchant) || { total: 0, count: 0 };
    merchantMap.set(merchant, {
      total: existing.total + Math.abs(txn.amountGBP),
      count: existing.count + 1,
    });
  }

  return Array.from(merchantMap.entries())
    .map(([name, data]) => ({
      name,
      amountFormatted: formatMoney(data.total),
      transactionCount: data.count,
    }))
    .sort((a, b) => {
      // Extract numeric values for sorting
      const aVal = parseFloat(a.amountFormatted.replace(/[^0-9.]/g, ''));
      const bVal = parseFloat(b.amountFormatted.replace(/[^0-9.]/g, ''));
      return bVal - aVal;
    })
    .slice(0, limit);
}

/**
 * Aggregate spending by category
 * Note: This is a simple categorizer based on merchant names
 * You can enhance this with more sophisticated category detection
 */
export function aggregateByCategory(transactions: Txn[]): CategoryTotal[] {
  const totalSpend = Math.abs(
    transactions.filter(t => t.amountGBP < 0).reduce((sum, t) => sum + t.amountGBP, 0)
  );

  if (totalSpend === 0) {
    return [];
  }

  // Simple category mapping based on merchant keywords
  const categoryMap = new Map<string, number>();

  for (const txn of transactions) {
    if (txn.amountGBP >= 0) continue; // Only spending

    const merchant = (txn.merchant || txn.description || '').toLowerCase();
    const category = categorizeTransaction(merchant);
    const existing = categoryMap.get(category) || 0;
    categoryMap.set(category, existing + Math.abs(txn.amountGBP));
  }

  return Array.from(categoryMap.entries())
    .map(([name, amount]) => ({
      name,
      amountFormatted: formatMoney(amount),
      percentageOfTotal: (amount / totalSpend) * 100,
    }))
    .sort((a, b) => b.percentageOfTotal - a.percentageOfTotal)
    .slice(0, 6); // Top 6 categories
}

/**
 * Simple category detection based on merchant name keywords
 */
function categorizeTransaction(merchantName: string): string {
  const name = merchantName.toLowerCase();

  // Food & Dining
  if (name.includes('restaurant') || name.includes('cafe') || name.includes('coffee') ||
      name.includes('pizza') || name.includes('takeaway') || name.includes('delivery') ||
      name.includes('uber eats') || name.includes('deliveroo') || name.includes('just eat') ||
      name.includes('mcdonald') || name.includes('kfc') || name.includes('subway') ||
      name.includes('nando') || name.includes('pret') || name.includes('starbucks') ||
      name.includes('costa') || name.includes('nero')) {
    return 'Food & Dining';
  }

  // Groceries
  if (name.includes('tesco') || name.includes('sainsbury') || name.includes('asda') ||
      name.includes('morrisons') || name.includes('aldi') || name.includes('lidl') ||
      name.includes('waitrose') || name.includes('coop') || name.includes('marks & spencer') ||
      name.includes('m&s') || name.includes('supermarket') || name.includes('groceries')) {
    return 'Groceries';
  }

  // Transport
  if (name.includes('uber') || name.includes('taxi') || name.includes('transport') ||
      name.includes('train') || name.includes('bus') || name.includes('tube') ||
      name.includes('tfl') || name.includes('oyster') || name.includes('parking') ||
      name.includes('petrol') || name.includes('fuel') || name.includes('shell') ||
      name.includes('bp ') || name.includes('esso')) {
    return 'Transport';
  }

  // Shopping
  if (name.includes('amazon') || name.includes('ebay') || name.includes('shop') ||
      name.includes('store') || name.includes('retail') || name.includes('asos') ||
      name.includes('zara') || name.includes('h&m') || name.includes('primark') ||
      name.includes('next') || name.includes('argos')) {
    return 'Shopping';
  }

  // Entertainment
  if (name.includes('cinema') || name.includes('netflix') || name.includes('spotify') ||
      name.includes('disney') || name.includes('prime video') || name.includes('entertainment') ||
      name.includes('theatre') || name.includes('gym') || name.includes('fitness')) {
    return 'Entertainment';
  }

  // Bills & Utilities
  if (name.includes('electric') || name.includes('gas') || name.includes('water') ||
      name.includes('council') || name.includes('tax') || name.includes('insurance') ||
      name.includes('phone') || name.includes('broadband') || name.includes('vodafone') ||
      name.includes('ee ') || name.includes('o2') || name.includes('three')) {
    return 'Bills & Utilities';
  }

  // Health
  if (name.includes('pharmacy') || name.includes('boots') || name.includes('superdrug') ||
      name.includes('doctor') || name.includes('dentist') || name.includes('hospital') ||
      name.includes('medical') || name.includes('health')) {
    return 'Health';
  }

  return 'Other';
}

/**
 * Calculate average transaction amount
 */
export function calculateAverageTransaction(transactions: Txn[]): number {
  const spending = transactions.filter(t => t.amountGBP < 0);
  if (spending.length === 0) return 0;

  const total = Math.abs(spending.reduce((sum, t) => sum + t.amountGBP, 0));
  return total / spending.length;
}
