/**
 * Enhanced UI rendering with improved weekly/monthly transaction pages
 */

import { TransactionOutput, Txn } from "./types";
import { getWeeklyAllowance, getMonthlyAllowance, getLargeTransactionThreshold } from "./config";
import { aggregateByCategory, aggregateByMerchant } from "./email/helpers";
import { generateBaseCSS, renderHeader, renderFooter, COLORS, SPACING, BORDER_RADIUS, FONTS } from "./ui/design-system";

/**
 * Render enhanced transactions page with budget insights and visual breakdowns
 * Now fully generalized to support weekly, monthly, and custom date ranges
 */
export function renderEnhancedTransactionsPage(output: TransactionOutput): string {
  // Use the budget passed from the server (calculated based on mode and date range)
  const budget = output.budget.amount;
  const budgetSource = output.budget.source;
  const days = output.budget.days;
  const dailyRate = output.budget.dailyRate;

  const largeThreshold = getLargeTransactionThreshold();
  const aiConfigured = !!process.env.OPENAI_API_KEY;

  // Separate transactions into regular and large
  const regularTransactions = output.transactions.filter(
    t => !(t.amountGBP < 0 && Math.abs(t.amountGBP) >= largeThreshold)
  );
  const largeTransactions = output.transactions.filter(
    t => t.amountGBP < 0 && Math.abs(t.amountGBP) >= largeThreshold
  );

  // Calculate spending metrics for REGULAR transactions only
  const totalSpend = Math.abs(
    regularTransactions.filter(t => t.amountGBP < 0).reduce((sum, t) => sum + t.amountGBP, 0)
  );
  const totalCredits = regularTransactions
    .filter(t => t.amountGBP > 0)
    .reduce((sum, t) => sum + t.amountGBP, 0);
  const largeTransactionsTotal = Math.abs(
    largeTransactions.reduce((sum, t) => sum + t.amountGBP, 0)
  );

  // Budget calculations
  const budgetRemaining = budget - totalSpend;
  const budgetPercentage = (totalSpend / budget) * 100;
  const isOverBudget = totalSpend > budget;

  // Get category breakdown and top merchants
  const categories = aggregateByCategory(regularTransactions);
  const merchants = aggregateByMerchant(regularTransactions, 10);

  // Group transactions by date
  const transactionsByDate = groupTransactionsByDate(regularTransactions);

  // Generate page title based on mode
  const pageTitle = output.window.mode === 'custom'
    ? `Custom Report (${output.window.from} to ${output.window.to})`
    : output.window.mode === 'weekly'
    ? 'Weekly Transactions'
    : 'Monthly Transactions';

  // Generate heading for the page
  const pageHeading = output.window.mode === 'custom'
    ? `📋 Custom Budget Report`
    : output.window.mode === 'weekly'
    ? '📅 Weekly Transactions'
    : '📊 Monthly Transactions';

  // Generate period subtitle
  // Always show inclusive/exclusive for clarity across all modes
  const periodSubtitle = output.window.mode === 'custom'
    ? `${days} days: ${output.window.from} (inclusive) to ${output.window.to} (exclusive)`
    : `${days} days: ${output.window.from} (inclusive) to ${output.window.to} (exclusive)`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${pageTitle}</title>
      <style>
        ${generateBaseCSS()}
        
        /* Custom styles for charts/bars */
        .progress-bar {
          height: 12px;
          background: ${COLORS.bg.input};
          border-radius: ${BORDER_RADIUS.full};
          overflow: hidden;
          position: relative;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: ${BORDER_RADIUS.full};
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: ${BORDER_RADIUS.lg};
          padding: ${SPACING.md};
          text-align: center;
        }

        .transaction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${SPACING.md};
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.2s;
        }

        .transaction-item:last-child {
          border-bottom: none;
        }

        .transaction-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }
      </style>
    </head>
    <body>
      <div class="app-container">
        ${renderHeader("transactions", output.window.mode)}

        <main>
          <div class="flex justify-between items-center mb-4" style="flex-wrap: wrap; gap: ${SPACING.md};">
            <div>
              <h1 style="font-size: 2rem; margin-bottom: 0;">${pageHeading}</h1>
              <p style="color: ${COLORS.text.muted};">${periodSubtitle}</p>
            </div>
            <div class="badge ${isOverBudget ? 'badge-danger' : 'badge-success'}" style="font-size: 1rem; padding: 0.5rem 1rem;">
              ${isOverBudget ? "⚠️ Over Budget" : "✓ On Track"}
            </div>
          </div>

          <!-- Budget Progress Section -->
          <div class="glass-card" style="margin-bottom: ${SPACING.xl}; ${isOverBudget ? `border-left: 4px solid ${COLORS.danger};` : `border-left: 4px solid ${COLORS.success};`}">
            <div class="flex justify-between items-center mb-4">
              <h3 style="margin: 0;">Budget Status</h3>
              <span style="color: ${COLORS.text.muted}; font-size: 0.9rem;">
                ${budgetSource === 'custom' ? 'Custom Budget' : budgetSource === 'calculated' ? 'Calculated Budget' : 'Allowance'}: £${budget.toFixed(2)}
                ${budgetSource === 'calculated' ? ` (£${dailyRate.toFixed(2)}/day × ${days} days)` : ''}
              </span>
            </div>

            <div style="margin-bottom: ${SPACING.lg};">
              <div class="progress-bar" style="height: 24px; margin-bottom: ${SPACING.xs};">
                <div class="progress-fill" style="
                  width: ${Math.min(budgetPercentage, 100)}%;
                  background: ${isOverBudget ? `linear-gradient(90deg, ${COLORS.warning}, ${COLORS.danger})` : `linear-gradient(90deg, ${COLORS.success}, ${COLORS.accent.light})`};
                  box-shadow: 0 0 20px ${isOverBudget ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'};
                "></div>
              </div>
              <div class="flex justify-between" style="font-size: 0.8rem; color: ${COLORS.text.muted}; font-weight: 600;">
                <span>£0</span>
                <span style="color: ${COLORS.text.main};">£${totalSpend.toFixed(2)} (${budgetPercentage.toFixed(0)}%)</span>
                <span>£${budget.toFixed(2)}</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: ${SPACING.md};">
              <div class="stat-card">
                <div style="font-size: 0.75rem; color: ${COLORS.text.muted}; text-transform: uppercase; margin-bottom: ${SPACING.xs};">Spent</div>
                <div style="font-size: 1.25rem; font-weight: 700; color: ${COLORS.text.main};">£${totalSpend.toFixed(2)}</div>
              </div>
              <div class="stat-card">
                <div style="font-size: 0.75rem; color: ${COLORS.text.muted}; text-transform: uppercase; margin-bottom: ${SPACING.xs};">${isOverBudget ? "Over By" : "Remaining"}</div>
                <div style="font-size: 1.25rem; font-weight: 700; color: ${isOverBudget ? COLORS.danger : COLORS.success};">
                  £${Math.abs(budgetRemaining).toFixed(2)}
                </div>
              </div>
              <div class="stat-card">
                <div style="font-size: 0.75rem; color: ${COLORS.text.muted}; text-transform: uppercase; margin-bottom: ${SPACING.xs};">Credits</div>
                <div style="font-size: 1.25rem; font-weight: 700; color: ${COLORS.success};">£${totalCredits.toFixed(2)}</div>
              </div>
              <div class="stat-card">
                <div style="font-size: 0.75rem; color: ${COLORS.text.muted}; text-transform: uppercase; margin-bottom: ${SPACING.xs};">Transactions</div>
                <div style="font-size: 1.25rem; font-weight: 700; color: ${COLORS.text.main};">${regularTransactions.length}</div>
              </div>
            </div>
          </div>

          ${largeTransactions.length > 0 ? `
          <!-- Large Transactions Alert -->
          <div class="glass-card" style="margin-bottom: ${SPACING.xl}; background: ${COLORS.warningBg}; border-color: ${COLORS.warning}; color: ${COLORS.warning}; display: flex; gap: ${SPACING.md}; align-items: center;">
            <div style="font-size: 1.5rem;">⚠️</div>
            <div>
              <strong>${largeTransactions.length} Large Transaction${largeTransactions.length !== 1 ? "s" : ""} Excluded</strong>
              <p style="margin: 0; opacity: 0.9;">£${largeTransactionsTotal.toFixed(2)} in transactions over £${largeThreshold} excluded from budget calculations</p>
            </div>
          </div>
          ` : ''}

          <!-- Main Content Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: ${SPACING.lg}; margin-bottom: ${SPACING.xl};">
            ${aiConfigured && output.window.mode !== 'custom' ? `
            <!-- AI Insights Section -->
            <section class="glass-card" id="ai-insights-section">
              <h3 style="margin-bottom: ${SPACING.md}; display: flex; align-items: center; gap: ${SPACING.sm};">
                <span>🤖</span> AI-Powered Insights
              </h3>
              
              <div id="ai-insights-placeholder" class="text-center" style="padding: ${SPACING.lg} 0;">
                <p style="color: ${COLORS.text.muted}; margin-bottom: ${SPACING.lg};">
                  Get intelligent spending analysis and personalized advice powered by AI
                </p>
                <button id="generate-insights-btn" class="btn btn-primary">
                  <span>✨</span> Generate AI Insights
                </button>
                
                <div id="ai-loading" style="display: none; margin-top: ${SPACING.md};">
                  <div style="display: inline-block; width: 30px; height: 30px; border: 3px solid rgba(255,255,255,0.1); border-top-color: ${COLORS.primary.light}; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                  <p style="margin-top: ${SPACING.sm}; font-size: 0.9rem; color: ${COLORS.text.muted};">Analyzing your spending patterns...</p>
                </div>
                
                <div id="ai-error" style="display: none; color: ${COLORS.danger}; margin-top: ${SPACING.md}; padding: ${SPACING.md}; background: ${COLORS.dangerBg}; border-radius: ${BORDER_RADIUS.md};"></div>
              </div>

              <div id="ai-insights-content" style="display: none;">
                <!-- Categories will be inserted here -->
                <div id="categories-container"></div>

                <!-- Financial Advice will be inserted here -->
                <div id="advice-container" style="margin-top: ${SPACING.lg}; padding-top: ${SPACING.lg}; border-top: 1px solid rgba(255,255,255,0.1);"></div>

                <!-- Preview Email button -->
                <div style="margin-top: ${SPACING.lg}; text-align: center;">
                  <button id="preview-email-btn" class="btn btn-secondary">
                    <span>📧</span> Preview Budget Email
                  </button>
                </div>
              </div>
            </section>
            ` : ''}

            <!-- Top Merchants -->
            <section class="glass-card">
              <h3 style="margin-bottom: ${SPACING.md}; display: flex; align-items: center; gap: ${SPACING.sm};">
                <span>🏪</span> Top Merchants
              </h3>
              ${renderTopMerchants(merchants)}
            </section>
          </div>

          ${largeTransactions.length > 0 ? `
          <!-- Large Transactions Section -->
          <section class="glass-card" style="margin-bottom: ${SPACING.xl};">
            <h3 style="margin-bottom: ${SPACING.xs};">💳 Large Transactions</h3>
            <p style="color: ${COLORS.text.muted}; margin-bottom: ${SPACING.md}; font-size: 0.9rem;">Excluded from budget calculations</p>
            ${renderLargeTransactionsList(largeTransactions)}
          </section>
          ` : ''}

          <!-- Transactions Section -->
          <section class="glass-card" style="margin-bottom: ${SPACING.xl};">
            <h3 style="margin-bottom: ${SPACING.xs};">💳 All Regular Transactions</h3>
            <p style="color: ${COLORS.text.muted}; margin-bottom: ${SPACING.md}; font-size: 0.9rem;">${regularTransactions.length} transactions included in budget</p>
            ${renderGroupedTransactions(transactionsByDate)}
          </section>

          ${output.excludedExpenses && output.excludedExpenses.length > 0 ? `
          <!-- Excluded Expenses Section -->
          <section class="glass-card">
            <h3 style="margin-bottom: ${SPACING.xs};">📄 Excluded Expenses</h3>
            <p style="color: ${COLORS.text.muted}; margin-bottom: ${SPACING.md}; font-size: 0.9rem;">Work reimbursements and other expenses filtered out</p>
            ${renderExcludedExpenses(output.excludedExpenses)}
          </section>
          ` : ''}
        </main>

        ${renderFooter()}
      </div>

      <!-- JavaScript for AI Insights -->
      <script>
        const periodWindow = '${output.window.mode}';
        let aiResponseData = null;
        
        // Keyframes for spinner
        const style = document.createElement('style');
        style.innerHTML = \`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        \`;
        document.head.appendChild(style);

        ${aiConfigured ? `
        const generateBtn = document.getElementById('generate-insights-btn');
        if (generateBtn) {
          generateBtn.addEventListener('click', async function() {
            const button = this;
            const loading = document.getElementById('ai-loading');
            const error = document.getElementById('ai-error');
            const placeholder = document.getElementById('ai-insights-placeholder');
            const content = document.getElementById('ai-insights-content');

            button.style.display = 'none';
            loading.style.display = 'block';
            error.style.display = 'none';

            try {
              const response = await fetch('/api/generate-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ window: periodWindow })
              });

              const result = await response.json();

              if (!result.success) {
                throw new Error(result.error || 'Failed to generate insights');
              }

              aiResponseData = result.data;
              placeholder.style.display = 'none';
              content.style.display = 'block';

              renderCategories(result.data.categories, result.data.totalSpend);

              document.getElementById('advice-container').innerHTML =
                '<h4 style="margin: 0 0 0.75rem 0; color: ${COLORS.text.main}; font-size: 1rem;">💡 Financial Advice</h4>' +
                '<div style="color: ${COLORS.text.muted}; font-size: 0.95rem; line-height: 1.6;">' + result.data.advice + '</div>';

            } catch (err) {
              loading.style.display = 'none';
              error.style.display = 'block';
              error.innerHTML = '<strong>Error:</strong> ' + err.message;
              button.style.display = 'inline-flex';
            }
          });
        }

        function renderCategories(categories, totalSpend) {
          if (!categories || categories.length === 0) {
            document.getElementById('categories-container').innerHTML =
              '<p style="color: ${COLORS.text.muted};">No spending categories available</p>';
            return;
          }

          let html = '<h4 style="margin: 0 0 0.5rem 0; color: ${COLORS.text.main}; font-size: 1rem;">📊 Spending by Category</h4>';
          html += '<p style="margin: 0 0 1rem 0; font-size: 0.8rem; color: ${COLORS.text.muted};">💡 Hover over categories to see top vendors</p>';
          html += '<div style="display: flex; flex-direction: column; gap: 1rem;">';

          categories.forEach((cat, index) => {
            const color = cat.percentage > 30 ? '${COLORS.danger}' : cat.percentage > 15 ? '${COLORS.warning}' : '${COLORS.primary.light}';

            html += \`
              <div style="display: flex; flex-direction: column; gap: 0.5rem; position: relative; cursor: help; padding: 0.75rem; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px;" class="category-item" data-category-index="\${index}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 600; color: ${COLORS.text.main}; font-size: 0.9rem;">
                    \${cat.emoji} \${cat.name}
                  </span>
                  <span style="font-weight: 700; color: ${COLORS.accent.light}; font-size: 0.9rem;">
                    £\${cat.amount.toFixed(2)}
                  </span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div style="flex: 1; background: rgba(15, 23, 42, 0.8); border-radius: 999px; height: 8px; overflow: hidden;">
                    <div style="
                      width: \${Math.min(cat.percentage, 100)}%;
                      height: 100%;
                      background: \${color};
                      transition: width 0.3s ease;
                    "></div>
                  </div>
                  <span style="font-size: 0.8rem; color: ${COLORS.text.muted}; min-width: 45px; text-align: right; font-weight: 600;">
                    \${cat.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            \`;
          });

          html += '</div>';
          document.getElementById('categories-container').innerHTML = html;

          // Add tooltip event listeners (same logic as before, just updated styles)
          document.querySelectorAll('.category-item').forEach(item => {
            const categoryIndex = parseInt(item.getAttribute('data-category-index'));
            const category = categories[categoryIndex];

            if (!category.topVendors || category.topVendors.length === 0) return;

            let tooltipHTML = '<div style="font-weight: 600; margin-bottom: 4px; color: ${COLORS.text.main};">Top Vendors:</div>';
            category.topVendors.forEach((vendor, i) => {
              tooltipHTML += \`<div style="color: ${COLORS.text.muted};">\${i + 1}. \${vendor.name}: <span style="color: ${COLORS.text.main};">£\${vendor.amount.toFixed(2)}</span></div>\`;
            });

            const tooltip = document.createElement('div');
            tooltip.style.cssText = 'position: absolute; bottom: 100%; left: 0; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.75rem; line-height: 1.5; white-space: nowrap; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); margin-bottom: 0.5rem; opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 1000; min-width: 150px;';
            tooltip.innerHTML = tooltipHTML;

            const arrow = document.createElement('div');
            arrow.style.cssText = 'position: absolute; top: 100%; left: 20px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid rgba(15, 23, 42, 0.95);';
            tooltip.appendChild(arrow);

            item.appendChild(tooltip);

            item.addEventListener('mouseenter', () => { tooltip.style.opacity = '1'; });
            item.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });
          });
        }

        const previewBtn = document.getElementById('preview-email-btn');
        if (previewBtn) {
          previewBtn.addEventListener('click', async function() {
            if (!aiResponseData) {
              alert('Please generate AI insights first');
              return;
            }
            const button = this;
            const originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<span class="button-icon">⏳</span> Generating...';

            try {
              const response = await fetch('/api/preview-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  window: periodWindow,
                  aiResponse: {
                    categories: aiResponseData.categories,
                    spendingBreakdown: aiResponseData.spendingBreakdown,
                    advice: aiResponseData.advice
                  }
                })
              });

              if (!response.ok) throw new Error('Failed to generate preview');
              const htmlContent = await response.text();
              const previewWindow = globalThis.open('', '_blank');
              if (previewWindow) {
                previewWindow.document.write(htmlContent);
                previewWindow.document.close();
              } else {
                alert('Please allow popups to preview the email');
              }
            } catch (err) {
              alert('Error: ' + err.message);
            } finally {
              button.disabled = false;
              button.innerHTML = originalText;
            }
          });
        }
        ` : ''}
      </script>
    </body>
    </html>
  `;
}

/**
 * Group transactions by date
 */
function groupTransactionsByDate(transactions: Txn[]): Map<string, Txn[]> {
  const grouped = new Map<string, Txn[]>();
  for (const txn of transactions) {
    const date = txn.postedDate;
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(txn);
  }
  return new Map([...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

/**
 * Render top merchants list
 */
function renderTopMerchants(merchants: any[]): string {
  if (merchants.length === 0) return '<p class="text-muted">No merchant data available</p>';

  return `
    <div style="display: flex; flex-direction: column; gap: ${SPACING.sm};">
      ${merchants.map((m, i) => `
        <div style="display: flex; align-items: center; padding: ${SPACING.sm}; background: rgba(255, 255, 255, 0.03); border-radius: ${BORDER_RADIUS.md};">
          <div style="width: 24px; height: 24px; background: ${COLORS.primary.start}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; margin-right: ${SPACING.md};">
            ${i + 1}
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: ${COLORS.text.main};">${m.name}</div>
            <div style="font-size: 0.75rem; color: ${COLORS.text.muted};">${m.transactionCount} transaction${m.transactionCount !== 1 ? 's' : ''}</div>
          </div>
          <div style="font-weight: 700; color: ${COLORS.text.main};">
            ${m.amountFormatted}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render large transactions list
 */
function renderLargeTransactionsList(transactions: Txn[]): string {
  return `
    <div style="display: flex; flex-direction: column; gap: ${SPACING.sm};">
      ${transactions.map(txn => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: ${SPACING.md}; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: ${BORDER_RADIUS.md};">
          <div>
            <div style="font-size: 0.8rem; color: ${COLORS.text.muted}; margin-bottom: 2px;">${formatDate(txn.postedDate)}</div>
            <div style="font-weight: 600; color: ${COLORS.text.main};">${txn.merchant || txn.description}</div>
            <div style="font-size: 0.75rem; color: ${COLORS.text.muted};">${txn.provider}</div>
          </div>
          <div style="font-weight: 700; color: ${COLORS.danger}; font-size: 1.1rem;">
            -£${Math.abs(txn.amountGBP).toFixed(2)}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render grouped transactions by date
 */
function renderGroupedTransactions(grouped: Map<string, Txn[]>): string {
  let html = '<div style="display: flex; flex-direction: column; gap: 1.5rem;">';

  for (const [date, txns] of grouped) {
    const dayTotal = Math.abs(
      txns.filter(t => t.amountGBP < 0).reduce((sum, t) => sum + t.amountGBP, 0)
    );

    html += `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${SPACING.sm}; padding-bottom: ${SPACING.xs}; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
          <span style="font-weight: 600; color: ${COLORS.text.muted}; font-size: 0.9rem;">${formatDate(date)}</span>
          <span style="font-weight: 600; color: ${COLORS.text.muted}; font-size: 0.9rem;">-£${dayTotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; flex-direction: column;">
          ${txns.map(txn => `
            <div class="transaction-item">
              <div style="flex: 1; min-width: 0; padding-right: ${SPACING.md};">
                <div style="font-weight: 500; color: ${COLORS.text.main}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${txn.merchant || txn.description}
                </div>
                <div style="font-size: 0.75rem; color: ${COLORS.text.muted};">
                  ${txn.provider}
                </div>
              </div>
              <div style="font-weight: 600; color: ${txn.amountGBP < 0 ? COLORS.text.main : COLORS.success}; white-space: nowrap;">
                ${txn.amountGBP < 0 ? '-' : '+'}£${Math.abs(txn.amountGBP).toFixed(2)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

/**
 * Render excluded expenses
 */
function renderExcludedExpenses(expenses: any[]): string {
  return `
    <div style="display: flex; flex-direction: column; gap: ${SPACING.sm};">
      ${expenses.map(exp => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: ${SPACING.md}; background: rgba(255, 255, 255, 0.03); border-radius: ${BORDER_RADIUS.md};">
          <div>
            <div style="font-size: 0.8rem; color: ${COLORS.text.muted}; margin-bottom: 2px;">${exp.dateISO}</div>
            <div style="font-weight: 600; color: ${COLORS.text.main};">${exp.vendor}</div>
            ${exp.note ? `<div style="font-size: 0.75rem; color: ${COLORS.text.muted}; margin-top: 2px;">${exp.note}</div>` : ''}
          </div>
          <div style="font-weight: 600; color: ${COLORS.text.muted};">
            £${exp.amountGBP.toFixed(2)}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Format date to readable format
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) {
    return 'Today';
  } else if (dateStr === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }
}
