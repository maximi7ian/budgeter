/**
 * Enhanced UI rendering with improved weekly/monthly transaction pages
 */

import { TransactionOutput, Txn } from "./types";
import { getWeeklyAllowance, getMonthlyAllowance, getLargeTransactionThreshold } from "./config";
import { aggregateByCategory, aggregateByMerchant } from "./email/helpers";

/**
 * Render enhanced transactions page with budget insights and visual breakdowns
 */
export function renderEnhancedTransactionsPage(output: TransactionOutput): string {
  const isWeekly = output.window.mode === "weekly";
  const budget = isWeekly ? getWeeklyAllowance() : getMonthlyAllowance();
  const largeThreshold = getLargeTransactionThreshold();

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

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isWeekly ? "Weekly" : "Monthly"} Transactions</title>
      <style>
        ${generateEnhancedCSS()}
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <header class="header">
          <div class="header-content">
            <h1>${isWeekly ? "📅 Weekly" : "📊 Monthly"} Budget Overview</h1>
            <p class="period-label">${output.window.from} → ${output.window.to}</p>
          </div>
          <nav class="nav">
            <a href="/" class="nav-link">🏠 Home</a>
            <a href="/transactions?window=weekly" class="nav-link ${isWeekly ? "active" : ""}">📅 Weekly</a>
            <a href="/transactions?window=monthly" class="nav-link ${!isWeekly ? "active" : ""}">📊 Monthly</a>
            <a href="/settings" class="nav-link">⚙️ Settings</a>
          </nav>
        </header>

        <!-- Budget Progress Section -->
        <section class="budget-section">
          <div class="budget-card ${isOverBudget ? "over-budget" : "under-budget"}">
            <div class="budget-header">
              <div>
                <h2 class="budget-title">Budget Status</h2>
                <p class="budget-subtitle">${isWeekly ? "Weekly" : "Monthly"} Allowance: £${budget.toFixed(2)}</p>
              </div>
              <div class="budget-status-badge ${isOverBudget ? "badge-danger" : "badge-success"}">
                ${isOverBudget ? "⚠️ Over Budget" : "✓ On Track"}
              </div>
            </div>

            <div class="budget-progress-container">
              <div class="budget-progress-bar">
                <div class="budget-progress-fill ${isOverBudget ? "over" : "under"}"
                     style="width: ${Math.min(budgetPercentage, 100)}%">
                </div>
              </div>
              <div class="budget-labels">
                <span>£0</span>
                <span class="budget-current">£${totalSpend.toFixed(2)} (${budgetPercentage.toFixed(0)}%)</span>
                <span>£${budget.toFixed(2)}</span>
              </div>
            </div>

            <div class="budget-stats-grid">
              <div class="stat">
                <div class="stat-label">Spent</div>
                <div class="stat-value spend">£${totalSpend.toFixed(2)}</div>
              </div>
              <div class="stat">
                <div class="stat-label">${isOverBudget ? "Over By" : "Remaining"}</div>
                <div class="stat-value ${isOverBudget ? "over" : "remaining"}">
                  £${Math.abs(budgetRemaining).toFixed(2)}
                </div>
              </div>
              <div class="stat">
                <div class="stat-label">Credits</div>
                <div class="stat-value credit">£${totalCredits.toFixed(2)}</div>
              </div>
              <div class="stat">
                <div class="stat-label">Transactions</div>
                <div class="stat-value">${regularTransactions.length}</div>
              </div>
            </div>
          </div>
        </section>

        ${largeTransactions.length > 0 ? `
        <!-- Large Transactions Alert -->
        <section class="large-transactions-alert">
          <div class="alert-warning">
            <div class="alert-icon">⚠️</div>
            <div class="alert-content">
              <strong>${largeTransactions.length} Large Transaction${largeTransactions.length !== 1 ? "s" : ""} Excluded</strong>
              <p>£${largeTransactionsTotal.toFixed(2)} in transactions over £${largeThreshold} excluded from budget calculations</p>
            </div>
          </div>
        </section>
        ` : ''}

        <!-- Main Content Grid -->
        <div class="content-grid">
          <!-- AI Insights Section -->
          <section class="card" id="ai-insights-section">
            <h3 class="card-title">🤖 AI-Powered Insights</h3>
            <div id="ai-insights-placeholder">
              <p class="card-subtitle">Get intelligent spending analysis and personalized advice powered by AI</p>
              <button id="generate-insights-btn" class="primary-button">
                <span class="button-icon">✨</span>
                <span class="button-text">Generate AI Insights</span>
              </button>
              <div id="ai-loading" class="loading-state" style="display: none;">
                <div class="spinner"></div>
                <p>Analyzing your spending patterns...</p>
              </div>
              <div id="ai-error" class="error-message" style="display: none;"></div>
            </div>

            <div id="ai-insights-content" style="display: none;">
              <!-- Categories will be inserted here -->
              <div id="categories-container"></div>

              <!-- Financial Advice will be inserted here -->
              <div id="advice-container"></div>

              <!-- Preview Email button -->
              <div style="margin-top: 24px; text-align: center;">
                <button id="preview-email-btn" class="secondary-button">
                  <span class="button-icon">📧</span>
                  <span class="button-text">Preview Budget Email</span>
                </button>
              </div>
            </div>
          </section>

          <!-- Top Merchants -->
          <section class="card">
            <h3 class="card-title">🏪 Top Merchants</h3>
            ${renderTopMerchants(merchants)}
          </section>
        </div>

        ${largeTransactions.length > 0 ? `
        <!-- Large Transactions Section -->
        <section class="card">
          <h3 class="card-title">💳 Large Transactions (Excluded from Budget)</h3>
          <p class="card-subtitle">These transactions were excluded from your budget calculations</p>
          ${renderLargeTransactionsList(largeTransactions)}
        </section>
        ` : ''}

        <!-- Transactions Section -->
        <section class="card">
          <h3 class="card-title">💳 All Regular Transactions</h3>
          <p class="card-subtitle">${regularTransactions.length} transactions included in budget</p>
          ${renderGroupedTransactions(transactionsByDate)}
        </section>

        ${output.excludedExpenses && output.excludedExpenses.length > 0 ? `
        <!-- Excluded Expenses Section -->
        <section class="card">
          <h3 class="card-title">📄 Excluded Expenses</h3>
          <p class="card-subtitle">Work reimbursements and other expenses filtered out</p>
          ${renderExcludedExpenses(output.excludedExpenses)}
        </section>
        ` : ''}
      </div>

      <!-- JavaScript for AI Insights -->
      <script>
        const periodWindow = '${output.window.mode}';  // 'weekly' or 'monthly'
        let aiResponseData = null;  // Store AI response for email preview

        // Generate AI Insights
        document.getElementById('generate-insights-btn').addEventListener('click', async function() {
          const button = this;
          const loading = document.getElementById('ai-loading');
          const error = document.getElementById('ai-error');
          const placeholder = document.getElementById('ai-insights-placeholder');
          const content = document.getElementById('ai-insights-content');

          // Show loading state
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

            // Store response data for email preview
            aiResponseData = result.data;

            // Hide placeholder, show content
            placeholder.style.display = 'none';
            content.style.display = 'block';

            // Render categories
            renderCategories(result.data.categories, result.data.totalSpend);

            // Render advice
            document.getElementById('advice-container').innerHTML =
              '<h4 style="margin: 24px 0 12px 0; color: #1f2937;">💡 Financial Advice</h4>' +
              result.data.advice;

          } catch (err) {
            loading.style.display = 'none';
            error.style.display = 'block';
            error.textContent = err.message;
            button.style.display = 'inline-flex';

            // Check if it's a missing config error
            if (err.message.includes('OpenAI API key')) {
              error.innerHTML = '<strong>⚠️ OpenAI Not Configured</strong><br>' +
                'Add your OpenAI API key to .env file to use AI insights.<br>' +
                '<a href="https://platform.openai.com/api-keys" target="_blank" style="color: #3b82f6;">Get API Key →</a>';
            }
          }
        });

        // Render categories with progress bars and tooltips
        function renderCategories(categories, totalSpend) {
          if (!categories || categories.length === 0) {
            document.getElementById('categories-container').innerHTML =
              '<p style="color: #6b7280;">No spending categories available</p>';
            return;
          }

          let html = '<h4 style="margin: 0 0 8px 0; color: #1f2937;">📊 Spending by Category</h4>';
          html += '<p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280;">💡 Hover over categories to see top vendors</p>';
          html += '<div style="display: flex; flex-direction: column; gap: 16px;">';

          categories.forEach((cat, index) => {
            const color = cat.percentage > 30 ? '#ef4444' : cat.percentage > 15 ? '#f59e0b' : '#3b82f6';

            html += \`
              <div style="display: flex; flex-direction: column; gap: 6px; position: relative; cursor: help;" class="category-item" data-category-index="\${index}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 500; color: #1f2937;">
                    \${cat.emoji} \${cat.name}
                  </span>
                  <span style="font-weight: 600; color: #1f2937;">
                    £\${cat.amount.toFixed(2)}
                  </span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="flex: 1; background: #e5e7eb; border-radius: 999px; height: 8px; overflow: hidden;">
                    <div style="
                      width: \${Math.min(cat.percentage, 100)}%;
                      height: 100%;
                      background: \${color};
                      transition: width 0.3s ease;
                    "></div>
                  </div>
                  <span style="font-size: 14px; color: #6b7280; min-width: 45px; text-align: right;">
                    \${cat.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            \`;
          });

          html += '</div>';
          document.getElementById('categories-container').innerHTML = html;

          // Add tooltip event listeners
          document.querySelectorAll('.category-item').forEach(item => {
            const categoryIndex = parseInt(item.getAttribute('data-category-index'));
            const category = categories[categoryIndex];

            if (!category.topVendors || category.topVendors.length === 0) return;

            // Build tooltip content
            let tooltipHTML = '<div style="font-weight: 600; margin-bottom: 4px;">Top Vendors:</div>';
            category.topVendors.forEach((vendor, i) => {
              tooltipHTML += \`<div>\${i + 1}. \${vendor.name}: £\${vendor.amount.toFixed(2)}</div>\`;
            });

            const tooltip = document.createElement('div');
            tooltip.style.cssText = 'position: absolute; bottom: 100%; left: 0; background: #1f2937; color: white; padding: 10px 12px; border-radius: 6px; font-size: 12px; line-height: 1.5; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.3); margin-bottom: 8px; opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 1000;';
            tooltip.innerHTML = tooltipHTML;

            // Arrow
            const arrow = document.createElement('div');
            arrow.style.cssText = 'position: absolute; top: 100%; left: 20px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #1f2937;';
            tooltip.appendChild(arrow);

            item.appendChild(tooltip);

            item.addEventListener('mouseenter', () => {
              tooltip.style.opacity = '1';
            });

            item.addEventListener('mouseleave', () => {
              tooltip.style.opacity = '0';
            });
          });
        }

        // Preview Email
        document.getElementById('preview-email-btn').addEventListener('click', async function() {
          if (!aiResponseData) {
            alert('Please generate AI insights first');
            return;
          }

          const button = this;
          const originalText = button.innerHTML;
          button.disabled = true;
          button.innerHTML = '<span class="button-icon">⏳</span><span class="button-text">Generating...</span>';

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

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Failed to generate preview');
            }

            const htmlContent = await response.text();

            // Open in new window
            const previewWindow = globalThis.open('', '_blank');
            if (previewWindow) {
              previewWindow.document.write(htmlContent);
              previewWindow.document.close();
            } else {
              alert('Please allow popups to preview the email');
            }

          } catch (err) {
            alert('Error generating preview: ' + err.message);
          } finally {
            button.disabled = false;
            button.innerHTML = originalText;
          }
        });
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
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(txn);
  }

  // Sort dates descending
  return new Map([...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

/**
 * Render category breakdown with visual bars
 */
function renderCategoryBreakdown(categories: any[], totalSpend: number): string {
  if (categories.length === 0) {
    return '<p class="empty-text">No spending data available</p>';
  }

  return `
    <div class="category-list">
      ${categories.slice(0, 6).map(cat => {
        const barColor = cat.percentageOfTotal > 30 ? '#ef4444' :
                        cat.percentageOfTotal > 15 ? '#f59e0b' : '#6366f1';
        return `
          <div class="category-item">
            <div class="category-header">
              <span class="category-name">${cat.name}</span>
              <span class="category-amount">${cat.amountFormatted}</span>
            </div>
            <div class="category-bar-bg">
              <div class="category-bar" style="width: ${cat.percentageOfTotal}%; background: ${barColor}"></div>
            </div>
            <div class="category-percentage">${cat.percentageOfTotal.toFixed(1)}% of spending</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Render top merchants list
 */
function renderTopMerchants(merchants: any[]): string {
  if (merchants.length === 0) {
    return '<p class="empty-text">No merchant data available</p>';
  }

  return `
    <div class="merchant-list">
      ${merchants.map((m, i) => `
        <div class="merchant-item">
          <div class="merchant-rank">${i + 1}</div>
          <div class="merchant-details">
            <div class="merchant-name">${m.name}</div>
            <div class="merchant-count">${m.transactionCount} transaction${m.transactionCount !== 1 ? 's' : ''}</div>
          </div>
          <div class="merchant-amount">${m.amountFormatted}</div>
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
    <div class="transactions-list">
      ${transactions.map(txn => `
        <div class="transaction-item large">
          <div class="transaction-date">${formatDate(txn.postedDate)}</div>
          <div class="transaction-details">
            <div class="transaction-merchant">${txn.merchant || txn.description}</div>
            <div class="transaction-provider">${txn.provider}</div>
          </div>
          <div class="transaction-amount large">-£${Math.abs(txn.amountGBP).toFixed(2)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render grouped transactions by date
 */
function renderGroupedTransactions(grouped: Map<string, Txn[]>): string {
  let html = '<div class="transactions-grouped">';

  for (const [date, txns] of grouped) {
    const dayTotal = Math.abs(
      txns.filter(t => t.amountGBP < 0).reduce((sum, t) => sum + t.amountGBP, 0)
    );

    html += `
      <div class="transaction-date-group">
        <div class="date-header">
          <span class="date-label">${formatDate(date)}</span>
          <span class="date-total">-£${dayTotal.toFixed(2)}</span>
        </div>
        <div class="transactions-list">
          ${txns.map(txn => `
            <div class="transaction-item">
              <div class="transaction-details">
                <div class="transaction-merchant">${txn.merchant || txn.description}</div>
                <div class="transaction-provider">${txn.provider}</div>
              </div>
              <div class="transaction-amount ${txn.amountGBP < 0 ? 'negative' : 'positive'}">
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
    <div class="excluded-list">
      ${expenses.map(exp => `
        <div class="excluded-item">
          <div class="excluded-date">${exp.dateISO}</div>
          <div class="excluded-details">
            <div class="excluded-vendor">${exp.vendor}</div>
            ${exp.note ? `<div class="excluded-note">${exp.note}</div>` : ''}
          </div>
          <div class="excluded-amount">£${exp.amountGBP.toFixed(2)}</div>
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

/**
 * Generate enhanced CSS
 */
function generateEnhancedCSS(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f9fafb;
      color: #111827;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    /* Header */
    .header {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .header-content h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .period-label {
      color: #6b7280;
      font-size: 14px;
    }

    .nav {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .nav-link {
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      color: #374151;
      background: #f3f4f6;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .nav-link:hover {
      background: #e5e7eb;
    }

    .nav-link.active {
      background: #667eea;
      color: white;
    }

    /* Budget Section */
    .budget-section {
      margin-bottom: 24px;
    }

    .budget-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .budget-card.over-budget {
      border-left: 4px solid #ef4444;
    }

    .budget-card.under-budget {
      border-left: 4px solid #10b981;
    }

    .budget-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .budget-title {
      font-size: 20px;
      font-weight: 700;
    }

    .budget-subtitle {
      color: #6b7280;
      font-size: 14px;
    }

    .budget-status-badge {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
    }

    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-danger {
      background: #fee2e2;
      color: #991b1b;
    }

    /* Budget Progress */
    .budget-progress-container {
      margin-bottom: 20px;
    }

    .budget-progress-bar {
      height: 16px;
      background: #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .budget-progress-fill {
      height: 100%;
      transition: width 0.5s ease;
      border-radius: 8px;
    }

    .budget-progress-fill.under {
      background: linear-gradient(90deg, #10b981, #059669);
    }

    .budget-progress-fill.over {
      background: linear-gradient(90deg, #f59e0b, #ef4444);
    }

    .budget-labels {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #6b7280;
    }

    .budget-current {
      font-weight: 600;
      color: #111827;
    }

    /* Budget Stats Grid */
    .budget-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .stat {
      text-align: center;
    }

    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
    }

    .stat-value.spend { color: #ef4444; }
    .stat-value.remaining { color: #10b981; }
    .stat-value.over { color: #dc2626; }
    .stat-value.credit { color: #3b82f6; }

    /* Alert */
    .large-transactions-alert {
      margin-bottom: 24px;
    }

    .alert-warning {
      background: #fff3cd;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      gap: 12px;
    }

    .alert-icon {
      font-size: 24px;
    }

    .alert-content strong {
      display: block;
      margin-bottom: 4px;
      color: #92400e;
    }

    .alert-content p {
      color: #78350f;
      font-size: 14px;
      margin: 0;
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    /* Card */
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 24px;
    }

    .card-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .card-subtitle {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .empty-text {
      color: #9ca3af;
      font-size: 14px;
      text-align: center;
      padding: 20px;
    }

    /* Category List */
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .category-item {
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .category-name {
      font-weight: 600;
      font-size: 14px;
    }

    .category-amount {
      font-weight: 700;
      font-size: 14px;
    }

    .category-bar-bg {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .category-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .category-percentage {
      font-size: 12px;
      color: #6b7280;
    }

    /* Merchant List */
    .merchant-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .merchant-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .merchant-rank {
      width: 28px;
      height: 28px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      flex-shrink: 0;
    }

    .merchant-details {
      flex: 1;
    }

    .merchant-name {
      font-weight: 600;
      font-size: 14px;
    }

    .merchant-count {
      font-size: 12px;
      color: #6b7280;
    }

    .merchant-amount {
      font-weight: 700;
      font-size: 15px;
    }

    /* Transactions */
    .transactions-grouped {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .transaction-date-group {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .date-header {
      background: #f9fafb;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e5e7eb;
    }

    .date-label {
      font-weight: 600;
      font-size: 14px;
    }

    .date-total {
      font-weight: 700;
      color: #ef4444;
    }

    .transactions-list {
      display: flex;
      flex-direction: column;
    }

    .transaction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
    }

    .transaction-item:last-child {
      border-bottom: none;
    }

    .transaction-item.large {
      background: #fff3cd;
      border-left: 3px solid #f59e0b;
    }

    .transaction-date {
      font-size: 12px;
      color: #6b7280;
      min-width: 80px;
    }

    .transaction-details {
      flex: 1;
    }

    .transaction-merchant {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 2px;
    }

    .transaction-provider {
      font-size: 12px;
      color: #6b7280;
    }

    .transaction-amount {
      font-weight: 700;
      font-size: 16px;
    }

    .transaction-amount.negative {
      color: #ef4444;
    }

    .transaction-amount.positive {
      color: #10b981;
    }

    .transaction-amount.large {
      color: #dc2626;
      font-size: 18px;
    }

    /* Excluded Expenses */
    .excluded-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .excluded-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 6px;
      align-items: center;
    }

    .excluded-date {
      font-size: 12px;
      color: #6b7280;
      min-width: 80px;
    }

    .excluded-details {
      flex: 1;
    }

    .excluded-vendor {
      font-weight: 600;
      font-size: 14px;
    }

    .excluded-note {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }

    .excluded-amount {
      font-weight: 700;
      color: #6366f1;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 12px;
      }

      .budget-stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .transaction-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .transaction-amount {
        align-self: flex-end;
      }
    }

    /* Buttons */
    .primary-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 14px 28px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
    }

    .primary-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(102, 126, 234, 0.35);
    }

    .primary-button:active {
      transform: translateY(0);
    }

    .primary-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .secondary-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .secondary-button:hover {
      background: #f3f4f6;
      transform: translateY(-1px);
    }

    .secondary-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .button-icon {
      font-size: 18px;
    }

    .button-text {
      font-size: inherit;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 24px;
      color: #6b7280;
    }

    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Error Message */
    .error-message {
      background: #fee2e2;
      border: 1px solid #ef4444;
      border-radius: 8px;
      padding: 16px;
      color: #991b1b;
      margin-top: 16px;
      line-height: 1.6;
    }

    .error-message strong {
      display: block;
      margin-bottom: 8px;
      font-size: 16px;
    }

    .error-message a {
      color: #3b82f6;
      text-decoration: underline;
    }

    .error-message a:hover {
      color: #2563eb;
    }
  `;
}
