/**
 * HTML rendering helpers - Modern UI Design
 * Clean, intuitive interface for TrueLayer + Google Sheets budgeting app
 */

import { AccountSummary, TransactionOutput } from "./types";
import { ConnectionInfo } from "./data";

const CSS = `
  /* ========== Global Reset & Base Styles ========== */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    background: #f6f8fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ========== Header & Navigation ========== */
  header {
    background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%);
    color: white;
    padding: 1.5rem 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .header-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  h1.app-title {
    font-size: 1.75em;
    font-weight: 600;
    color: white;
    margin: 0;
  }

  nav {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  nav a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 500;
    transition: background 0.2s;
  }

  nav a:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* ========== Main Container ========== */
  main {
    flex: 1;
    max-width: 960px;
    margin: 2rem auto;
    padding: 0 20px;
    width: 100%;
  }

  .page-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.12);
    padding: 2rem;
    margin-bottom: 2rem;
  }

  /* ========== Typography ========== */
  h1 {
    font-size: 2em;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  h2 {
    font-size: 1.5em;
    color: #1a1a1a;
    margin: 2rem 0 1rem 0;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  h3 {
    font-size: 1.25em;
    color: #333;
    margin: 1.5rem 0 0.75rem 0;
    font-weight: 600;
  }

  p {
    color: #555;
    margin-bottom: 1rem;
  }

  /* ========== Section Cards ========== */
  .section-card {
    background: #fafbfc;
    border: 1px solid #e1e4e8;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1.5rem 0;
  }

  .connection-card {
    background: white;
    border: 1px solid #e1e4e8;
    border-left: 4px solid #0070f3;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1rem 0;
    transition: box-shadow 0.2s;
  }

  .connection-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .connection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .connection-title {
    font-size: 1.1em;
    font-weight: 600;
    color: #1a1a1a;
  }

  /* ========== Badges ========== */
  .badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 16px;
    font-size: 0.85em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge.success {
    background: #d4edda;
    color: #155724;
  }

  .badge.warning {
    background: #fff3cd;
    color: #856404;
  }

  .badge.danger {
    background: #f8d7da;
    color: #721c24;
  }

  .badge.info {
    background: #cfe2ff;
    color: #084298;
  }

  /* ========== Buttons ========== */
  .button, button, input[type="submit"] {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    font-size: 1em;
    font-weight: 500;
    text-decoration: none;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .button-primary, .button {
    background: #0070f3;
    color: white;
  }

  .button-primary:hover, .button:hover {
    background: #0051cc;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);
  }

  .button-secondary {
    background: white;
    color: #333;
    border: 2px solid #e1e4e8;
  }

  .button-secondary:hover {
    border-color: #0070f3;
    color: #0070f3;
  }

  .button-danger {
    background: #dc3545;
    color: white;
  }

  .button-danger:hover {
    background: #c82333;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin: 1.5rem 0;
  }

  /* ========== Tables ========== */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  thead {
    background: #f6f8fa;
  }

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #24292f;
    text-transform: uppercase;
    font-size: 0.85em;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e1e4e8;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #e1e4e8;
    color: #333;
  }

  tbody tr {
    transition: background 0.15s;
  }

  tbody tr:hover {
    background: #f6f8fa;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  td.amount-negative {
    color: #dc3545;
    font-weight: 600;
  }

  td.amount-positive {
    color: #28a745;
    font-weight: 600;
  }

  td.text-right {
    text-align: right;
  }

  /* ========== KPI Cards ========== */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .kpi-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .kpi-card:nth-child(2) {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .kpi-card:nth-child(3) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  .kpi-card:nth-child(4) {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }

  .kpi-label {
    font-size: 0.85em;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
  }

  .kpi-value {
    font-size: 2em;
    font-weight: 700;
    margin-top: 0.25rem;
  }

  /* ========== Info Boxes ========== */
  .info-box, .warning-box, .error-box, .success-box {
    padding: 1rem 1.5rem;
    border-radius: 8px;
    margin: 1.5rem 0;
    border-left: 4px solid;
  }

  .info-box {
    background: #e7f3ff;
    border-left-color: #0070f3;
    color: #014361;
  }

  .warning-box {
    background: #fff3cd;
    border-left-color: #ffc107;
    color: #664d03;
  }

  .error-box {
    background: #f8d7da;
    border-left-color: #dc3545;
    color: #721c24;
  }

  .success-box {
    background: #d4edda;
    border-left-color: #28a745;
    color: #155724;
  }

  /* ========== JSON/Details ========== */
  details {
    margin: 1.5rem 0;
    background: #f6f8fa;
    border: 1px solid #e1e4e8;
    border-radius: 8px;
    overflow: hidden;
  }

  summary {
    padding: 1rem 1.5rem;
    cursor: pointer;
    font-weight: 600;
    background: #fafbfc;
    border-bottom: 1px solid #e1e4e8;
    user-select: none;
    transition: background 0.15s;
  }

  summary:hover {
    background: #f3f4f6;
  }

  details[open] summary {
    border-bottom: 1px solid #e1e4e8;
  }

  pre {
    margin: 0;
    padding: 1.5rem;
    background: #24292f;
    color: #c9d1d9;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.875em;
    line-height: 1.6;
    overflow-x: auto;
    border-radius: 0 0 8px 8px;
  }

  code {
    background: #f6f8fa;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    color: #333;
  }

  /* ========== Footer ========== */
  footer {
    background: #24292f;
    color: #8b949e;
    text-align: center;
    padding: 2rem;
    margin-top: auto;
  }

  footer p {
    margin: 0;
    color: #8b949e;
  }

  footer a {
    color: #58a6ff;
    text-decoration: none;
  }

  footer a:hover {
    text-decoration: underline;
  }

  /* ========== Empty States ========== */
  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: #666;
  }

  .empty-state-icon {
    font-size: 4em;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  .empty-state-title {
    font-size: 1.5em;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .empty-state-text {
    color: #666;
  }

  /* ========== Responsive ========== */
  @media (max-width: 768px) {
    .header-container {
      flex-direction: column;
      align-items: flex-start;
    }

    nav {
      width: 100%;
    }

    nav a {
      flex: 1;
      text-align: center;
    }

    .kpi-grid {
      grid-template-columns: 1fr;
    }

    .connection-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  /* ========== Utility Classes ========== */
  .text-center { text-align: center; }
  .text-muted { color: #666; }
  .mt-1 { margin-top: 0.5rem; }
  .mt-2 { margin-top: 1rem; }
  .mb-1 { margin-bottom: 0.5rem; }
  .mb-2 { margin-bottom: 1rem; }
`;

