/**
 * HTML section renderers for email template
 * Each function returns an HTML fragment with inline styles
 */

import { Purchase, MerchantTotal, CategoryTotal } from "./types";
import { ExcludedExpenseRow } from "../types";

/**
 * Render biggest purchases section - compact list format
 */
export function renderBiggestPurchasesSection(purchases: Purchase[]): string {
  if (purchases.length === 0) {
    return '<p style="margin: 0; color: #9ca3af; font-size: 13px;">No large purchases this period.</p>';
  }

  const items = purchases.map((p, index) => `
    <div style="margin-bottom: 12px; padding: 14px; background: rgba(59, 130, 246, 0.05); border-left: 3px solid #3b82f6; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-weight: 700; font-size: 15px; color: #1f2937;">${index + 1}. ${escapeHtml(p.merchant)}</span>
        <span style="font-weight: 800; color: #ef4444; font-size: 16px;">${p.amountFormatted}</span>
      </div>
      <div style="font-size: 13px; color: #6b7280; line-height: 1.4;">${escapeHtml(p.description)}</div>
    </div>
  `).join('');

  return items;
}

/**
 * Render top merchants section - compact inline format
 */
export function renderTopMerchantsSection(merchants: MerchantTotal[]): string {
  if (merchants.length === 0) {
    return '<p style="margin: 0; color: #9ca3af; font-size: 13px;">No merchant data available.</p>';
  }

  const items = merchants.map((m, index) => `
    <div style="margin-bottom: 10px; padding: 12px; background: rgba(16, 185, 129, 0.05); border-left: 3px solid #10b981; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span style="font-weight: 700; font-size: 15px; color: #1f2937;">${index + 1}. ${escapeHtml(m.name)}</span>
        <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${m.transactionCount} transaction${m.transactionCount !== 1 ? 's' : ''}</div>
      </div>
      <span style="font-weight: 800; color: #10b981; font-size: 16px;">${m.amountFormatted}</span>
    </div>
  `).join('');

  return items;
}

/**
 * Render category breakdown section
 */
export function renderCategoryBreakdownSection(categories: CategoryTotal[]): string {
  if (categories.length === 0) {
    return '<p style="margin: 0; color: #6b7280; font-size: 14px;">No category data available.</p>';
  }

  const rows = categories.map(cat => {
    // Color bars based on percentage
    const barColor = cat.percentageOfTotal > 30 ? '#ef4444' : cat.percentageOfTotal > 15 ? '#f59e0b' : '#6366f1';
    const barBg = cat.percentageOfTotal > 30 ? 'rgba(239, 68, 68, 0.1)' : cat.percentageOfTotal > 15 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)';

    return `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid rgba(0,0,0,0.05);">
          <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-size: 15px; color: #1f2937;">${escapeHtml(cat.name)}</span>
            <span style="font-weight: 800; font-size: 15px; color: ${barColor};">${cat.amountFormatted}</span>
          </div>
          <div style="clear: both; background: ${barBg}; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
            <div style="background: ${barColor}; height: 100%; width: ${Math.min(cat.percentageOfTotal, 100)}%; border-radius: 4px; box-shadow: 0 0 8px ${barColor}40;"></div>
          </div>
          <div style="margin-top: 6px; font-size: 13px; color: #6b7280; font-weight: 600;">${cat.percentageOfTotal.toFixed(1)}% of total spending</div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <table style="width: 100%; border-collapse: collapse;">
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

/**
 * Render large transactions section (excluded from budget calculations) - compact format
 */
export function renderLargeTransactionsSection(purchases: Purchase[]): string {
  if (purchases.length === 0) {
    return '';
  }

  const items = purchases.map(p => `
    <div style="margin-bottom: 6px;">
      <span style="font-weight: 600; color: #92400e;">${escapeHtml(p.merchant)}</span>
      <span style="color: #b45309;"> · ${p.amountFormatted}</span>
      <div style="font-size: 11px; color: #92400e; opacity: 0.8; margin-top: 2px;">${escapeHtml(p.description)}</div>
    </div>
  `).join('');

  return items;
}

/**
 * Render excluded expenses section (work reimbursements etc)
 */
export function renderExcludedExpensesSection(expenses: ExcludedExpenseRow[]): string {
  if (expenses.length === 0) {
    return '';
  }

  const items = expenses.map(e => `
    <div style="margin-bottom: 6px;">
      <span style="font-weight: 600;">${escapeHtml(e.vendor)}</span>
      <span style="opacity: 0.7;"> · £${e.amountGBP.toFixed(2)}</span>
      <div style="font-size: 11px; opacity: 0.6; margin-top: 2px;">${escapeHtml(e.note || '')}</div>
    </div>
  `).join('');

  return items;
}

/**
 * Helper function to escape HTML entities
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
