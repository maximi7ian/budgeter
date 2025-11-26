/**
 * HTML rendering helpers - Modern UI Design
 * Clean, intuitive interface for TrueLayer + Google Sheets budgeting app
 */

import { AccountSummary, TransactionOutput } from "./types";
import { ConnectionInfo } from "./data";
import { MODAL_CSS, renderCustomReportModal } from "./ui_modal";

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

  ${MODAL_CSS}
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
// Helper function to get provider emoji/icon
function getProviderIcon(provider: string): string {
  const p = provider.toLowerCase();
  if (p.includes('monzo')) return '🏦';
  if (p.includes('amex') || p.includes('american express')) return '💳';
  if (p.includes('nationwide')) return '🏛️';
  if (p.includes('hsbc')) return '🏦';
  if (p.includes('barclays')) return '🏦';
  if (p.includes('lloyds')) return '🐴';
  if (p.includes('natwest')) return '🏦';
  if (p.includes('santander')) return '🔴';
  if (p.includes('revolut')) return '💎';
  if (p.includes('starling')) return '⭐';
  return '🏦'; // Default bank icon
}

// Helper function to get account type badge class
function getAccountTypeBadge(kind: string, displayName: string): { emoji: string; label: string; color: string } {
  if (kind === 'card') {
    return { emoji: '💳', label: 'Card', color: '#f59e0b' };
  }
  const name = displayName.toLowerCase();
  if (name.includes('current')) return { emoji: '💵', label: 'Current', color: '#0ea5e9' };
  if (name.includes('savings')) return { emoji: '💰', label: 'Savings', color: '#10b981' };
  if (name.includes('credit')) return { emoji: '💳', label: 'Credit', color: '#f59e0b' };
  return { emoji: '🏦', label: 'Account', color: '#0ea5e9' };
}

