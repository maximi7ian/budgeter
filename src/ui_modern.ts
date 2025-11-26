/**
 * Modern UI with Premium Design System
 * Complete redesign with glass morphism, smooth animations, and better UX
 */

import { TransactionOutput, Txn } from "./types";
import { getWeeklyAllowance, getMonthlyAllowance, getLargeTransactionThreshold } from "./config";
import { aggregateByMerchant } from "./email/helpers";
import { generateBaseCSS, renderHeader, COLORS, SHADOWS, SPACING, BORDER_RADIUS } from "./ui/design-system";

/**
 * Render modern transactions page
 */
export function renderModernTransactionsPage(output: TransactionOutput): string {
  const isWeekly = output.window.mode === "weekly";
  const budget = isWeekly ? getWeeklyAllowance() : getMonthlyAllowance();
  const largeThreshold = getLargeTransactionThreshold();

  // Separate transactions
  const regularTransactions = output.transactions.filter(
    t => !(t.amountGBP < 0 && Math.abs(t.amountGBP) >= largeThreshold)
  );
  const largeTransactions = output.transactions.filter(
    t => t.amountGBP < 0 && Math.abs(t.amountGBP) >= largeThreshold
  );

  // Calculate metrics
  const totalSpend = Math.abs(
    regularTransactions.filter(t => t.amountGBP < 0).reduce((sum, t) => sum + t.amountGBP, 0)
  );
  const totalCredits = regularTransactions
    .filter(t => t.amountGBP > 0)
    .reduce((sum, t) => sum + t.amountGBP, 0);

  const budgetRemaining = budget - totalSpend;
  const budgetPercentage = (totalSpend / budget) * 100;
  const isOverBudget = totalSpend > budget;

  const merchants = aggregateByMerchant(regularTransactions, 10);
  const transactionsByDate = groupTransactionsByDate(regularTransactions);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isWeekly ? "Weekly" : "Monthly"} Transactions - Budgeter</title>
      <style>
        ${generateBaseCSS()}
        ${generateTransactionsCSS()}
      </style>
    </head>
    <body>
      <div class="app-container fade-in">
        ${renderHeader('transactions')}

        <!-- Hero Stats -->
        <div class="hero-stats glass-card" style="padding: 48px; margin-bottom: ${SPACING['2xl'}};">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px;">
            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">💸</div>
              <div>
                <div class="stat-label">Total Spent</div>
                <div class="stat-value" style="color: #ef4444;">£${totalSpend.toFixed(2)}</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, ${isOverBudget ? '#f59e0b' : '#10b981'} 0%, ${isOverBudget ? '#d97706' : '#059669'} 100%);">
                ${isOverBudget ? '⚠️' : '✨'}
              </div>
              <div>
                <div class="stat-label">${isOverBudget ? 'Over Budget' : 'Remaining'}</div>
                <div class="stat-value" style="color: ${isOverBudget ? '#f59e0b' : '#10b981'};">
                  £${Math.abs(budgetRemaining).toFixed(2)}
                </div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">💰</div>
              <div>
                <div class="stat-label">Credits</div>
                <div class="stat-value" style="color: #3b82f6;">£${totalCredits.toFixed(2)}</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">📊</div>
              <div>
                <div class="stat-label">Transactions</div>
                <div class="stat-value" style="color: #8b5cf6;">${regularTransactions.length}</div>
              </div>
            </div>
          </div>

          <!-- Budget Progress -->
          <div style="margin-top: ${SPACING['2xl'}};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: 18px; font-weight: 700;">Budget Progress</h3>
              <span class="badge ${isOverBudget ? 'badge-warning' : 'badge-success'}">
                ${budgetPercentage.toFixed(0)}% Used
              </span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill ${isOverBudget ? 'over' : 'under'}"
                   style="width: ${Math.min(budgetPercentage, 100)}%"></div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 13px; color: #4b5563;">
              <span>£0</span>
              <span style="font-weight: 600; color: #111827;">Budget: £${budget.toFixed(2)}</span>
            </div>
          </div>
        </div>

        ${largeTransactions.length > 0 ? `
        <!-- Large Transactions Alert -->
        <div class="alert-card glass-card slide-in" style="padding: 24px; margin-bottom: ${SPACING['2xl'}}; background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%); border-left: 4px solid #f59e0b;">
          <div style="display: flex; gap: 16px; align-items: start;">
            <div style="font-size: 32px;">⚠️</div>
            <div style="flex: 1;">
              <h3 style="font-size: 18px; font-weight: 700; color: #92400e; margin-bottom: 4px;">
                ${largeTransactions.length} Large Transaction${largeTransactions.length > 1 ? 's' : ''} Excluded
              </h3>
              <p style="color: #78350f; font-size: 14px;">
                £${Math.abs(largeTransactions.reduce((sum, t) => sum + t.amountGBP, 0)).toFixed(2)} in transactions over £${largeThreshold} excluded from budget calculations
              </p>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Main Content Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: ${SPACING['2xl'}}; margin-bottom: ${SPACING['2xl'}};">

          <!-- AI Insights Section -->
          <div class="glass-card" style="padding: 32px;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
              <div style="font-size: 32px;">🤖</div>
              <div>
                <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">AI-Powered Insights</h3>
                <p style="font-size: 14px; color: #4b5563;">Intelligent spending analysis & advice</p>
              </div>
            </div>

            <div id="ai-insights-placeholder">
              <div style="text-align: center; padding: 32px; background: #f9fafb; border-radius: 12px; border: 2px dashed #d1d5db;">
                <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
                <p style="color: #4b5563; margin-bottom: 24px; font-size: 15px;">
                  Get personalized insights powered by AI
                </p>
                <button id="generate-insights-btn" class="btn btn-primary">
                  <span style="font-size: 18px;">✨</span>
                  <span>Generate AI Insights</span>
                </button>
              </div>
              <div id="ai-loading" class="loading-container" style="display: none;">
                <div class="spinner"></div>
                <p style="margin-top: 16px; color: #4b5563;">Analyzing your spending...</p>
              </div>
              <div id="ai-error" class="error-box" style="display: none;"></div>
            </div>

            <div id="ai-insights-content" style="display: none;">
              <div id="categories-container" style="margin-bottom: 32px;"></div>
              <div id="advice-container" style="padding: 24px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%); border-radius: 12px; border-left: 4px solid #6366f1;"></div>
              <div style="text-align: center; margin-top: 32px;">
                <button id="preview-email-btn" class="btn btn-secondary">
                  <span style="font-size: 18px;">📧</span>
                  <span>Preview Budget Email</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Top Merchants -->
          <div class="glass-card" style="padding: 32px;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
              <div style="font-size: 32px;">🏪</div>
              <div>
                <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Top Merchants</h3>
                <p style="font-size: 14px; color: #4b5563;">Most frequent purchases</p>
              </div>
            </div>
            ${renderTopMerchants(merchants)}
          </div>
        </div>

        ${largeTransactions.length > 0 ? `
        <!-- Large Transactions -->
        <div class="glass-card" style="padding: 32px; margin-bottom: 48px;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
            <div style="font-size: 32px;">💳</div>
            <div>
              <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Large Transactions</h3>
              <p style="font-size: 14px; color: #4b5563;">Excluded from budget calculations</p>
            </div>
          </div>
          ${renderLargeTransactionsList(largeTransactions)}
        </div>
        ` : ''}

        <!-- All Transactions -->
        <div class="glass-card" style="padding: 32px; margin-bottom: 48px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="font-size: 32px;">💳</div>
              <div>
                <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">All Transactions</h3>
                <p style="font-size: 14px; color: #4b5563">${regularTransactions.length} transactions included in budget</p>
              </div>
            </div>
            <span class="badge badge-info">${regularTransactions.length}</span>
          </div>
          ${renderGroupedTransactions(transactionsByDate)}
        </div>

        ${output.excludedExpenses && output.excludedExpenses.length > 0 ? `
        <!-- Excluded Expenses -->
        <div class="glass-card" style="padding: 32px;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
            <div style="font-size: 32px;">📄</div>
            <div>
              <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Excluded Expenses</h3>
              <p style="font-size: 14px; color: #4b5563;">Work reimbursements filtered out</p>
            </div>
          </div>
          ${renderExcludedExpenses(output.excludedExpenses)}
        </div>
        ` : ''}
      </div>

      <!-- JavaScript -->
      <script>
        ${generateJavaScript(output.window.mode)}
      </script>
    </body>
    </html>
  `;
}

