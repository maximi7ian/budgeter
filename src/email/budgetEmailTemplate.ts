/**
 * Sleek Budget Email Template - Matches Web UI Design
 * Email-client safe with table layouts and inline styles
 */

import { BudgetEmailTemplateData } from "./types";

export function renderBudgetEmail(data: BudgetEmailTemplateData): string {
  // Color mapping for budget categories
  const overUnderColor =
    data.overUnderType === 'over' ? '#ef4444' :      // Red (significantly over)
      data.overUnderType === 'just-over' ? '#f59e0b' : // Orange (slightly over, within 15%)
        data.overUnderType === 'under' ? '#10b981' :     // Green (significantly under)
          data.overUnderType === 'just-under' ? '#3b82f6' : // Blue (slightly under, within 15%)
            '#6b7280';                                         // Gray (on-target)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <title>${data.periodLabel}</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
    table { border-collapse: collapse; }
    img { border: 0; }

    /* Light theme (default) */
    :root {
      color-scheme: light dark;
    }

    .bg-outer { background: #f5f7fa; }
    .bg-main { background: #ffffff; }
    .bg-card { background: #f8fafc; border: 1px solid #e2e8f0; }
    .bg-section { background: #f8fafc; border: 1px solid #e2e8f0; }
    .bg-summary { background: #f8fafc; border: 1px solid #e5e7eb; }

    .text-primary { color: #1f2937; }
    .text-secondary { color: #6b7280; }
    .text-light { color: #9ca3af; }
    .border-subtle { border-color: #e5e7eb; }

    /* Dark theme */
    @media (prefers-color-scheme: dark) {
      .bg-outer { background: #1a1d29 !important; }
      .bg-main { background: #242936 !important; }
      .bg-card { background: #2d3346 !important; border: 1px solid rgba(255,255,255,0.08) !important; }
      .bg-section { background: #2d3346 !important; border: 1px solid rgba(255,255,255,0.08) !important; }
      .bg-summary { background: #2d3346 !important; border: 1px solid rgba(255,255,255,0.06) !important; }

      .text-primary { color: #f3f4f6 !important; }
      .text-secondary { color: #9ca3af !important; }
      .text-light { color: #6b7280 !important; }
      .border-subtle { border-color: rgba(255,255,255,0.08) !important; }
    }

    @media only screen and (max-width: 600px) {
      .stat-card { display: block !important; width: 100% !important; padding: 8px 0 !important; }
      .stat-value { font-size: 32px !important; }
      h1 { font-size: 26px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-outer" style="padding: 20px 0;">
    <tr>
      <td align="center">

        <!-- Main container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" class="bg-main" style="max-width: 600px; width: 100%; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%); padding: 56px 32px 48px; text-align: center; position: relative;">
              <!-- Decorative elements -->
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6, #ec4899); opacity: 0.8;"></div>
              
              <div style="font-size: 72px; line-height: 1; margin-bottom: 20px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">💰</div>
              <h1 style="margin: 0 0 16px 0; color: #ffffff; font-size: 36px; font-weight: 900; letter-spacing: -0.5px; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                ${data.periodLabel}
              </h1>
              <p style="margin: 0; color: rgba(255,255,255,0.95); font-size: 17px; font-weight: 600; letter-spacing: 0.3px;">
                ${data.dateRange}
              </p>
              
              <!-- Decorative bottom accent -->
              <div style="margin-top: 24px; height: 2px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);"></div>
            </td>
          </tr>

          <!-- Stats cards -->
          <tr>
            <td style="padding: 32px 24px;">

              <!-- Three stat cards in a row -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Spent card -->
                  <td class="stat-card" width="33.33%" style="padding: 0 8px 0 0; vertical-align: top;">
                    <table width="100%" cellpadding="24" cellspacing="0" border="0" class="bg-card" style="border-radius: 14px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));">
                      <tr>
                        <td style="text-align: center;">
                          <div style="font-size: 28px; margin-bottom: 12px; opacity: 0.9;">💸</div>
                          <div class="text-secondary" style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">TOTAL SPEND</div>
                          <div class="stat-value text-primary" style="font-size: 38px; font-weight: 900; letter-spacing: -1.5px;">${data.totalSpend}</div>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Budget card -->
                  <td class="stat-card" width="33.33%" style="padding: 0 4px; vertical-align: top;">
                    <table width="100%" cellpadding="24" cellspacing="0" border="0" class="bg-card" style="border-radius: 14px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.08));">
                      <tr>
                        <td style="text-align: center;">
                          <div style="font-size: 28px; margin-bottom: 12px; opacity: 0.9;">🎯</div>
                          <div class="text-secondary" style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">BUDGET</div>
                          <div class="stat-value text-primary" style="font-size: 38px; font-weight: 900; letter-spacing: -1.5px;">${data.budget}</div>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Over/Under card -->
                  <td class="stat-card" width="33.33%" style="padding: 0 0 0 8px; vertical-align: top;">
                    <table width="100%" cellpadding="24" cellspacing="0" border="0" class="bg-card" style="border: 2px solid ${overUnderColor}; border-radius: 14px; background: ${overUnderColor}15; box-shadow: 0 4px 12px ${overUnderColor}30;">
                      <tr>
                        <td style="text-align: center;">
                          <div style="font-size: 28px; margin-bottom: 12px;">${data.overUnderType === 'over' ? '⚠️' :
      data.overUnderType === 'just-over' ? '🔸' :
        data.overUnderType === 'under' ? '✅' :
          data.overUnderType === 'just-under' ? '🔷' :
            '✅'
    }</div>
                          <div style="font-size: 11px; color: ${overUnderColor}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                            ${data.overUnderType === 'over' ? 'OVER BUDGET' :
      data.overUnderType === 'just-over' ? 'SLIGHTLY OVER' :
        data.overUnderType === 'under' ? 'UNDER BUDGET' :
          data.overUnderType === 'just-under' ? 'SLIGHTLY UNDER' :
            'ON TARGET'
    }
                          </div>
                          <div class="stat-value" style="font-size: 38px; color: ${overUnderColor}; font-weight: 900; letter-spacing: -1.5px;">${data.remainingBudget.replace('-', '')}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Transaction summary bar -->
              <table width="100%" cellpadding="16" cellspacing="0" border="0" class="bg-summary" style="margin-top: 20px; border-radius: 12px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(16, 185, 129, 0.05));">
                <tr>
                  <td class="text-secondary" style="text-align: center; font-size: 15px; font-weight: 600;">
                    <span style="color: #6366f1;">📊</span> ${data.transactionCount} transactions
                    <span class="text-light" style="margin: 0 10px; opacity: 0.5;">•</span>
                    <span style="color: #10b981;">💵</span> ${data.avgTransaction} average
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          ${data.spendingBreakdownHtml ? `
          <!-- Spending breakdown -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table width="100%" cellpadding="28" cellspacing="0" border="0" class="bg-section" style="border-top: 4px solid #6366f1; border-radius: 14px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);">
                <tr>
                  <td>
                    <h2 class="text-primary" style="margin: 0 0 24px; font-size: 22px; font-weight: 800; letter-spacing: -0.4px; display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 28px;">📊</span> Spending by Category
                    </h2>
                    <div class="text-primary" style="font-size: 15px; line-height: 1.7;">
                      ${data.spendingBreakdownHtml}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${data.advisorAdviceHtml ? `
          <!-- AI Insights -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table width="100%" cellpadding="28" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.12)); border: 2px solid rgba(139,92,246,0.3); border-top: 4px solid #8b5cf6; border-radius: 14px; box-shadow: 0 4px 16px rgba(139, 92, 246, 0.2);">
                <tr>
                  <td>
                    <h2 class="text-primary" style="margin: 0 0 20px; font-size: 22px; font-weight: 800; letter-spacing: -0.4px; display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 28px;">💡</span> AI Financial Insights
                    </h2>
                    <div style="color: #7c3aed; font-size: 15px; line-height: 1.8; font-weight: 500;">
                      ${data.advisorAdviceHtml}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${data.topMerchantsHtml ? `
          <!-- Top Merchants -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table width="100%" cellpadding="28" cellspacing="0" border="0" class="bg-section" style="border-top: 4px solid #10b981; border-radius: 14px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);">
                <tr>
                  <td>
                    <h2 class="text-primary" style="margin: 0 0 24px; font-size: 22px; font-weight: 800; letter-spacing: -0.4px; display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 28px;">🏪</span> Top Merchants
                    </h2>
                    <div class="text-primary" style="font-size: 15px; line-height: 1.7;">
                      ${data.topMerchantsHtml}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${data.biggestPurchasesHtml ? `
          <!-- Largest Purchases -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table width="100%" cellpadding="28" cellspacing="0" border="0" class="bg-section" style="border-top: 4px solid #3b82f6; border-radius: 14px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);">
                <tr>
                  <td>
                    <h2 class="text-primary" style="margin: 0 0 24px; font-size: 22px; font-weight: 800; letter-spacing: -0.4px; display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 28px;">🛍️</span> Largest Purchases
                    </h2>
                    <div class="text-primary" style="font-size: 15px; line-height: 1.7;">
                      ${data.biggestPurchasesHtml}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${data.largeTransactionsHtml ? `
          <!-- Large Transactions Excluded -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table width="100%" cellpadding="28" cellspacing="0" border="0" style="background: rgba(245,158,11,0.08); border: 2px solid rgba(245,158,11,0.25); border-top: 4px solid #f59e0b; border-radius: 14px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px; color: #d97706; font-size: 20px; font-weight: 800; letter-spacing: -0.4px; display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 26px;">⚠️</span> Large Transactions (Excluded)
                    </h2>
                    <p style="margin: 0 0 20px; color: #b45309; font-size: 14px; font-weight: 600; line-height: 1.5;">
                      These transactions were excluded from your budget calculations:
                    </p>
                    <div style="color: #92400e; font-size: 14px; line-height: 1.7;">
                      ${data.largeTransactionsHtml}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${data.excludedExpensesHtml ? `
          <!-- Excluded Expenses -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table width="100%" cellpadding="24" cellspacing="0" border="0" class="bg-section" style="border-top: 3px solid #6b7280; border-radius: 12px;">
                <tr>
                  <td>
                    <h2 class="text-primary" style="margin: 0 0 12px; font-size: 18px; font-weight: 700; letter-spacing: -0.3px;">
                      📄 Excluded Expenses
                    </h2>
                    <p class="text-secondary" style="margin: 0 0 16px; font-size: 13px; font-weight: 600;">
                      Purchases to exclue and other filtered expenses:
                    </p>
                    <div class="text-primary" style="font-size: 14px; line-height: 1.6;">
                      ${data.excludedExpensesHtml}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td class="bg-card border-subtle" style="padding: 32px; border-top-width: 1px; border-top-style: solid; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 12px;">💰</div>
              <p class="text-primary" style="margin: 0 0 6px; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">
                Budgeter
              </p>
              <p class="text-secondary" style="margin: 0; font-size: 12px;">
                Smart Finance Tracking • Powered by TrueLayer
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}
