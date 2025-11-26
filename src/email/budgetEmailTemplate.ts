/**
 * Universal Budget Email Template for Weekly and Monthly Reports
 * Email-client compatible (no interactive HTML), tight and clean layout
 */

import { BudgetEmailTemplateData, AICategory } from "./types";

export function renderBudgetEmail(data: BudgetEmailTemplateData): string {
  const overUnderColor = data.overUnderType === 'over' ? '#ef4444' : data.overUnderType === 'under' ? '#10b981' : '#6b7280';
  const overUnderBg = data.overUnderType === 'over' ? '#fee2e2' : data.overUnderType === 'under' ? '#d1fae5' : '#f3f4f6';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.periodLabel}</title>
  <style>
    /* Mobile responsive only - stack stats vertically */
    @media only screen and (max-width: 599px) {
      .stack-sm td {
        display: block !important;
        width: 100% !important;
        padding: 12px !important;
        margin-bottom: 8px !important;
      }
      h1 {
        font-size: 24px !important;
      }
      .stat-value {
        font-size: 24px !important;
      }
      .category-col {
        display: block !important;
        width: 100% !important;
        padding: 6px 0 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb;">

  <table role="presentation" style="width: 100%; max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.06); overflow: hidden;">

    <!-- Header -->
    <tr>
      <td style="padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h1 style="margin: 0 0 6px 0; font-size: 28px; font-weight: 800; color: #ffffff;">
          💰 ${data.periodLabel}
        </h1>
        <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9);">${data.dateRange}</p>
      </td>
    </tr>

    <!-- Key Stats -->
    <tr>
      <td style="padding: 24px;">
        <table role="presentation" class="stack-sm" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 33.33%; text-align: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 6px;">Spent</div>
              <div class="stat-value" style="font-size: 24px; font-weight: 800; color: #ef4444;">${data.totalSpend}</div>
            </td>
            <td style="width: 33.33%; text-align: center; padding: 12px 8px;">
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 6px;">Budget</div>
              <div class="stat-value" style="font-size: 24px; font-weight: 800; color: #111827;">${data.budget}</div>
            </td>
            <td style="width: 33.33%; text-align: center; padding: 12px; background: ${overUnderBg}; border-radius: 8px;">
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${overUnderColor}; margin-bottom: 6px;">${data.overUnderType === 'over' ? 'Over' : 'Under'}</div>
              <div class="stat-value" style="font-size: 24px; font-weight: 800; color: ${overUnderColor};">${data.remainingBudget.replace('-', '')}</div>
            </td>
          </tr>
        </table>

        <div style="margin-top: 12px; padding: 10px; background: #f9fafb; border-radius: 6px; text-align: center;">
          <span style="font-size: 12px; color: #6b7280;">${data.transactionCount} transactions</span>
          <span style="margin: 0 6px; color: #d1d5db;">•</span>
          <span style="font-size: 12px; color: #6b7280;">${data.avgTransaction} average</span>
        </div>
      </td>
    </tr>

    ${data.spendingBreakdownHtml ? `
    <!-- Spending Breakdown by Category -->
    <tr>
      <td style="padding: 0 24px 16px 24px;">
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #111827;">
            📊 Spending by Category
          </h2>
          ${data.spendingBreakdownHtml}
        </div>
      </td>
    </tr>
    ` : ''}

    ${data.advisorAdviceHtml ? `
    <!-- Financial Insights -->
    <tr>
      <td style="padding: 0 24px 16px 24px;">
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #111827;">
            💡 Financial Insights
          </h2>
          <div style="padding: 12px 14px; background: #f5f3ff; border-radius: 8px; border-left: 3px solid #4f46e5; font-size: 13px; color: #374151; line-height: 1.5;">
            ${data.advisorAdviceHtml}
          </div>
        </div>
      </td>
    </tr>
    ` : ''}

    ${data.topMerchantsHtml ? `
    <!-- Top Merchants -->
    <tr>
      <td style="padding: 0 24px 16px 24px;">
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #111827;">
            🏪 Top Merchants
          </h2>
          <div style="font-size: 13px; color: #374151; line-height: 1.4;">
            ${data.topMerchantsHtml}
          </div>
        </div>
      </td>
    </tr>
    ` : ''}

    ${data.biggestPurchasesHtml ? `
    <!-- Largest Purchases -->
    <tr>
      <td style="padding: 0 24px 16px 24px;">
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #111827;">
            🛍️ Largest Purchases
          </h2>
          <div style="font-size: 13px; color: #374151; line-height: 1.4;">
            ${data.biggestPurchasesHtml}
          </div>
        </div>
      </td>
    </tr>
    ` : ''}

    ${data.largeTransactionsHtml ? `
    <!-- Large Transactions Excluded from Budget -->
    <tr>
      <td style="padding: 0 24px 16px 24px;">
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <h2 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #92400e;">
            ⚠️ Large Transactions Excluded from Budget
          </h2>
          <div style="padding: 10px 12px; background: #fffbeb; border-radius: 8px; border-left: 3px solid #f59e0b; font-size: 12px; color: #78350f; line-height: 1.4;">
            <div style="margin-bottom: 6px;">
              These transactions were excluded from your budget calculations:
            </div>
            ${data.largeTransactionsHtml}
          </div>
        </div>
      </td>
    </tr>
    ` : ''}

    <!-- Footer -->
    <tr>
      <td style="padding: 16px 24px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          Generated with 💜 by Budgeter
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
  `;
}
