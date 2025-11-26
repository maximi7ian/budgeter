/**
 * Sleek Budget Email Template - Matches Web UI Design
 * Email-client safe with table layouts and inline styles
 */

import { BudgetEmailTemplateData } from "./types";

export function renderBudgetEmail(data: BudgetEmailTemplateData): string {
  const overUnderColor = data.overUnderType === 'over' ? '#ef4444' : data.overUnderType === 'under' ? '#10b981' : '#6b7280';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${data.periodLabel}</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
    table { border-collapse: collapse; }
    img { border: 0; }

    @media only screen and (max-width: 600px) {
      .stat-card { display: block !important; width: 100% !important; padding: 8px 0 !important; }
      .stat-value { font-size: 32px !important; }
      h1 { font-size: 26px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: #0a0e1a;">

  <!-- Outer wrapper with dark background -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #0a0e1a; padding: 20px 0;">
    <tr>
      <td align="center">

        <!-- Main container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background: #1a1f2e; border-radius: 16px; overflow: hidden;">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #5b51e5 0%, #8b5cf6 100%); padding: 48px 32px; text-align: center;">
              <div style="font-size: 64px; line-height: 1; margin-bottom: 16px;">💰</div>
              <h1 style="margin: 0 0 12px 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">
                ${data.periodLabel}
              </h1>
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 500;">
                ${data.dateRange}
              </p>
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
                    <table width="100%" cellpadding="20" cellspacing="0" border="0" style="background: #0f1419; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px;">
                      <tr>
                        <td style="text-align: center;">
                          <div style="font-size: 11px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">TOTAL SPEND</div>
                          <div class="stat-value" style="font-size: 36px; color: #f3f4f6; font-weight: 800; letter-spacing: -1px;">${data.totalSpend}</div>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Budget card -->
                  <td class="stat-card" width="33.33%" style="padding: 0 4px; vertical-align: top;">
                    <table width="100%" cellpadding="20" cellspacing="0" border="0" style="background: #0f1419; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px;">
                      <tr>
                        <td style="text-align: center;">
                          <div style="font-size: 11px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">BUDGET</div>
                          <div class="stat-value" style="font-size: 36px; color: #f3f4f6; font-weight: 800; letter-spacing: -1px;">${data.budget}</div>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Over/Under card -->
                  <td class="stat-card" width="33.33%" style="padding: 0 0 0 8px; vertical-align: top;">
                    <table width="100%" cellpadding="20" cellspacing="0" border="0" style="background: #0f1419; border: 1px solid ${overUnderColor}40; border-radius: 12px;">
                      <tr>
                        <td style="text-align: center;">
                          <div style="font-size: 11px; color: ${overUnderColor}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                            ${data.overUnderType === 'over' ? 'OVER BUDGET' : 'UNDER BUDGET'}
                          </div>
                          <div class="stat-value" style="font-size: 36px; color: ${overUnderColor}; font-weight: 800; letter-spacing: -1px;">${data.remainingBudget.replace('-', '')}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Transaction summary bar -->
              <table width="100%" cellpadding="14" cellspacing="0" border="0" style="margin-top: 16px; background: #0f1419; border: 1px solid rgba(255,255,255,0.04); border-radius: 10px;">
                <tr>
                  <td style="text-align: center; color: #9ca3af; font-size: 14px; font-weight: 500;">
                    ${data.transactionCount} transactions
                    <span style="margin: 0 8px; color: rgba(255,255,255,0.2);">•</span>
                    ${data.avgTransaction} average
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          ${data.spendingBreakdownHtml ? `
          <!-- Spending breakdown -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table width="100%" cellpadding="24" cellspacing="0" border="0" style="background: #0f1419; border: 1px solid rgba(255,255,255,0.06); border-top: 3px solid #5b51e5; border-radius: 12px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 20px; color: #f3f4f6; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">
                      📊 Spending by Category
                    </h2>
                    <div style="color: #d1d5db; font-size: 15px; line-height: 1.6;">
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
              <table width="100%" cellpadding="24" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(91,81,229,0.15), rgba(139,92,246,0.15)); border: 1px solid rgba(139,92,246,0.3); border-top: 3px solid #8b5cf6; border-radius: 12px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px; color: #f3f4f6; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">
                      💡 AI Financial Insights
                    </h2>
                    <div style="color: #e9d5ff; font-size: 15px; line-height: 1.7; font-weight: 500;">
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
              <table width="100%" cellpadding="24" cellspacing="0" border="0" style="background: #0f1419; border: 1px solid rgba(255,255,255,0.06); border-top: 3px solid #10b981; border-radius: 12px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 20px; color: #f3f4f6; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">
                      🏪 Top Merchants
                    </h2>
                    <div style="color: #d1d5db; font-size: 15px; line-height: 1.6;">
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
              <table width="100%" cellpadding="24" cellspacing="0" border="0" style="background: #0f1419; border: 1px solid rgba(255,255,255,0.06); border-top: 3px solid #3b82f6; border-radius: 12px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 20px; color: #f3f4f6; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">
                      🛍️ Largest Purchases
                    </h2>
                    <div style="color: #d1d5db; font-size: 15px; line-height: 1.6;">
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
              <table width="100%" cellpadding="24" cellspacing="0" border="0" style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); border-top: 3px solid #f59e0b; border-radius: 12px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 12px; color: #fbbf24; font-size: 18px; font-weight: 700; letter-spacing: -0.3px;">
                      ⚠️ Large Transactions (Excluded)
                    </h2>
                    <p style="margin: 0 0 16px; color: #fcd34d; font-size: 13px; font-weight: 600;">
                      These transactions were excluded from your budget calculations:
                    </p>
                    <div style="color: #fde68a; font-size: 14px; line-height: 1.6;">
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
              <table width="100%" cellpadding="24" cellspacing="0" border="0" style="background: #0f1419; border: 1px solid rgba(255,255,255,0.06); border-top: 3px solid #6b7280; border-radius: 12px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 12px; color: #d1d5db; font-size: 18px; font-weight: 700; letter-spacing: -0.3px;">
                      📄 Excluded Expenses
                    </h2>
                    <p style="margin: 0 0 16px; color: #9ca3af; font-size: 13px; font-weight: 600;">
                      Work reimbursements and other filtered expenses:
                    </p>
                    <div style="color: #d1d5db; font-size: 14px; line-height: 1.6;">
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
            <td style="padding: 32px; background: #0f1419; border-top: 1px solid rgba(255,255,255,0.04); text-align: center;">
              <div style="font-size: 32px; margin-bottom: 12px;">💰</div>
              <p style="margin: 0 0 6px; color: #d1d5db; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">
                Budgeter
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
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