function generateTransactionsCSS(): string {
  return `
    /* Hero Stats */
    .hero-stats {
      animation: fadeIn 0.6s ease;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .stat-label {
      font-size: 13px;
      color: #4b5563;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 800;
      line-height: 1;
    }

    /* Progress Bar */
    .progress-bar-container {
      height: 12px;
      background: #e5e7eb;
      border-radius: 9999px;
      overflow: hidden;
      box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
    }

    .progress-bar-fill {
      height: 100%;
      transition: width 1s ease;
      position: relative;
      overflow: hidden;
    }

    .progress-bar-fill.under {
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
    }

    .progress-bar-fill.over {
      background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
    }

    .progress-bar-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    /* Merchant List */
    .merchant-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: 400px;
      overflow-y: auto;
      padding-right: 8px;
    }

    .merchant-list::-webkit-scrollbar {
      width: 6px;
    }

    .merchant-list::-webkit-scrollbar-track {
      background: #f3f4f6;
      border-radius: 9999px;
    }

    .merchant-list::-webkit-scrollbar-thumb {
      background: #9ca3af;
      border-radius: 9999px;
    }

    .merchant-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .merchant-item:hover {
      background: white;
      transform: translateX(4px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .merchant-rank {
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    .merchant-info {
      flex: 1;
    }

    .merchant-name {
      font-weight: 600;
      color: #111827;
      font-size: 15px;
    }

    .merchant-count {
      font-size: 13px;
      color: #6b7280;
      margin-top: 2px;
    }

    .merchant-amount {
      font-weight: 700;
      color: #111827;
      font-size: 16px;
    }

    /* Transaction Table */
    .transaction-table {
      max-height: 600px;
      overflow-y: auto;
    }

    .transaction-group {
      margin-bottom: 24px;
    }

    .date-header {
      position: sticky;
      top: 0;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      z-index: 10;
    }

    .transaction-row {
      display: flex;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #f3f4f6;
      transition: background 0.2s ease;
    }

    .transaction-row:hover {
      background: #f9fafb;
    }

    .transaction-vendor {
      flex: 1;
      font-weight: 600;
      color: #111827;
    }

    .transaction-description {
      font-size: 13px;
      color: #6b7280;
      margin-top: 2px;
    }

    .transaction-amount {
      font-weight: 700;
      font-size: 16px;
    }

    .transaction-amount.debit {
      color: #ef4444;
    }

    .transaction-amount.credit {
      color: #10b981;
    }

    /* Loading */
    .loading-container {
      text-align: center;
      padding: 48px;
    }

    /* Error Box */
    .error-box {
      background: #fee2e2;
      border: 2px solid #ef4444;
      border-radius: 8px;
      padding: 24px;
      color: #991b1b;
      line-height: 1.6;
    }

    .error-box strong {
      display: block;
      margin-bottom: 8px;
      font-size: 16px;
    }

    .error-box a {
      color: #3b82f6;
      text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 968px) {
      .hero-stats {
        grid-template-columns: 1fr 1fr !important;
      }
    }

    @media (max-width: 768px) {
      .hero-stats {
        grid-template-columns: 1fr !important;
      }
    }
  `;
}

