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
          ${aiConfigured ? `
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
              <div style="margin-top: 1.5rem; text-align: center;">
                <button id="preview-email-btn" class="secondary-button">
                  <span class="button-icon">📧</span>
                  <span class="button-text">Preview Budget Email</span>
                </button>
              </div>
            </div>
          </section>
          ` : ''}

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
        ${aiConfigured ? `
        // Generate AI Insights
        const generateBtn = document.getElementById('generate-insights-btn');
        if (generateBtn) {
          generateBtn.addEventListener('click', async function() {
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
                '<h4 style="margin: 1.5rem 0 0.75rem 0; color: #e2e8f0; font-size: 1rem;">💡 Financial Advice</h4>' +
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
        }

        // Render categories with progress bars and tooltips
        function renderCategories(categories, totalSpend) {
          if (!categories || categories.length === 0) {
            document.getElementById('categories-container').innerHTML =
              '<p style="color: #94a3b8;">No spending categories available</p>';
            return;
          }

          let html = '<h4 style="margin: 0 0 0.5rem 0; color: #e2e8f0; font-size: 1rem;">📊 Spending by Category</h4>';
          html += '<p style="margin: 0 0 1rem 0; font-size: 0.8rem; color: #94a3b8;">💡 Hover over categories to see top vendors</p>';
          html += '<div style="display: flex; flex-direction: column; gap: 1rem;">';

          categories.forEach((cat, index) => {
            const color = cat.percentage > 30 ? '#ef4444' : cat.percentage > 15 ? '#f59e0b' : '#3b82f6';

            html += \`
              <div style="display: flex; flex-direction: column; gap: 0.375rem; position: relative; cursor: help; padding: 0.75rem; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(148, 163, 184, 0.08); border-radius: 8px;" class="category-item" data-category-index="\${index}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 600; color: #e2e8f0; font-size: 0.85rem;">
                    \${cat.emoji} \${cat.name}
                  </span>
                  <span style="font-weight: 700; color: #0ea5e9; font-size: 0.85rem;">
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
                  <span style="font-size: 0.8rem; color: #94a3b8; min-width: 45px; text-align: right; font-weight: 600;">
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
            tooltip.style.cssText = 'position: absolute; bottom: 100%; left: 0; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); color: #e2e8f0; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(148, 163, 184, 0.2); font-size: 0.75rem; line-height: 1.5; white-space: nowrap; box-shadow: 0 8px 16px rgba(0,0,0,0.4); margin-bottom: 0.5rem; opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 1000;';
            tooltip.innerHTML = tooltipHTML;

            // Arrow
            const arrow = document.createElement('div');
            arrow.style.cssText = 'position: absolute; top: 100%; left: 20px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid rgba(15, 23, 42, 0.95);';
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
      background: #0a0e27;
      background-image:
        radial-gradient(at 20% 30%, rgba(14, 165, 233, 0.08) 0px, transparent 50%),
        radial-gradient(at 80% 70%, rgba(59, 130, 246, 0.06) 0px, transparent 50%);
      color: #e2e8f0;
      line-height: 1.6;
      min-height: 100vh;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
    }

    /* Header */
    .header {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 16px rgba(14, 165, 233, 0.08);
    }

    .header-content h1 {
      font-size: 1.75rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #10b981 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
    }

    .period-label {
      color: #94a3b8;
      font-size: 0.85rem;
    }

    .nav {
      display: flex;
      gap: 0.625rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .nav-link {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      text-decoration: none;
      color: #94a3b8;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.1);
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .nav-link:hover {
      background: rgba(15, 23, 42, 0.8);
      border-color: rgba(14, 165, 233, 0.3);
      color: #e2e8f0;
    }

    .nav-link.active {
      background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #10b981 100%);
      color: white;
      border-color: transparent;
    }

    /* Budget Section */
    .budget-section {
      margin-bottom: 1.5rem;
    }

    .budget-card {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 4px 16px rgba(14, 165, 233, 0.08);
    }

    .budget-card.over-budget {
      border-left: 4px solid #ef4444;
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.15);
    }

    .budget-card.under-budget {
      border-left: 4px solid #10b981;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
    }

    .budget-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }

    .budget-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #e2e8f0;
    }

    .budget-subtitle {
      color: #94a3b8;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .budget-status-badge {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .badge-danger {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    /* Budget Progress */
    .budget-progress-container {
      margin-bottom: 1.25rem;
    }

    .budget-progress-bar {
      height: 20px;
      background: rgba(15, 23, 42, 0.8);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 0.75rem;
      border: 1px solid rgba(148, 163, 184, 0.1);
      position: relative;
    }

    .budget-progress-fill {
      height: 100%;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 10px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 0.75rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: white;
    }

    .budget-progress-fill.under {
      background: linear-gradient(90deg, #10b981, #059669);
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
    }

    .budget-progress-fill.over {
      background: linear-gradient(90deg, #f59e0b, #ef4444);
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
    }

    .budget-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
    }

    .budget-current {
      font-weight: 700;
      color: #0ea5e9;
      font-size: 0.8rem;
    }

    /* Budget Stats Grid */
    .budget-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin-top: 1.25rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }

    .stat {
      text-align: center;
      padding: 0.75rem;
      background: rgba(15, 23, 42, 0.4);
      border-radius: 8px;
      border: 1px solid rgba(148, 163, 184, 0.08);
    }

    .stat-label {
      font-size: 0.7rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #e2e8f0;
    }

    .stat-value.spend { color: #ef4444; }
    .stat-value.remaining { color: #10b981; }
    .stat-value.over { color: #dc2626; }
    .stat-value.credit { color: #3b82f6; }

    /* Alert */
    .large-transactions-alert {
      margin-bottom: 1.5rem;
    }

    .alert-warning {
      background: rgba(251, 191, 36, 0.1);
      border: 1px solid rgba(251, 191, 36, 0.3);
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      gap: 0.75rem;
      backdrop-filter: blur(10px);
    }

    .alert-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .alert-content strong {
      display: block;
      margin-bottom: 0.25rem;
      color: #fbbf24;
      font-size: 0.95rem;
    }

    .alert-content p {
      color: #cbd5e1;
      font-size: 0.85rem;
      margin: 0;
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    /* Card */
    .card {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 4px 16px rgba(14, 165, 233, 0.08);
      margin-bottom: 1.5rem;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #e2e8f0;
    }

    .card-subtitle {
      color: #94a3b8;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }

    .empty-text {
      color: #64748b;
      font-size: 0.85rem;
      text-align: center;
      padding: 1.25rem;
    }

    /* Category List */
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .category-item {
      padding: 0.75rem;
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.08);
      border-radius: 8px;
      transition: all 0.2s;
    }

    .category-item:hover {
      background: rgba(15, 23, 42, 0.6);
      border-color: rgba(14, 165, 233, 0.2);
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .category-name {
      font-weight: 600;
      font-size: 0.85rem;
      color: #e2e8f0;
    }

    .category-amount {
      font-weight: 700;
      font-size: 0.85rem;
      color: #0ea5e9;
    }

    .category-bar-bg {
      height: 8px;
      background: rgba(15, 23, 42, 0.8);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.25rem;
    }

    .category-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .category-percentage {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    /* Merchant List */
    .merchant-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .merchant-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.08);
      border-radius: 8px;
      transition: all 0.2s;
    }

    .merchant-item:hover {
      background: rgba(15, 23, 42, 0.6);
      border-color: rgba(14, 165, 233, 0.2);
    }

    .merchant-rank {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
    }

    .merchant-details {
      flex: 1;
    }

    .merchant-name {
      font-weight: 600;
      font-size: 0.85rem;
      color: #e2e8f0;
    }

    .merchant-count {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.125rem;
    }

    .merchant-amount {
      font-weight: 700;
      font-size: 0.9rem;
      color: #ef4444;
    }

    /* Transactions */
    .transactions-grouped {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .transaction-date-group {
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 8px;
      overflow: hidden;
      background: rgba(15, 23, 42, 0.3);
    }

    .date-header {
      background: rgba(15, 23, 42, 0.6);
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .date-label {
      font-weight: 700;
      font-size: 0.85rem;
      color: #0ea5e9;
    }

    .date-total {
      font-weight: 700;
      color: #ef4444;
      font-size: 0.9rem;
    }

    .transactions-list {
      display: flex;
      flex-direction: column;
    }

    .transaction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.05);
      transition: all 0.2s;
    }

    .transaction-item:hover {
      background: rgba(15, 23, 42, 0.4);
    }

    .transaction-item:last-child {
      border-bottom: none;
    }

    .transaction-item.large {
      background: rgba(251, 191, 36, 0.1);
      border-left: 3px solid #f59e0b;
    }

    .transaction-date {
      font-size: 0.75rem;
      color: #94a3b8;
      min-width: 80px;
      font-weight: 600;
    }

    .transaction-details {
      flex: 1;
    }

    .transaction-merchant {
      font-weight: 600;
      font-size: 0.85rem;
      margin-bottom: 0.125rem;
      color: #e2e8f0;
    }

    .transaction-provider {
      font-size: 0.75rem;
      color: #64748b;
    }

    .transaction-amount {
      font-weight: 700;
      font-size: 0.95rem;
    }

    .transaction-amount.negative {
      color: #ef4444;
    }

    .transaction-amount.positive {
      color: #10b981;
    }

    .transaction-amount.large {
      color: #dc2626;
      font-size: 1.05rem;
    }

    /* Excluded Expenses */
    .excluded-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .excluded-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.08);
      border-radius: 6px;
      align-items: center;
      transition: all 0.2s;
    }

    .excluded-item:hover {
      background: rgba(15, 23, 42, 0.6);
      border-color: rgba(14, 165, 233, 0.2);
    }

    .excluded-date {
      font-size: 0.75rem;
      color: #94a3b8;
      min-width: 80px;
      font-weight: 600;
    }

    .excluded-details {
      flex: 1;
    }

    .excluded-vendor {
      font-weight: 600;
      font-size: 0.85rem;
      color: #e2e8f0;
    }

    .excluded-note {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.125rem;
    }

    .excluded-amount {
      font-weight: 700;
      color: #3b82f6;
      font-size: 0.9rem;
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
      gap: 0.5rem;
      background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #10b981 100%);
      color: white;
      border: none;
      padding: 0.875rem 1.75rem;
      font-size: 0.95rem;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
      border: 1px solid transparent;
    }

    .primary-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(14, 165, 233, 0.4);
    }

    .primary-button:active {
      transform: translateY(0);
    }

    .primary-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .secondary-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(15, 23, 42, 0.6);
      color: #0ea5e9;
      border: 1px solid rgba(14, 165, 233, 0.3);
      padding: 0.75rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .secondary-button:hover {
      background: rgba(15, 23, 42, 0.8);
      border-color: rgba(14, 165, 233, 0.5);
      transform: translateY(-1px);
    }

    .secondary-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .button-icon {
      font-size: 1.1rem;
    }

    .button-text {
      font-size: inherit;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 1.5rem;
      color: #94a3b8;
    }

    .spinner {
      border: 3px solid rgba(148, 163, 184, 0.2);
      border-top: 3px solid #0ea5e9;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Error Message */
    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      padding: 1rem;
      color: #fca5a5;
      margin-top: 1rem;
      line-height: 1.6;
      backdrop-filter: blur(10px);
    }

    .error-message strong {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
      color: #ef4444;
    }

    .error-message a {
      color: #3b82f6;
      text-decoration: underline;
    }

    .error-message a:hover {
      color: #60a5fa;
    }
  `;
}
