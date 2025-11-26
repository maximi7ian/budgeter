/**
 * Minimal, Modern Email Template - Focus on Key Stats, Breakdown, and Insights
 */

import { WeeklyEmailTemplateData, AICategory } from "./types";

export function renderWeeklyBudgetEmail(data: WeeklyEmailTemplateData): string {
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
    /* Tooltip styles for desktop */
    @media only screen and (min-width: 600px) {
      .category-bar {
        position: relative;
        cursor: help;
      }
      .category-tooltip {
        visibility: hidden;
        position: absolute;
        background: #1f2937;
        color: #ffffff;
        padding: 10px 12px;
        border-radius: 6px;
        font-size: 12px;
        bottom: 100%;
        left: 0;
        margin-bottom: 8px;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 1000;
        white-space: nowrap;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      }
      .category-tooltip::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 20px;
        border-width: 5px;
        border-style: solid;
        border-color: #1f2937 transparent transparent transparent;
      }
      .category-bar:hover .category-tooltip {
        visibility: visible;
        opacity: 1;
      }
    }

    /* Collapsible sections */
    details {
      margin-bottom: 16px;
    }
    summary {
      cursor: pointer;
      font-weight: 600;
      padding: 12px 16px;
      background: #f9fafb;
      border-radius: 8px;
      list-style: none;
      user-select: none;
      transition: background 0.2s;
    }
    summary:hover {
      background: #f3f4f6;
    }
    summary::-webkit-details-marker {
      display: none;
    }
    summary::before {
      content: "▶ ";
      display: inline-block;
      margin-right: 8px;
      transition: transform 0.2s;
    }
    details[open] summary::before {
      transform: rotate(90deg);
    }
    .details-content {
      padding: 16px 0;
    }

    /* Mobile responsive */
    @media only screen and (max-width: 599px) {
      .stats-row td {
        display: block !important;
        width: 100% !important;
        padding: 12px !important;
        margin-bottom: 8px;
      }
      .category-tooltip {
        display: none;
      }
      h1 {
        font-size: 24px !important;
      }
      .stat-value {
        font-size: 24px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb;">

  <table role="presentation" style="width: 100%; max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); overflow: hidden;">

    <!-- Header -->
    <tr>
      <td style="padding: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 800; color: #ffffff;">
          💰 ${data.periodLabel}
        </h1>
        <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.9);">${data.dateRange}</p>
      </td>
    </tr>

    <!-- Key Stats -->
    <tr>
      <td style="padding: 32px;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 33.33%; text-align: center; padding: 16px; background: #f9fafb; border-radius: 12px;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 8px;">Spent</div>
              <div style="font-size: 28px; font-weight: 800; color: #ef4444;">${data.totalSpend}</div>
            </td>
            <td style="width: 33.33%; text-align: center; padding: 16px 8px;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 8px;">Budget</div>
              <div style="font-size: 28px; font-weight: 800; color: #111827;">${data.budget}</div>
            </td>
            <td style="width: 33.33%; text-align: center; padding: 16px; background: ${overUnderBg}; border-radius: 12px;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${overUnderColor}; margin-bottom: 8px;">${data.overUnderType === 'over' ? 'Over' : 'Under'}</div>
              <div style="font-size: 28px; font-weight: 800; color: ${overUnderColor};">${data.remainingBudget.replace('-', '')}</div>
            </td>
          </tr>
        </table>

        <div style="margin-top: 16px; padding: 12px; background: #f9fafb; border-radius: 8px; text-align: center;">
          <span style="font-size: 13px; color: #6b7280;">${data.transactionCount} transactions</span>
          <span style="margin: 0 8px; color: #d1d5db;">•</span>
          <span style="font-size: 13px; color: #6b7280;">${data.avgTransaction} average</span>
        </div>
      </td>
    </tr>

    ${data.spendingBreakdownHtml ? `
    <!-- Spending Breakdown with Progress Bars -->
    <tr>
      <td style="padding: 0 32px 32px 32px;">
        <div style="border-top: 2px solid #f3f4f6; padding-top: 24px;">
          <details open>
            <summary style="cursor: pointer; font-size: 20px; font-weight: 700; color: #111827; padding: 12px 16px; background: #f9fafb; border-radius: 8px; list-style: none; user-select: none;">
              📊 Spending by Category
            </summary>
            <div class="details-content">
              ${data.spendingBreakdownHtml}
            </div>
          </details>
        </div>
      </td>
    </tr>
    ` : ''}

    ${data.advisorAdviceHtml ? `
    <!-- Financial Advice -->
    <tr>
      <td style="padding: 0 32px 32px 32px;">
        <div style="border-top: 2px solid #f3f4f6; padding-top: 24px;">
          <details open>
            <summary style="cursor: pointer; font-size: 20px; font-weight: 700; color: #111827; padding: 12px 16px; background: #f9fafb; border-radius: 8px; list-style: none; user-select: none;">
              💡 Financial Insights
            </summary>
            <div class="details-content">
              <div style="padding: 20px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%); border-radius: 12px; border-left: 4px solid #667eea;">
                ${data.advisorAdviceHtml}
              </div>
            </div>
          </details>
        </div>
      </td>
    </tr>
    ` : ''}

    ${data.largeTransactionsHtml ? `
    <!-- Large Transactions Alert -->
    <tr>
      <td style="padding: 0 32px 32px 32px;">
        <details>
          <summary style="cursor: pointer; font-size: 16px; font-weight: 600; color: #92400e; padding: 12px 16px; background: #fff3cd; border-radius: 8px; list-style: none; user-select: none; border-left: 4px solid #f59e0b;">
            ⚠️ Large Transactions Excluded from Budget
          </summary>
          <div class="details-content">
            <div style="padding: 16px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <div style="font-size: 14px; color: #78350f; margin-bottom: 12px;">
                These transactions were excluded from your budget calculations
              </div>
              ${data.largeTransactionsHtml}
            </div>
          </div>
        </details>
      </td>
    </tr>
    ` : ''}

    <!-- Footer -->
    <tr>
      <td style="padding: 24px 32px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 13px; color: #6b7280;">
          Generated with 💜 by Budgeter
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
  `;
}