/**
 * Render common header with navigation
 */
function renderHeader(currentPage: string = "", showLogout: boolean = false): string {
  return `
    <header>
      <div class="header-container">
        <h1 class="app-title">💰 Finance Dashboard</h1>
        <nav>
          <a href="/">🏠 Home</a>
          <a href="/transactions?window=weekly">📅 Weekly</a>
          <a href="/transactions?window=monthly">📊 Monthly</a>
          <a href="/settings">⚙️ Settings</a>
          <a href="/diag">🔧 Diagnostics</a>
          ${showLogout ? '<a href="/logout">🚪 Logout</a>' : ''}
        </nav>
      </div>
    </header>
  `;
}

/**
 * Render common footer
 */
function renderFooter(): string {
  return `
    <footer>
      <p>Powered by <a href="https://truelayer.com" target="_blank">TrueLayer</a> & <a href="https://sheets.google.com" target="_blank">Google Sheets</a></p>
    </footer>
  `;
}

/**
 * Render home page
 */
export function renderHomePage(
  accounts: AccountSummary[] | null,
  error?: string,
  connections?: ConnectionInfo[]
): string {
  const isConnected = accounts !== null && accounts.length > 0;

  // Build connections section
  let connectionsHtml = "";
  if (error) {
    connectionsHtml = `
      <div class="error-box">
        <strong>❌ Error:</strong> ${error}
      </div>
    `;
  } else if (isConnected && connections && connections.length > 0) {
    connectionsHtml = `
      <h2>💳 Connected Accounts</h2>
      ${connections
        .map(
          (conn) => `
        <div class="connection-card">
          <div class="connection-header">
            <div>
              <span class="connection-title">${conn.providers.join(", ")}</span>
              <span class="badge info" style="margin-left: 0.5rem;">${conn.items.length} item${
            conn.items.length !== 1 ? "s" : ""
          }</span>
            </div>
            <form method="POST" action="/disconnect/${conn.tokenFileName}" style="margin: 0;"
                  onsubmit="return confirm('Are you sure you want to disconnect ${conn.providers.join(", ")}?');">
              <button type="submit" class="button-danger" style="padding: 0.5rem 1rem;">
                ✕ Disconnect
              </button>
            </form>
          </div>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Display Name</th>
                <th>Currency</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              ${conn.items
                .map(
                  (item) => `
                <tr>
                  <td><span class="badge ${item.kind === "card" ? "warning" : "success"}">${
                    item.kind === "account" ? "Account" : "Card"
                  }</span></td>
                  <td>${item.display_name}</td>
                  <td>${item.currency}</td>
                  <td><code>${item.kind === "account" ? item.account_id : item.card_id}</code></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `
        )
        .join("")}
    `;
  } else if (isConnected && accounts) {
    // Fallback: flat table
    connectionsHtml = `
      <h2>💳 Connected Accounts</h2>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Type</th>
            <th>Display Name</th>
            <th>Currency</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
          ${accounts
            .map(
              (acc) => `
            <tr>
              <td><strong>${acc.provider}</strong></td>
              <td><span class="badge ${acc.kind === "card" ? "warning" : "success"}">${
                acc.kind === "account" ? "Account" : "Card"
              }</span></td>
              <td>${acc.display_name}</td>
              <td>${acc.currency}</td>
              <td><code>${acc.id}</code></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Finance Dashboard - Home</title>
      <style>${CSS}</style>
    </head>
    <body>
      ${renderHeader("home")}

      <main>
        <div class="page-card">
          <h1>Welcome to Your Finance Dashboard</h1>
          <p class="text-muted">Manage your bank accounts, track transactions, and reconcile expenses in one place.</p>

          ${
            !isConnected
              ? `
            <div class="section-card">
              <h2>🚀 Get Started</h2>
              <p>Connect your bank accounts to start tracking transactions.</p>
              <div class="actions">
                <a href="/link" class="button-primary button">Connect Banks via TrueLayer</a>
              </div>
            </div>
          `
              : `
            ${connectionsHtml}

            <h2>📊 Fetch Transactions</h2>
            <div class="info-box">
              <strong>Choose a time window</strong> to fetch and view your transactions. Results will be displayed with full details and downloadable JSON.
            </div>
            <div class="actions">
              <a href="/transactions?window=weekly" class="button-primary button">📅 Fetch Last 7 Days</a>
              <a href="/transactions?window=monthly" class="button-secondary button">📊 Fetch Last Month</a>
            </div>

            <h3>➕ Connect More Accounts</h3>
            <p>Want to add more bank accounts or cards?</p>
            <div class="actions">
              <a href="/link" class="button-secondary button">+ Connect More Banks</a>
            </div>
          `
          }

          <div class="section-card mt-2">
            <h3>ℹ️ How It Works</h3>
            <ol>
              <li><strong>Connect:</strong> Authorize TrueLayer to securely access your bank accounts (Monzo, Amex, Nationwide, etc.)</li>
              <li><strong>Fetch:</strong> Retrieve transactions for weekly (last 7 days) or monthly (previous month) windows</li>
              <li><strong>Review:</strong> View transactions with pending/posted status, amounts, and merchant details</li>
              <li><strong>Export:</strong> Download JSON data for further analysis or reconciliation</li>
            </ol>
          </div>
        </div>
      </main>

      ${renderFooter()}
    </body>
    </html>
  `;
}

/**
 * Render transactions page
 */
export function renderTransactionsPage(output: TransactionOutput): string {
  const totalTransactions = output.transactions.length;
  const totalSpend = Math.abs(
    output.transactions.filter((t) => t.amountGBP < 0).reduce((sum, t) => sum + t.amountGBP, 0)
  );
  const totalCredits = output.transactions
    .filter((t) => t.amountGBP > 0)
    .reduce((sum, t) => sum + t.amountGBP, 0);
  const excludedExpensesCount = output.excludedExpenses?.length || 0;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transactions - ${output.window.mode}</title>
      <style>${CSS}</style>
    </head>
    <body>
      ${renderHeader("transactions")}

      <main>
        <div class="page-card">
          <h1>📊 Transactions</h1>
          <p>
            <span class="badge info">${output.window.mode}</span>
            <span class="text-muted">Showing ${output.window.from} to ${output.window.to}</span>
          </p>
          <div class="actions">
            <a href="/" class="button-secondary button">← Back to Home</a>
          </div>

          <!-- KPI Summary -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">💷 Total Spend</div>
              <div class="kpi-value">£${totalSpend.toFixed(2)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">💰 Total Credits</div>
              <div class="kpi-value">£${totalCredits.toFixed(2)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">🧾 Transactions</div>
              <div class="kpi-value">${totalTransactions}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">📄 Excluded Expenses</div>
              <div class="kpi-value">${excludedExpensesCount}</div>
            </div>
          </div>

          <!-- Accounts Summary -->
          <h2>🏦 Accounts Summary</h2>
          ${
            output.accounts.length > 0
              ? `
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Type</th>
                <th>Display Name</th>
                <th>Currency</th>
                <th class="text-right">Transactions</th>
              </tr>
            </thead>
            <tbody>
              ${output.accounts
                .map(
                  (acc) => `
                <tr>
                  <td><strong>${acc.provider}</strong></td>
                  <td><span class="badge ${acc.kind === "card" ? "warning" : "success"}">${
                    acc.kind === "account" ? "Account" : "Card"
                  }</span></td>
                  <td>${acc.display_name}</td>
                  <td>${acc.currency}</td>
                  <td class="text-right"><strong>${
                    output.transactions.filter((t) => t.sourceId === acc.id).length
                  }</strong></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          `
              : `
          <div class="empty-state">
            <div class="empty-state-icon">🏦</div>
            <div class="empty-state-title">No accounts found</div>
            <div class="empty-state-text">Connect your bank accounts to see data here.</div>
          </div>
          `
          }

          <!-- Excluded Expenses Section -->
          <h2>📄 Excluded Expenses (Google Sheets)</h2>
          <p class="text-muted">Transactions that should be ignored in budget calculations (e.g., work reimbursements, gifts, etc.)</p>
          <p class="text-muted" style="font-size: 0.9em;"><strong>Required columns:</strong> Date | Vendor | Amount &nbsp;&nbsp;<strong>Optional:</strong> Note</p>
          ${
            output.sheetsError
              ? `
          <div class="warning-box">
            <strong>⚠️ Google Sheets Error:</strong> ${output.sheetsError}
          </div>
          `
              : ""
          }
          ${
            output.excludedExpenses && output.excludedExpenses.length > 0
              ? `
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th class="text-right">Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              ${output.excludedExpenses
                .map(
                  (expense) => `
                <tr>
                  <td>${expense.dateISO}</td>
                  <td><strong>${expense.vendor}</strong></td>
                  <td class="text-right">£${expense.amountGBP.toFixed(2)}</td>
                  <td>${expense.note || "-"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          `
              : !output.sheetsError
              ? `
          <div class="empty-state">
            <div class="empty-state-icon">📄</div>
            <div class="empty-state-title">No excluded expenses configured</div>
            <div class="empty-state-text">
              Set GOOGLE_SHEETS_SPREADSHEET_ID in .env to track expenses that should be excluded from your budget.
              <br><br>
              <strong>Sheet format:</strong> Date | Vendor | Amount | Note (optional) | Repaid (optional)
            </div>
          </div>
          `
              : ""
          }

          <!-- Transactions Table -->
          <h2>💳 All Transactions</h2>
          ${
            totalTransactions > 0
              ? `
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Provider</th>
                <th>Merchant</th>
                <th>Description</th>
                <th class="text-right">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${output.transactions
                .sort((a, b) => b.postedDate.localeCompare(a.postedDate))
                .map(
                  (txn) => `
                <tr>
                  <td>${txn.postedDate}</td>
                  <td>${txn.provider}</td>
                  <td>${txn.merchant || "-"}</td>
                  <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${txn.description}">${
                    txn.description
                  }</td>
                  <td class="text-right ${txn.amountGBP < 0 ? "amount-negative" : "amount-positive"}">
                    ${txn.amountGBP < 0 ? "-" : "+"}£${Math.abs(txn.amountGBP).toFixed(2)}
                  </td>
                  <td><span class="badge ${txn.status === "posted" ? "success" : "warning"}">${
                    txn.status === "posted" ? "Posted" : "Pending"
                  }</span></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          `
              : `
          <div class="empty-state">
            <div class="empty-state-icon">💳</div>
            <div class="empty-state-title">No transactions found</div>
            <div class="empty-state-text">No transactions were found for this period. Try selecting a different time window.</div>
          </div>
          `
          }

          <!-- JSON Export Section -->
          <h2>📦 Export Data</h2>
          <div class="info-box">
            <strong>Download or copy JSON data</strong> for use in spreadsheets, ChatGPT, or other analysis tools.
          </div>

          <details>
            <summary>💳 View Transactions JSON (${totalTransactions} items)</summary>
            <pre>${JSON.stringify(output.transactions, null, 2)}</pre>
          </details>

          ${
            output.excludedExpenses && output.excludedExpenses.length > 0
              ? `
          <details>
            <summary>📄 View Excluded Expenses JSON (${output.excludedExpenses.length} items)</summary>
            <pre>${JSON.stringify(output.excludedExpenses, null, 2)}</pre>
          </details>
          `
              : ""
          }

          <div class="actions">
            <button class="button-primary button" onclick="downloadJSON()">⬇️ Download Complete JSON</button>
          </div>
        </div>
      </main>

      ${renderFooter()}

      <script>
        function downloadJSON() {
          const data = ${JSON.stringify(JSON.stringify(output, null, 2))};
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'transactions-${output.window.mode}-${output.window.from}-${output.window.to}.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      </script>
    </body>
    </html>
  `;
}

/**
 * Render error page
 */
export function renderErrorPage(message: string, details?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error</title>
      <style>${CSS}</style>
    </head>
    <body>
      ${renderHeader("")}

      <main>
        <div class="page-card">
          <div class="empty-state">
            <div class="empty-state-icon">❌</div>
            <div class="empty-state-title">Error</div>
          </div>

          <div class="error-box">
            <strong>${message}</strong>
            ${details ? `<p style="margin-top: 0.75rem;">${details}</p>` : ""}
          </div>

          <div class="actions">
            <a href="/" class="button-primary button">← Back to Home</a>
          </div>
        </div>
      </main>

      ${renderFooter()}
    </body>
    </html>
  `;
}

/**
 * Render login page
 */
export function renderLoginPage(error?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - Finance Dashboard</title>
      <style>${CSS}</style>
    </head>
    <body>
      <header>
        <div class="header-container">
          <h1 class="app-title">💰 Finance Dashboard</h1>
        </div>
      </header>

      <main>
        <div class="page-card" style="max-width: 400px; margin: 4rem auto;">
          <h1 class="text-center">🔐 Login</h1>
          <p class="text-center text-muted">Enter your credentials to access the dashboard</p>

          ${error ? `<div class="error-box">${error}</div>` : ""}

          <form method="POST" action="/login" style="margin-top: 2rem;">
            <div style="margin-bottom: 1.5rem;">
              <label for="email" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autofocus
                style="width: 100%; padding: 0.75rem; border: 1px solid #e1e4e8; border-radius: 6px; font-size: 1em;"
              >
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label for="password" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                style="width: 100%; padding: 0.75rem; border: 1px solid #e1e4e8; border-radius: 6px; font-size: 1em;"
              >
            </div>

            <button type="submit" class="button-primary" style="width: 100%;">
              Login
            </button>
          </form>
        </div>
      </main>

      ${renderFooter()}
    </body>
    </html>
  `;
}

/**
 * Render settings page
 */
export function renderSettingsPage(success?: string, error?: string): string {
  const aiConfigured = !!process.env.OPENAI_API_KEY;
  const emailConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

  // Get cron schedules from env
  const weeklySchedule = process.env.WEEKLY_CRON_SCHEDULE;
  const monthlySchedule = process.env.MONTHLY_CRON_SCHEDULE;

  // Get budget settings from env
  const { getWeeklyAllowance, getMonthlyAllowance, getLargeTransactionThreshold } = require('./config');
  const weeklyAllowance = getWeeklyAllowance();
  const monthlyAllowance = getMonthlyAllowance();
  const largeTransactionThreshold = getLargeTransactionThreshold();

  // Import cron helper
  const { parseCronExpression } = require('./cronHelper');

  const weeklyScheduleText = weeklySchedule ? parseCronExpression(weeklySchedule) : null;
  const monthlyScheduleText = monthlySchedule ? parseCronExpression(monthlySchedule) : null;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Settings - Finance Dashboard</title>
      <style>${CSS}</style>
    </head>
    <body>
      ${renderHeader("settings", true)}

      <main>
        <div class="page-card">
          <h1>⚙️ Settings</h1>
          <p class="text-muted">Configure your budget alerts and preferences</p>

          ${success ? `<div class="success-box">${success}</div>` : ""}
          ${error ? `<div class="error-box">${error}</div>` : ""}

          <!-- Configuration Status -->
          <h2>📋 System Status</h2>
          <div class="section-card">
            <div style="display: grid; gap: 0.5rem;">
              <div>
                <strong>OpenAI API:</strong>
                <span class="badge ${aiConfigured ? "success" : "danger"}">
                  ${aiConfigured ? "✓ Configured" : "Not Configured"}
                </span>
                ${!aiConfigured ? '<p class="text-muted" style="margin-top: 0.5rem; font-size: 0.9em;">Set OPENAI_API_KEY in .env to enable AI-powered budget summaries</p>' : ''}
              </div>
              <div>
                <strong>Email (SMTP):</strong>
                <span class="badge ${emailConfigured ? "success" : "danger"}">
                  ${emailConfigured ? "✓ Configured" : "Not Configured"}
                </span>
                ${!emailConfigured ? '<p class="text-muted" style="margin-top: 0.5rem; font-size: 0.9em;">Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env to enable email alerts</p>' : ''}
              </div>
            </div>
          </div>

          <!-- Settings (Read-Only) -->
          <div>
            <h2>📧 Email Alert Settings</h2>
            <div class="section-card">
              <!-- Alert Recipients Status (from env) -->
              <div style="margin-bottom: 1.5rem; padding: 1rem; background: ${process.env.ALERT_EMAIL_TO ? '#e7f3ff' : '#fff3cd'}; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <strong style="font-size: 1em;">📬 Alert Recipients</strong>
                  <span class="badge ${process.env.ALERT_EMAIL_TO ? 'success' : 'warning'}">
                    ${process.env.ALERT_EMAIL_TO ? '✓ Configured' : 'Not Configured'}
                  </span>
                </div>
                ${process.env.ALERT_EMAIL_TO
                  ? `<p class="text-muted" style="margin: 0; font-size: 0.9em;">
                       ${(() => {
                         const emails = process.env.ALERT_EMAIL_TO.split(',').map((e: string) => e.trim());
                         return emails.length === 1
                           ? `<strong>${emails[0]}</strong>`
                           : `<strong>${emails.length} recipients:</strong><br>${emails.map((e: string) => `• ${e}`).join('<br>')}`;
                       })()}
                     </p>
                     <p class="text-muted" style="margin: 0.5rem 0 0 0; font-size: 0.85em;">To change: Update ALERT_EMAIL_TO in .env</p>`
                  : `<p class="text-muted" style="margin: 0; font-size: 0.9em;">To receive email alerts, set <code>ALERT_EMAIL_TO</code> in your .env file</p>
                     <p class="text-muted" style="margin: 0.5rem 0 0 0; font-size: 0.85em;">Example: <code>ALERT_EMAIL_TO=you@email.com</code> or <code>ALERT_EMAIL_TO=email1@example.com,email2@example.com</code></p>`
                }
              </div>

              <!-- Weekly Alerts Status -->
              <div style="margin-bottom: 1.5rem; padding: 1rem; background: ${weeklySchedule ? '#e7f3ff' : '#fff3cd'}; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <strong style="font-size: 1em;">📅 Weekly Email Alerts</strong>
                  <span class="badge ${weeklySchedule ? 'success' : 'warning'}">
                    ${weeklySchedule ? '✓ Enabled' : 'Not Configured'}
                  </span>
                </div>
                ${weeklySchedule
                  ? `<p class="text-muted" style="margin: 0; font-size: 0.9em;">Scheduled: <strong>${weeklyScheduleText}</strong></p>
                     <p class="text-muted" style="margin: 0.5rem 0 0 0; font-size: 0.85em;">To change: Update WEEKLY_CRON_SCHEDULE in .env</p>`
                  : `<p class="text-muted" style="margin: 0; font-size: 0.9em;">To enable weekly alerts, set <code>WEEKLY_CRON_SCHEDULE</code> in your .env file</p>
                     <p class="text-muted" style="margin: 0.5rem 0 0 0; font-size: 0.85em;">Example: <code>WEEKLY_CRON_SCHEDULE=0 9 * * 1</code> (Monday 9:00 AM)</p>`
                }
              </div>

              <!-- Monthly Alerts Status -->
              <div style="margin-bottom: 1.5rem; padding: 1rem; background: ${monthlySchedule ? '#e7f3ff' : '#fff3cd'}; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <strong style="font-size: 1em;">📊 Monthly Email Alerts</strong>
                  <span class="badge ${monthlySchedule ? 'success' : 'warning'}">
                    ${monthlySchedule ? '✓ Enabled' : 'Not Configured'}
                  </span>
                </div>
                ${monthlySchedule
                  ? `<p class="text-muted" style="margin: 0; font-size: 0.9em;">Scheduled: <strong>${monthlyScheduleText}</strong></p>
                     <p class="text-muted" style="margin: 0.5rem 0 0 0; font-size: 0.85em;">To change: Update MONTHLY_CRON_SCHEDULE in .env</p>`
                  : `<p class="text-muted" style="margin: 0; font-size: 0.9em;">To enable monthly alerts, set <code>MONTHLY_CRON_SCHEDULE</code> in your .env file</p>
                     <p class="text-muted" style="margin: 0.5rem 0 0 0; font-size: 0.85em;">Example: <code>MONTHLY_CRON_SCHEDULE=0 9 1 * *</code> (1st of month 9:00 AM)</p>`
                }
              </div>
            </div>

            <h2>💰 Budget Settings</h2>
            <div class="section-card">
              <!-- Weekly Allowance Status -->
              <div style="margin-bottom: 1.5rem; padding: 1rem; background: ${process.env.WEEKLY_ALLOWANCE ? '#e7f3ff' : '#fff3cd'}; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <strong style="font-size: 1em;">📅 Weekly Allowance</strong>
                  <span class="badge ${process.env.WEEKLY_ALLOWANCE ? 'success' : 'warning'}">
                    ${process.env.WEEKLY_ALLOWANCE ? '✓ Configured' : 'Using Default'}
                  </span>
                </div>
                <p class="text-muted" style="margin: 0; font-size: 0.9em;">Current: <strong>£${weeklyAllowance}</strong></p>
                <p class="text-muted" style="margin: 0.5rem 0 0 0; font-size: 0.85em;">To change: Update WEEKLY_ALLOWANCE in .env ${!process.env.WEEKLY_ALLOWANCE ? '(currently using default: £100)' : ''}</p>
              </div>

              <!-- Monthly Allowance Status -->
              <div style="margin-bottom: 1.5rem; padding: 1rem; background: ${process.env.MONTHLY_ALLOWANCE ? '#e7f3ff' : '#fff3cd'}; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <strong style="font-size: 1em;">📊 Monthly Allowance</strong>
                  <span class="badge ${process.env.MONTHLY_ALLOWANCE ? 'success' : 'warning'}">
                    ${process.env.MONTHLY_ALLOWANCE ? '✓ Configured' : 'Using Default'}
                  </span>
                </div>
                <p class="text-muted" style="margin: 0; font-size: 0.9em;">Current: <strong>£${monthlyAllowance}</strong></p>
                <p class="text-muted" style="margin: 0.5rem 0 0 0; font-size: 0.85em;">To change: Update MONTHLY_ALLOWANCE in .env ${!process.env.MONTHLY_ALLOWANCE ? `(currently defaulting to 4x weekly: £${weeklyAllowance} × 4)` : ''}</p>
              </div>

              <!-- Large Transaction Threshold Status -->
              <div style="margin-bottom: 1.5rem; padding: 1rem; background: ${process.env.LARGE_TRANSACTION_THRESHOLD ? '#e7f3ff' : '#fff3cd'}; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <strong style="font-size: 1em;">🔔 Large Transaction Threshold</strong>
                  <span class="badge ${process.env.LARGE_TRANSACTION_THRESHOLD ? 'success' : 'warning'}">
                    ${process.env.LARGE_TRANSACTION_THRESHOLD ? '✓ Configured' : 'Using Default'}
                  </span>
                </div>
                <p class="text-muted" style="margin: 0; font-size: 0.9em;">Current: <strong>£${largeTransactionThreshold}</strong></p>
                <p class="text-muted" style="margin: 0.5rem 0 0 0; font-size: 0.85em;">Transactions above this are excluded from budget analysis. To change: Update LARGE_TRANSACTION_THRESHOLD in .env ${!process.env.LARGE_TRANSACTION_THRESHOLD ? '(currently using default: £100)' : ''}</p>
              </div>
            </div>

            <h2>🤖 AI Prompt Template</h2>
            <div class="section-card">
              <div style="padding: 1rem; background: #f6f8fa; border-radius: 6px;">
                <p class="text-muted" style="margin: 0; font-size: 0.9em;">
                  <strong>Prompt template location:</strong> <code>prompt-template.txt</code> in project root
                </p>
                <p class="text-muted" style="margin: 0.5rem 0 0 0; font-size: 0.85em;">
                  Edit this file to customize how the AI analyzes your spending. Available placeholders:
                  <code>{{totalSpend}}</code>, <code>{{weeklyAllowance}}</code>, <code>{{monthlyAllowance}}</code>,
                  <code>{{transactionCount}}</code>, <code>{{largeTransactionLimit}}</code>, <code>{{largePurchaseCount}}</code>, <code>{{transactionsSummary}}</code>
                </p>
              </div>
            </div>
          </div>

          <!-- Manual Test Emails -->
          ${emailConfigured && aiConfigured ? `
          <h2>✉️ Send Test Email</h2>
          <div class="info-box">
            Test your email alerts manually without waiting for the scheduled time.
          </div>
          <div class="actions">
            <form method="POST" action="/send-alert/weekly" style="display: inline;">
              <button type="submit" class="button-secondary">📅 Send Weekly Summary Now</button>
            </form>
            <form method="POST" action="/send-alert/monthly" style="display: inline;">
              <button type="submit" class="button-secondary">📊 Send Monthly Summary Now</button>
            </form>
          </div>
          ` : `
          <h2>✉️ Manual Email Alerts</h2>
          <div class="warning-box">
            Configure OpenAI API and SMTP settings in .env to enable manual email testing.
          </div>
          `}
        </div>
      </main>

      ${renderFooter()}
    </body>
    </html>
  `;
}

// Export modern version (replaces enhanced)
export { renderEnhancedTransactionsPage } from "./ui_enhanced";
