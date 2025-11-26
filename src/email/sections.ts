/**
 * HTML section renderers for email template
 * Each function returns an HTML fragment with inline styles
 */

import { Purchase, MerchantTotal, CategoryTotal } from "./types";

/**
 * Render biggest purchases section
 */
export function renderBiggestPurchasesSection(purchases: Purchase[]): string {
  if (purchases.length === 0) {
    return '<p style="margin: 0; color: #6b7280; font-size: 14px;">No large purchases this period.</p>';
  }

  const rows = purchases.map(p => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: 500; color: #111827; margin-bottom: 2px;">${escapeHtml(p.merchant)}</div>
        <div style="font-size: 13px; color: #6b7280;">${escapeHtml(p.description)}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <span style="font-weight: 600; color: #111827; font-size: 15px;">${p.amountFormatted}</span>
      </td>
    </tr>
  `).join('');

  return `
    <table style="width: 100%; border-collapse: collapse;">
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

/**
 * Render top merchants section
 */
export function renderTopMerchantsSection(merchants: MerchantTotal[]): string {
  if (merchants.length === 0) {
    return '<p style="margin: 0; color: #6b7280; font-size: 14px;">No merchant data available.</p>';
  }

  const rows = merchants.map(m => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: 500; color: #111827;">${escapeHtml(m.name)}</div>
        <div style="font-size: 13px; color: #6b7280;">${m.transactionCount} transaction${m.transactionCount !== 1 ? 's' : ''}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <span style="font-weight: 600; color: #111827; font-size: 15px;">${m.amountFormatted}</span>
      </td>
    </tr>
  `).join('');

  return `
    <table style="width: 100%; border-collapse: collapse;">
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
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
 * Render large transactions section (excluded from budget calculations)
 */
export function renderLargeTransactionsSection(purchases: Purchase[]): string {
  if (purchases.length === 0) {
    return '<p style="margin: 0; color: #6b7280; font-size: 14px;">No large transactions this period.</p>';
  }

  const rows = purchases.map(p => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: 500; color: #111827; margin-bottom: 2px;">${escapeHtml(p.merchant)}</div>
        <div style="font-size: 13px; color: #6b7280;">${escapeHtml(p.description)}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <span style="font-weight: 600; color: #ef4444; font-size: 15px;">${p.amountFormatted}</span>
      </td>
    </tr>
  `).join('');

  return `
    <table style="width: 100%; border-collapse: collapse;">
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
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
