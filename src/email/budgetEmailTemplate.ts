/**
 * Universal Budget Email Template for Weekly and Monthly Reports
 * Email-client compatible (no interactive HTML), tight and clean layout
 */

import { BudgetEmailTemplateData } from "./types";

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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9;">

  <table role="presentation" style="width: 100%; max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">

    <!-- Header -->
    <tr>
      <td style="padding: 32px 24px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">💰</div>
        <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.025em;">
          ${data.periodLabel}
        </h1>
        <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500;">${data.dateRange}</p>
      </td>
    </tr>

    <!-- Key Stats -->
    <tr>
      <td style="padding: 24px;">
        <table role="presentation" class="stack-sm" style="width: 100%; border-collapse: separate; border-spacing: 8px;">
          <tr>
            <td style="width: 33.33%; text-align: center; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">Spent</div>
              <div class="stat-value" style="font-size: 24px; font-weight: 800; color: #0f172a;">${data.totalSpend}</div>
            </td>
            <td style="width: 33.33%; text-align: center; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">Budget</div>
              <div class="stat-value" style="font-size: 24px; font-weight: 800; color: #0f172a;">${data.budget}</div>
            </td>
            <td style="width: 33.33%; text-align: center; padding: 16px; background: ${overUnderBg}; border-radius: 12px; border: 1px solid ${overUnderColor}30;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${overUnderColor}; margin-bottom: 8px;">${data.overUnderType === 'over' ? 'Over' : 'Under'}</div>
              <div class="stat-value" style="font-size: 24px; font-weight: 800; color: ${overUnderColor};">${data.remainingBudget.replace('-', '')}</div>
            </td>
          </tr>
        </table>

        <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
          <span style="font-size: 12px; color: #64748b; font-weight: 500;">${data.transactionCount} transactions</span>
          <span style="margin: 0 8px; color: #cbd5e1;">•</span>
          <span style="font-size: 12px; color: #64748b; font-weight: 500;">${data.avgTransaction} average</span>
        </div>
      </td>
    </tr>

    ${data.spendingBreakdownHtml ? `
    <!-- Spending Breakdown by Category -->
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; display: flex; align-items: center;">
            <span style="margin-right: 8px;">📊</span> Spending by Category
          </h2>
          ${data.spendingBreakdownHtml}
        </div>
      </td>
    </tr>
    ` : ''}

    ${data.advisorAdviceHtml ? `
    <!-- Financial Insights -->
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; display: flex; align-items: center;">
            <span style="margin-right: 8px;">💡</span> Financial Insights
          </h2>
          <div style="padding: 16px; background: #f5f3ff; border-radius: 12px; border: 1px solid #ddd6fe; font-size: 14px; color: #4c1d95; line-height: 1.6;">
            ${data.advisorAdviceHtml}
          </div>
        </div>
      </td>
    </tr>
    ` : ''}

    ${data.topMerchantsHtml ? `
    <!-- Top Merchants -->
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🏪</span> Top Merchants
          </h2>
          <div style="font-size: 14px; color: #334155; line-height: 1.5;">
            ${data.topMerchantsHtml}
          </div>
        </div>
      </td>
    </tr>
    ` : ''}

    ${data.biggestPurchasesHtml ? `
    <!-- Largest Purchases -->
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🛍️</span> Largest Purchases
          </h2>
          <div style="font-size: 14px; color: #334155; line-height: 1.5;">
            ${data.biggestPurchasesHtml}
          </div>
        </div>
      </td>
    </tr>
    ` : ''}

    ${data.largeTransactionsHtml ? `
    <!-- Large Transactions Excluded from Budget -->
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #92400e; display: flex; align-items: center;">
            <span style="margin-right: 8px;">⚠️</span> Large Transactions (Excluded)
          </h2>
          <div style="padding: 16px; background: #fffbeb; border-radius: 12px; border: 1px solid #fcd34d; font-size: 13px; color: #92400e; line-height: 1.5;">
            <div style="margin-bottom: 8px; font-weight: 600;">
              These transactions were excluded from your budget calculations:
            </div>
            ${data.largeTransactionsHtml}
          </div>
        </div>
      </td>
    </tr>
    ` : ''}

    ${data.excludedExpensesHtml ? `
    <!-- Excluded Expenses (Work/Reimbursements) -->
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #374151; display: flex; align-items: center;">
            <span style="margin-right: 8px;">📄</span> Excluded Expenses
          </h2>
          <div style="padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 13px; color: #475569; line-height: 1.5;">
            <div style="margin-bottom: 8px; font-weight: 600;">
              Work reimbursements and other filtered expenses:
            </div>
            ${data.excludedExpensesHtml}
          </div>
        </div>
      </td>
    </tr>
    ` : ''}

    <!-- Footer -->
    <tr>
      <td style="padding: 32px 24px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          Generated with 💜 by Budgeter
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
  `;
}