export function renderHomePage(
  accounts: AccountSummary[] | null,
  error?: string,
  connections?: ConnectionInfo[]
): string {
  const isConnected = accounts !== null && accounts.length > 0;

  // Build account cards HTML
  let accountCardsHtml = "";
  if (error) {
    accountCardsHtml = `
      <div class="home-error">
        <div class="error-icon">⚠️</div>
        <div>
          <div class="error-title">Connection Error</div>
          <div class="error-message">${error}</div>
        </div>
      </div>
    `;
  } else if (isConnected && connections && connections.length > 0) {
    accountCardsHtml = connections.map((conn) => {
      const providerIcon = getProviderIcon(conn.providers[0] || '');
      const itemsHtml = conn.items.map((item) => {
        const typeBadge = getAccountTypeBadge(item.kind, item.display_name);
        return `
          <div class="account-item">
            <div class="account-item-icon">${typeBadge.emoji}</div>
            <div class="account-item-details">
              <div class="account-item-name">${item.display_name}</div>
              <div class="account-item-meta">
                <span class="account-type-badge" style="background: ${typeBadge.color}20; color: ${typeBadge.color};">
                  ${typeBadge.label}
                </span>
                <span class="account-currency">${item.currency}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="provider-card">
          <div class="provider-header">
            <div class="provider-info">
              <div class="provider-icon">${providerIcon}</div>
              <div>
                <div class="provider-name">${conn.providers.join(", ")}</div>
                <div class="provider-meta">${conn.items.length} ${conn.items.length === 1 ? 'account' : 'accounts'}</div>
              </div>
            </div>
            <form method="POST" action="/disconnect/${conn.tokenFileName}" style="margin: 0;"
                  onsubmit="return confirm('Disconnect ${conn.providers.join(", ")}? This will remove all associated accounts.');">
              <button type="submit" class="disconnect-btn">
                <span>✕</span>
              </button>
            </form>
          </div>
          <div class="account-list">
            ${itemsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Budgeter - Home</title>
      <style>
        ${CSS}

        /* Dark theme for home page - Tighter, more compact */
        body {
          background: #0a0e27;
          background-image:
            radial-gradient(at 20% 30%, rgba(14, 165, 233, 0.08) 0px, transparent 50%),
            radial-gradient(at 80% 70%, rgba(59, 130, 246, 0.06) 0px, transparent 50%);
        }

        main {
          max-width: 1000px;
          margin: 0 auto;
          padding: 1.5rem 1rem;
        }

        .hero-section {
          text-align: center;
          padding: 1.5rem 1rem;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 1.75rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .section-title {
          color: #cbd5e1;
          font-size: 0.95rem;
          font-weight: 700;
          margin: 1.25rem 0 0.75rem 0;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .provider-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 8px;
          padding: 0.875rem;
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
        }

        .provider-card:hover {
          border-color: rgba(14, 165, 233, 0.3);
          box-shadow: 0 4px 16px rgba(14, 165, 233, 0.08);
        }

        .provider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.625rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .provider-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .provider-icon {
          font-size: 1.5rem;
          filter: drop-shadow(0 0 6px rgba(14, 165, 233, 0.3));
        }

        .provider-name {
          color: #e2e8f0;
          font-size: 0.9rem;
          font-weight: 700;
        }

        .provider-meta {
          color: #64748b;
          font-size: 0.75rem;
        }

        .disconnect-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 0.3rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          line-height: 1;
        }

        .disconnect-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
          transform: scale(1.05);
        }

        .account-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.5rem;
        }

        .account-item {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.08);
          border-radius: 6px;
          padding: 0.625rem 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .account-item:hover {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(14, 165, 233, 0.2);
        }

        .account-item-icon {
          font-size: 1.4rem;
          filter: drop-shadow(0 0 4px rgba(14, 165, 233, 0.2));
        }

        .account-item-details {
          flex: 1;
          min-width: 0;
        }

        .account-item-name {
          color: #e2e8f0;
          font-weight: 600;
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .account-item-meta {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          flex-wrap: wrap;
        }

        .account-type-badge {
          padding: 0.15rem 0.4rem;
          border-radius: 3px;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .account-currency {
          color: #64748b;
          font-size: 0.65rem;
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          background: rgba(15, 23, 42, 0.4);
          border: 2px dashed rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          margin: 1.5rem 0;
        }

        .empty-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          filter: grayscale(0.5) opacity(0.5);
        }

        .empty-title {
          color: #e2e8f0;
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 0.6rem;
        }

        .empty-message {
          color: #94a3b8;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          max-width: 450px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.5;
        }

        .cta-button {
          display: inline-block;
          padding: 0.875rem 1.75rem;
          background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #10b981 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(14, 165, 233, 0.3);
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(14, 165, 233, 0.4);
        }

        .action-section {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1.25rem;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.625rem;
          margin-top: 0.75rem;
        }

        .action-card {
          display: block;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 6px;
          padding: 0.875rem;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .action-card:hover {
          border-color: rgba(14, 165, 233, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(14, 165, 233, 0.15);
        }

        .action-card-icon {
          font-size: 1.6rem;
          margin-bottom: 0.5rem;
        }

        .action-card-title {
          color: #e2e8f0;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.3rem;
        }

        .action-card-desc {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .home-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: start;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .error-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .error-title {
          color: #fca5a5;
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .error-message {
          color: #fca5a5;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .account-list {
            grid-template-columns: 1fr;
          }

          .provider-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      </style>
    </head>
    <body>
      ${renderHeader("home")}

      <main>
        <div class="hero-section">
          <h1 class="hero-title">💰 Budgeter</h1>
          <p class="hero-subtitle">Track your finances, analyze spending, and stay on budget</p>
        </div>

        ${
          !isConnected
            ? `
          <div class="empty-state">
            <div class="empty-icon">🏦</div>
            <h2 class="empty-title">No Accounts Connected</h2>
            <p class="empty-message">
              Connect your bank accounts and credit cards securely through TrueLayer to start tracking your transactions and managing your budget.
            </p>
            <a href="/link" class="cta-button">
              🔗 Connect Your First Account
            </a>
          </div>

          <div class="action-section">
            <h3 style="color: #cbd5e1; font-size: 1.25rem; margin: 0 0 0.5rem 0;">How It Works</h3>
            <p style="color: #94a3b8; margin: 0 0 1.5rem 0;">Get started in 3 easy steps</p>
            <div class="action-grid">
              <div class="action-card" style="pointer-events: none;">
                <div class="action-card-icon">🔐</div>
                <div class="action-card-title">1. Secure Connection</div>
                <div class="action-card-desc">Authorize TrueLayer to securely access your banks</div>
              </div>
              <div class="action-card" style="pointer-events: none;">
                <div class="action-card-icon">📊</div>
                <div class="action-card-title">2. Fetch Transactions</div>
                <div class="action-card-desc">Retrieve weekly or monthly transaction data</div>
              </div>
              <div class="action-card" style="pointer-events: none;">
                <div class="action-card-icon">💡</div>
                <div class="action-card-title">3. Analyze & Budget</div>
                <div class="action-card-desc">Get AI-powered insights and stay on track</div>
              </div>
            </div>
          </div>
        `
            : `
          <div>
            <h2 class="section-title">
              <span>💳</span>
              <span>Connected Accounts</span>
            </h2>
            ${accountCardsHtml}
          </div>

          <div class="action-section">
            <h3 style="color: #cbd5e1; font-size: 1.25rem; margin: 0 0 0.5rem 0;">What's Next?</h3>
            <p style="color: #94a3b8; margin: 0 0 1.5rem 0;">View transactions or connect more accounts</p>
            <div class="action-grid">
              <a href="/transactions?window=weekly" class="action-card">
                <div class="action-card-icon">📅</div>
                <div class="action-card-title">Last 7 Days</div>
                <div class="action-card-desc">View your weekly transactions</div>
              </a>
              <a href="/transactions?window=monthly" class="action-card">
                <div class="action-card-icon">📊</div>
                <div class="action-card-title">Last Month</div>
                <div class="action-card-desc">View your monthly transactions</div>
              </a>
              <a href="#" class="action-card" onclick="openCustomReportModal(); return false;">
                <div class="action-card-icon">📋</div>
                <div class="action-card-title">Custom Report</div>
                <div class="action-card-desc">Choose your own date range</div>
              </a>
              <a href="/link" class="action-card">
                <div class="action-card-icon">➕</div>
                <div class="action-card-title">Add More</div>
                <div class="action-card-desc">Connect additional accounts</div>
              </a>
            </div>
          </div>
        `
        }
      </main>

      ${renderCustomReportModal()}

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
      <title>Login - Budgeter</title>
      <style>
        ${CSS}

        /* Login page specific styles - Dark theme with neon accents */
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0e27;
          background-image:
            radial-gradient(at 20% 30%, rgba(14, 165, 233, 0.15) 0px, transparent 50%),
            radial-gradient(at 80% 70%, rgba(59, 130, 246, 0.12) 0px, transparent 50%),
            radial-gradient(at 40% 80%, rgba(16, 185, 129, 0.1) 0px, transparent 50%);
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 30%, rgba(14, 165, 233, 0.03) 50%, transparent 70%);
          animation: shimmer 15s infinite linear;
          pointer-events: none;
        }

        @keyframes shimmer {
          0% { transform: translateX(-50%) translateY(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) translateY(-50%) rotate(360deg); }
        }

        .login-card {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 20px;
          box-shadow:
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(14, 165, 233, 0.1),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
          padding: 3rem 2.5rem;
          width: 100%;
          max-width: 420px;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          z-index: 1;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .login-logo {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .login-logo-icon {
          font-size: 4.5rem;
          line-height: 1;
          margin-bottom: 1rem;
          display: inline-block;
          filter: drop-shadow(0 0 20px rgba(14, 165, 233, 0.5));
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .login-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem 0;
          text-align: center;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          text-align: center;
          margin: 0 0 2rem 0;
        }

        .login-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 1rem 1.25rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          backdrop-filter: blur(10px);
        }

        .login-error::before {
          content: "⚠️";
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #cbd5e1;
          font-size: 0.9rem;
          letter-spacing: 0.01em;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: rgba(15, 23, 42, 0.5);
          color: #e2e8f0;
          box-sizing: border-box;
        }

        .form-input::placeholder {
          color: #64748b;
        }

        .form-input:focus {
          outline: none;
          border-color: #0ea5e9;
          background: rgba(15, 23, 42, 0.8);
          box-shadow:
            0 0 0 3px rgba(14, 165, 233, 0.1),
            0 0 20px rgba(14, 165, 233, 0.2);
        }

        .login-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #10b981 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          font-size: 0.9rem;
          box-shadow: 0 10px 30px rgba(14, 165, 233, 0.3);
          position: relative;
          overflow: hidden;
        }

        .login-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .login-button:hover::before {
          left: 100%;
        }

        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(14, 165, 233, 0.4);
        }

        .login-button:active {
          transform: translateY(0);
        }

        @media (max-width: 500px) {
          .login-card {
            padding: 2rem 1.5rem;
          }

          .login-logo-icon {
            font-size: 3.5rem;
          }

          .login-title {
            font-size: 1.75rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <div class="login-card">
          <div class="login-logo">
            <div class="login-logo-icon">💰</div>
            <h1 class="login-title">Budgeter</h1>
            <p class="login-subtitle">Manage your finances with confidence</p>
          </div>

          ${error ? `<div class="login-error">${error}</div>` : ""}

          <form method="POST" action="/login">
            <div class="form-group">
              <label for="email" class="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                class="form-input"
                placeholder="you@example.com"
                required
                autofocus
              >
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                class="form-input"
                placeholder="Enter your password"
                required
              >
            </div>

            <button type="submit" class="login-button">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Render settings page
 */
export function renderSettingsPage(success?: string, error?: string): string {
  const { isEmailConfigured } = require('./email');
  const aiConfigured = !!process.env.OPENAI_API_KEY;
  const emailConfigured = isEmailConfigured();

  // Determine which email method is configured
  const gmailOAuth = !!(process.env.GMAIL_USER && process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN);
  const basicSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
  const emailMethod = gmailOAuth ? 'Gmail OAuth2' : basicSMTP ? 'Basic SMTP' : null;

  // Get cron schedules from env
  const weeklySchedule = process.env.WEEKLY_CRON_SCHEDULE;
  const monthlySchedule = process.env.MONTHLY_CRON_SCHEDULE;

  // Get budget settings from env
  const { getWeeklyAllowance, getMonthlyAllowance, getLargeTransactionThreshold } = require('./config');
  const weeklyAllowance = getWeeklyAllowance();
  const monthlyAllowance = getMonthlyAllowance();
  const largeTransactionThreshold = getLargeTransactionThreshold();

  // Get alert recipients
  const alertRecipients = process.env.ALERT_EMAIL_TO
    ? process.env.ALERT_EMAIL_TO.split(',').map((e: string) => e.trim())
    : [];

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
      <title>Settings - Budgeter</title>
      <style>
        ${CSS}

        /* Settings page specific styles - Dark theme */
        .settings-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.5rem 1rem;
        }

        .settings-hero {
          text-align: center;
          padding: 2rem 1rem 1.5rem;
          margin-bottom: 2rem;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(14, 165, 233, 0.08);
        }

        .settings-hero h1 {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
        }

        .settings-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          margin: 0;
        }

        .settings-section {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 16px rgba(14, 165, 233, 0.08);
        }

        .settings-section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .settings-section-icon {
          font-size: 1.75rem;
          filter: drop-shadow(0 0 8px rgba(14, 165, 233, 0.3));
        }

        .settings-section h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0;
          flex: 1;
        }

        .settings-section h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #cbd5e1;
          margin: 0 0 1rem 0;
        }

        .status-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.08);
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .status-card:last-child {
          margin-bottom: 0;
        }

        .status-icon-large {
          font-size: 2.5rem;
          flex-shrink: 0;
          line-height: 1;
        }

        .status-icon-large.success {
          filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.6));
        }

        .status-icon-large.danger {
          filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.6));
        }

        .status-content {
          flex: 1;
          min-width: 0;
        }

        .status-title {
          font-size: 1rem;
          font-weight: 700;
          color: #e2e8f0;
          margin-bottom: 0.25rem;
        }

        .status-badge-large {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.875rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .status-badge-large.success {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-badge-large.danger {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .status-badge-large.warning {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .status-description {
          color: #94a3b8;
          font-size: 0.85rem;
          line-height: 1.5;
          margin: 0;
        }

        .status-description code {
          background: rgba(15, 23, 42, 0.6);
          color: #0ea5e9;
          padding: 0.125rem 0.375rem;
          border-radius: 3px;
          font-size: 0.8rem;
        }

        .status-description a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .status-description a:hover {
          color: #60a5fa;
        }

        .setting-item {
          padding: 1.25rem;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.08);
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .setting-item:last-child {
          margin-bottom: 0;
        }

        .setting-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .setting-label-text {
          font-size: 0.9rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        .setting-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0ea5e9;
          margin-bottom: 0.5rem;
        }

        .setting-hint {
          color: #64748b;
          font-size: 0.8rem;
          line-height: 1.5;
        }

        .setting-hint code {
          background: rgba(15, 23, 42, 0.6);
          color: #94a3b8;
          padding: 0.125rem 0.375rem;
          border-radius: 3px;
          font-size: 0.75rem;
        }

        .email-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .email-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(14, 165, 233, 0.1);
          border: 1px solid rgba(14, 165, 233, 0.3);
          border-radius: 6px;
          color: #0ea5e9;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .test-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .test-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #10b981 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .test-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(14, 165, 233, 0.4);
        }

        @media (max-width: 768px) {
          .settings-hero h1 {
            font-size: 1.5rem;
          }

          .status-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      ${renderHeader("settings", true)}

      <main class="settings-container">
        <!-- Hero Section -->
        <div class="settings-hero">
          <h1>⚙️ Settings</h1>
          <p class="settings-subtitle">Manage your budget alerts, configurations, and preferences</p>
        </div>

        ${success ? `<div class="success-box" style="margin-bottom: 1.5rem;">${success}</div>` : ""}
        ${error ? `<div class="error-box" style="margin-bottom: 1.5rem;">${error}</div>` : ""}

        <!-- System Status Section -->
        <section class="settings-section">
          <div class="settings-section-header">
            <span class="settings-section-icon">🔌</span>
            <h2>System Status</h2>
          </div>

          <!-- AI Configuration Status -->
          <div class="status-card">
            <div class="status-icon-large ${aiConfigured ? 'success' : 'danger'}">
              ${aiConfigured ? '✅' : '❌'}
            </div>
            <div class="status-content">
              <div class="status-title">OpenAI API</div>
              <div class="status-badge-large ${aiConfigured ? 'success' : 'danger'}">
                ${aiConfigured ? '✓ Configured' : '✕ Not Configured'}
              </div>
              <p class="status-description">
                ${aiConfigured
                  ? 'AI-powered budget insights and spending analysis are enabled.'
                  : 'Set <code>OPENAI_API_KEY</code> in your .env file to enable AI-powered budget summaries and intelligent spending analysis.'}
              </p>
            </div>
          </div>

          <!-- Email Configuration Status -->
          <div class="status-card">
            <div class="status-icon-large ${emailConfigured ? 'success' : 'danger'}">
              ${emailConfigured ? '✅' : '❌'}
            </div>
            <div class="status-content">
              <div class="status-title">Email Service</div>
              <div class="status-badge-large ${emailConfigured ? 'success' : 'danger'}">
                ${emailConfigured ? `✓ ${emailMethod}` : '✕ Not Configured'}
              </div>
              <p class="status-description">
                ${emailConfigured
                  ? `Email alerts are enabled using ${emailMethod}${gmailOAuth ? ' (recommended for Gmail users)' : ''}.`
                  : 'Configure email to receive automated budget alerts. Choose Gmail OAuth2 (recommended) or Basic SMTP. <a href="https://github.com/maximi7ian/budgeter/blob/main/scripts/setup-gmail-oauth.md" target="_blank">View Gmail Setup Guide →</a>'}
              </p>
            </div>
          </div>
        </section>

        <!-- Budget Settings Section -->
        <section class="settings-section">
          <div class="settings-section-header">
            <span class="settings-section-icon">💰</span>
            <h2>Budget Settings</h2>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-label-text">📅 Weekly Allowance</span>
              <span class="status-badge-large ${process.env.WEEKLY_ALLOWANCE ? 'success' : 'warning'}">
                ${process.env.WEEKLY_ALLOWANCE ? '✓ Custom' : 'Default'}
              </span>
            </div>
            <div class="setting-value">£${weeklyAllowance.toFixed(2)}</div>
            <div class="setting-hint">
              ${process.env.WEEKLY_ALLOWANCE
                ? `Change this value by updating <code>WEEKLY_ALLOWANCE</code> in your .env file.`
                : `Using default value. Set <code>WEEKLY_ALLOWANCE</code> in .env to customize (e.g., <code>WEEKLY_ALLOWANCE=150</code>).`}
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-label-text">📊 Monthly Allowance</span>
              <span class="status-badge-large ${process.env.MONTHLY_ALLOWANCE ? 'success' : 'warning'}">
                ${process.env.MONTHLY_ALLOWANCE ? '✓ Custom' : 'Auto (4× Weekly)'}
              </span>
            </div>
            <div class="setting-value">£${monthlyAllowance.toFixed(2)}</div>
            <div class="setting-hint">
              ${process.env.MONTHLY_ALLOWANCE
                ? `Change this value by updating <code>MONTHLY_ALLOWANCE</code> in your .env file.`
                : `Automatically calculated as 4× your weekly allowance. Set <code>MONTHLY_ALLOWANCE</code> in .env to use a custom value.`}
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-label-text">🔔 Large Transaction Threshold</span>
              <span class="status-badge-large ${process.env.LARGE_TRANSACTION_THRESHOLD ? 'success' : 'warning'}">
                ${process.env.LARGE_TRANSACTION_THRESHOLD ? '✓ Custom' : 'Default'}
              </span>
            </div>
            <div class="setting-value">£${largeTransactionThreshold.toFixed(2)}</div>
            <div class="setting-hint">
              Transactions above this amount are excluded from budget calculations (e.g., rent, mortgage).
              ${process.env.LARGE_TRANSACTION_THRESHOLD
                ? `Update <code>LARGE_TRANSACTION_THRESHOLD</code> in .env to change.`
                : `Using default. Set <code>LARGE_TRANSACTION_THRESHOLD</code> in .env to customize.`}
            </div>
          </div>
        </section>

        <!-- Email Alert Settings Section -->
        <section class="settings-section">
          <div class="settings-section-header">
            <span class="settings-section-icon">📧</span>
            <h2>Email Alerts</h2>
          </div>

          <h3>Alert Recipients</h3>
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-label-text">📬 Recipient Addresses</span>
              <span class="status-badge-large ${alertRecipients.length > 0 ? 'success' : 'warning'}">
                ${alertRecipients.length > 0 ? `✓ ${alertRecipients.length} Recipient${alertRecipients.length !== 1 ? 's' : ''}` : 'Not Set'}
              </span>
            </div>
            ${alertRecipients.length > 0 ? `
              <div class="email-list">
                ${alertRecipients.map(email => `<div class="email-chip">📧 ${email}</div>`).join('')}
              </div>
              <div class="setting-hint">
                Update <code>ALERT_EMAIL_TO</code> in .env to change recipients (comma-separated for multiple).
              </div>
            ` : `
              <div class="setting-hint">
                Set <code>ALERT_EMAIL_TO</code> in your .env file to receive email alerts.<br>
                Example: <code>ALERT_EMAIL_TO=you@email.com</code> or <code>ALERT_EMAIL_TO=email1@example.com,email2@example.com</code>
              </div>
            `}
          </div>

          <h3>Scheduled Alerts</h3>
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-label-text">📅 Weekly Email Schedule</span>
              <span class="status-badge-large ${weeklySchedule ? 'success' : 'warning'}">
                ${weeklySchedule ? '✓ Enabled' : 'Disabled'}
              </span>
            </div>
            ${weeklySchedule ? `
              <div class="setting-value" style="font-size: 1.1rem;">${weeklyScheduleText}</div>
              <div class="setting-hint">
                Update <code>WEEKLY_CRON_SCHEDULE</code> in .env to change the schedule.
              </div>
            ` : `
              <div class="setting-hint">
                Enable weekly alerts by setting <code>WEEKLY_CRON_SCHEDULE</code> in .env<br>
                Example: <code>WEEKLY_CRON_SCHEDULE=0 9 * * 1</code> (Every Monday at 9:00 AM)
              </div>
            `}
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-label-text">📊 Monthly Email Schedule</span>
              <span class="status-badge-large ${monthlySchedule ? 'success' : 'warning'}">
                ${monthlySchedule ? '✓ Enabled' : 'Disabled'}
              </span>
            </div>
            ${monthlySchedule ? `
              <div class="setting-value" style="font-size: 1.1rem;">${monthlyScheduleText}</div>
              <div class="setting-hint">
                Update <code>MONTHLY_CRON_SCHEDULE</code> in .env to change the schedule.
              </div>
            ` : `
              <div class="setting-hint">
                Enable monthly alerts by setting <code>MONTHLY_CRON_SCHEDULE</code> in .env<br>
                Example: <code>MONTHLY_CRON_SCHEDULE=0 9 1 * *</code> (1st of each month at 9:00 AM)
              </div>
            `}
          </div>
        </section>

        <!-- AI Configuration Section -->
        <section class="settings-section">
          <div class="settings-section-header">
            <span class="settings-section-icon">🤖</span>
            <h2>AI Configuration</h2>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-label-text">📝 Prompt Template</span>
            </div>
            <div class="setting-hint">
              Customize how AI analyzes your spending by editing <code>prompt-template.txt</code> in the project root.<br><br>
              <strong>Available placeholders:</strong> <code>{{"{{"}}totalSpend{{"}}"}}</code>, <code>{{"{{"}}weeklyAllowance{{"}}"}}</code>,
              <code>{{"{{"}}monthlyAllowance{{"}}"}}</code>, <code>{{"{{"}}transactionCount{{"}}"}}</code>,
              <code>{{"{{"}}largeTransactionLimit{{"}}"}}</code>, <code>{{"{{"}}largePurchaseCount{{"}}"}}</code>,
              <code>{{"{{"}}transactionsSummary{{"}}"}}</code>
            </div>
          </div>
        </section>

        <!-- Test Email Section -->
        ${emailConfigured ? `
        <section class="settings-section">
          <div class="settings-section-header">
            <span class="settings-section-icon">✉️</span>
            <h2>Send Test Emails</h2>
          </div>

          <p class="status-description" style="margin-bottom: 1rem;">
            Test your email configuration by sending a budget summary manually.
            ${!aiConfigured ? '<br><strong>Note:</strong> Without OpenAI configured, emails will use basic fallback insights.' : ''}
          </p>

          <div class="test-buttons">
            <form method="POST" action="/send-alert/weekly" style="display: inline;">
              <button type="submit" class="test-button">
                <span>📅</span>
                <span>Send Weekly Summary</span>
              </button>
            </form>
            <form method="POST" action="/send-alert/monthly" style="display: inline;">
              <button type="submit" class="test-button">
                <span>📊</span>
                <span>Send Monthly Summary</span>
              </button>
            </form>
          </div>
        </section>
        ` : `
        <section class="settings-section">
          <div class="settings-section-header">
            <span class="settings-section-icon">✉️</span>
            <h2>Email Testing</h2>
          </div>

          <div class="status-card">
            <div class="status-icon-large warning">⚠️</div>
            <div class="status-content">
              <div class="status-title">Email Not Configured</div>
              <p class="status-description">
                Configure email settings (Gmail OAuth2 or SMTP) in your .env file to enable manual email testing.
                ${aiConfigured ? '<br><strong>Note:</strong> OpenAI is configured but email is not. Set up email to send budget summaries.' : ''}
              </p>
            </div>
          </div>
        </section>
        `}
      </main>

      ${renderFooter()}
    </body>
    </html>
  `;
}

// Export modern version (replaces enhanced)
export { renderEnhancedTransactionsPage } from "./ui_enhanced";