// Helper functions
function groupTransactionsByDate(transactions: Txn[]): Map<string, Txn[]> {
  const grouped = new Map<string, Txn[]>();
  for (const txn of transactions) {
    const date = txn.postedDate;
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(txn);
  }
  // Sort by date descending
  return new Map([...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}

function renderTopMerchants(merchants: any[]): string {
  if (merchants.length === 0) {
    return '<p style="color: #6b7280; text-align: center; padding: 32px;">No merchants found</p>';
  }

  return `
    <div class="merchant-list">
      ${merchants.map((m, i) => `
        <div class="merchant-item slide-in" style="animation-delay: ${i * 0.05}s;">
          <div class="merchant-rank">${i + 1}</div>
          <div class="merchant-info">
            <div class="merchant-name">${escapeHtml(m.name)}</div>
            <div class="merchant-count">${m.transactionCount} transaction${m.transactionCount > 1 ? 's' : ''}</div>
          </div>
          <div class="merchant-amount">${m.amountFormatted}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLargeTransactionsList(transactions: Txn[]): string {
  return `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Merchant</th>
            <th>Description</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(t => `
            <tr>
              <td><strong>${escapeHtml(t.merchant || 'Unknown')}</strong></td>
              <td style="color: #6b7280;">${escapeHtml(t.description)}</td>
              <td style="text-align: right;">
                <span style="font-weight: 700; color: #ef4444;">£${Math.abs(t.amountGBP).toFixed(2)}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderGroupedTransactions(grouped: Map<string, Txn[]>): string {
  return `
    <div class="transaction-table">
      ${Array.from(grouped.entries()).map(([date, txns]) => {
        const dayTotal = txns.reduce((sum, t) => sum + t.amountGBP, 0);
        return `
          <div class="transaction-group">
            <div class="date-header">
              <span>${formatDateLabel(date)}</span>
              <span>${dayTotal < 0 ? '-' : '+'}£${Math.abs(dayTotal).toFixed(2)}</span>
            </div>
            ${txns.map(t => `
              <div class="transaction-row">
                <div style="flex: 1;">
                  <div class="transaction-vendor">${escapeHtml(t.merchant || 'Unknown')}</div>
                  <div class="transaction-description">${escapeHtml(t.description)}</div>
                </div>
                <div class="transaction-amount ${t.amountGBP < 0 ? 'debit' : 'credit'}">
                  ${t.amountGBP < 0 ? '-' : '+'}£${Math.abs(t.amountGBP).toFixed(2)}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderExcludedExpenses(expenses: any[]): string {
  return `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Vendor</th>
            <th style="text-align: right;">Amount</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.map(e => `
            <tr>
              <td>${e.dateISO}</td>
              <td><strong>${escapeHtml(e.vendor)}</strong></td>
              <td style="text-align: right;">£${e.amountGBP.toFixed(2)}</td>
              <td style="color: #6b7280;">${e.note || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function generateJavaScript(windowMode: string): string {
  return `
    const periodWindow = '${windowMode}';
    let aiResponseData = null;

    document.getElementById('generate-insights-btn')?.addEventListener('click', async function() {
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

        // Render categories
        let categoriesHTML = '<h4 style="font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #111827;">📊 Spending by Category</h4>';
        categoriesHTML += '<div style="display: flex; flex-direction: column; gap: 16px;">';

        result.data.categories.forEach(cat => {
          const color = cat.percentage > 30 ? '#ef4444' : cat.percentage > 15 ? '#f59e0b' : '#6366f1';
          categoriesHTML += \`
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 600; color: #111827;">\${cat.emoji} \${cat.name}</span>
                <span style="font-weight: 700; color: #111827;">£\${cat.amount.toFixed(2)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="flex: 1; background: #e5e7eb; border-radius: 999px; height: 8px; overflow: hidden;">
                  <div style="width: \${Math.min(cat.percentage, 100)}%; height: 100%; background: \${color}; transition: width 0.8s ease;"></div>
                </div>
                <span style="font-size: 13px; color: #4b5563; font-weight: 600; min-width: 45px; text-align: right;">\${cat.percentage.toFixed(1)}%</span>
              </div>
            </div>
          \`;
        });
        categoriesHTML += '</div>';

        document.getElementById('categories-container').innerHTML = categoriesHTML;
        document.getElementById('advice-container').innerHTML =
          '<h4 style="font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #111827;">💡 Financial Advice</h4>' +
          result.data.advice;

      } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.innerHTML = err.message.includes('OpenAI API key')
          ? '<strong>⚠️ OpenAI Not Configured</strong><br>Add your OpenAI API key to .env file to use AI insights.<br><a href="https://platform.openai.com/api-keys" target="_blank">Get API Key →</a>'
          : '<strong>Error</strong><br>' + err.message;
        button.style.display = 'inline-flex';
      }
    });

    document.getElementById('preview-email-btn')?.addEventListener('click', async function() {
      if (!aiResponseData) {
        alert('Please generate AI insights first');
        return;
      }

      const button = this;
      const originalHTML = button.innerHTML;
      button.disabled = true;
      button.innerHTML = '<span style="font-size: 18px;">⏳</span><span>Generating...</span>';

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
        button.innerHTML = originalHTML;
      }
    });
  `;
}

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
