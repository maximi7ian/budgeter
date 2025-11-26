/**
 * Mobile-Friendly Email Template with Hover Tooltips
 */

import { WeeklyEmailTemplateData } from "./types";

export function renderWeeklyBudgetEmail(data: WeeklyEmailTemplateData): string {
  const overUnderColor = data.overUnderType === 'over' ? '#ef4444' : data.overUnderType === 'under' ? '#10b981' : '#6b7280';
  const overUnderBg = data.overUnderType === 'over' ? '#fee2e2' : data.overUnderType === 'under' ? '#d1fae5' : '#f3f4f6';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${data.periodLabel}</title>
  <style>
    /* Base styles */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f9fafb;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    /* Tooltip styles for desktop */
    @media only screen and (min-width: 600px) {
      .category-bar {
        position: relative;
        cursor: help;
      }
      .category-tooltip {
        visibility: hidden;
        position: absolute;
        z-index: 1000;
        background: #1f2937;
        color: #ffffff;
        padding: 10px 12px;
        border-radius: 6px;
        font-size: 12px;
        line-height: 1.5;
        white-space: nowrap;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        bottom: 100%;
        left: 0%;
        margin-bottom: 8px;
        opacity: 0;
        transition: opacity 0.2s, visibility 0.2s;
        pointer-events: none;
      }
      .category-tooltip::after {
        content: '';
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

    /* Mobile responsive */
    @media only screen and (max-width: 599px) {
      .container {
        margin: 20px auto !important;
      }
      .stats-row td {
        display: block !important;
        width: 100% !important;
        padding: 12px !important;
        margin-bottom: 8px;
      }
      .stats-row td:nth-child(2) {
        padding: 12px !important;
      }
      .header-padding {
        padding: 24px !important;
      }
      .content-padding {
        padding: 20px !important;
      }
      .category-tooltip {
        display: none; /* Hide tooltips on mobile */
      }
      h1 {
        font-size: 24px !important;
      }
      h2 {
        font-size: 18px !important;
      }
      .stat-value {
        font-size: 24px !important;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" class="container" style="width: 100%; max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); overflow: hidden; border-collapse: collapse;">

    <!-- Header -->
    <tr>
      <td class="header-padding" style="padding: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 800; color: #ffffff; line-height: 1.2;">
          💰 ${data.periodLabel}
        </h1>
        <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.9);">${data.dateRange}</p>
      </td>
    </tr>

    <!-- Key Stats -->
    <tr>
      <td class="content-padding" style="padding: 32px;">
        <table role="presentation" class="stats-row" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 33.33%; text-align: center; padding: 16px; background: #f9fafb; border-radius: 12px; vertical-align: top;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 8px;">Spent</div>
              <div class="stat-value" style="font-size: 28px; font-weight: 800; color: #ef4444; line-height: 1;">${data.totalSpend}</div>
            </td>
            <td style="width: 33.33%; text-align: center; padding: 16px 8px; vertical-align: top;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 8px;">Budget</div>
              <div class="stat-value" style="font-size: 28px; font-weight: 800; color: #111827; line-height: 1;">${data.budget}</div>
            </td>
            <td style="width: 33.33%; text-align: center; padding: 16px; background: ${overUnderBg}; border-radius: 12px; vertical-align: top;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${overUnderColor}; margin-bottom: 8px;">${data.overUnderType === 'over' ? 'Over' : 'Under'}</div>
              <div class="stat-value" style="font-size: 28px; font-weight: 800; color: ${overUnderColor}; line-height: 1;">${data.remainingBudget.replace('-', '')}</div>
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
    <!-- Spending Breakdown -->
    <tr>
      <td class="content-padding" style="padding: 0 32px 32px 32px;">
        <div style="border-top: 2px solid #f3f4f6; padding-top: 24px;">
          <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111827;">
            📊 Spending by Category
          </h2>
          <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280;">
            💡 Hover over categories to see top vendors
          </p>
          ${data.spendingBreakdownHtml}
        </div>
      </td>
    </tr>
    ` : ''}

    ${data.advisorAdviceHtml ? `
    <!-- Financial Advice -->
    <tr>
      <td class="content-padding" style="padding: 0 32px 32px 32px;">
        <div style="border-top: 2px solid #f3f4f6; padding-top: 24px;">
          <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111827;">
            💡 Financial Insights
          </h2>
          <div style="padding: 20px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%); border-radius: 12px; border-left: 4px solid #667eea;">
            ${data.advisorAdviceHtml}
          </div>
        </div>
      </td>
    </tr>
    ` : ''}

    ${data.largeTransactionsHtml ? `
    <!-- Large Transactions -->
    <tr>
      <td class="content-padding" style="padding: 0 32px 32px 32px;">
        <div style="padding: 16px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">
            ⚠️ Large Transactions Excluded
          </div>
          <div style="font-size: 14px; color: #78350f; margin-bottom: 12px;">
            Excluded from budget calculations
          </div>
          ${data.largeTransactionsHtml}
        </div>
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
