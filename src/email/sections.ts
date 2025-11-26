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

  const items = purchases.map(p => `
    <div style="margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid #f3f4f6;">
      <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">${escapeHtml(p.merchant)} <span style="font-weight: 700; color: #ef4444;">${p.amountFormatted}</span></div>
      <div style="font-size: 12px; color: #6b7280;">${escapeHtml(p.description)}</div>
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

  const items = merchants.map(m => `
    <div style="margin-bottom: 4px;">
      <span style="font-weight: 600; color: #111827;">${escapeHtml(m.name)}</span>
      <span style="color: #6b7280;"> · ${m.amountFormatted} · ${m.transactionCount} transaction${m.transactionCount !== 1 ? 's' : ''}</span>
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

    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="margin-bottom: 6px;">
            <span style="font-weight: 500; color: #111827;">${escapeHtml(cat.name)}</span>
            <span style="float: right; font-weight: 600; color: #111827;">${cat.amountFormatted}</span>
          </div>
          <div style="clear: both; background: #f3f4f6; height: 6px; border-radius: 3px; overflow: hidden;">
            <div style="background: ${barColor}; height: 100%; width: ${Math.min(cat.percentageOfTotal, 100)}%; border-radius: 3px;"></div>
          </div>
          <div style="margin-top: 4px; font-size: 12px; color: #6b7280;">${cat.percentageOfTotal.toFixed(1)}% of total</div>
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
    <div style="margin-bottom: 4px;">
      <span style="font-weight: 600; color: #92400e;">${escapeHtml(p.merchant)}</span>
      <span style="color: #78350f;"> · ${p.amountFormatted}</span>
      <div style="font-size: 11px; color: #a16207; margin-top: 2px;">${escapeHtml(p.description)}</div>
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
    <div style="margin-bottom: 4px;">
      <span style="font-weight: 600; color: #374151;">${escapeHtml(e.vendor)}</span>
      <span style="color: #6b7280;"> · £${e.amountGBP.toFixed(2)}</span>
      <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;">${escapeHtml(e.note || '')}</div>
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
