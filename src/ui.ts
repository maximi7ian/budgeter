/**
 * HTML rendering helpers - Modern UI Design
 * Clean, intuitive interface for TrueLayer + Google Sheets budgeting app
 */

import { AccountSummary, TransactionOutput } from "./types";
import { ConnectionInfo } from "./data";
import { generateBaseCSS, renderHeader, renderFooter, COLORS, SPACING, BORDER_RADIUS, FONTS } from "./ui/design-system";
import { renderCustomReportModal } from "./ui_modal";
import { isAccountExcluded } from "./config";

// Import and re-export enhanced transactions page
import { renderEnhancedTransactionsPage } from "./ui_enhanced";
export { renderEnhancedTransactionsPage };

/**
 * Helper function to get provider emoji/icon
 */
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

/**
 * Helper function to get account type badge class
 */
function getAccountTypeBadge(kind: string, displayName: string): { emoji: string; label: string; color: string } {
  if (kind === 'card') {
    return { emoji: '💳', label: 'Card', color: COLORS.warning };
  }
  const name = displayName.toLowerCase();
  if (name.includes('current')) return { emoji: '💵', label: 'Current', color: COLORS.info };
  if (name.includes('savings')) return { emoji: '💰', label: 'Savings', color: COLORS.success };
  if (name.includes('credit')) return { emoji: '💳', label: 'Credit', color: COLORS.warning };
  return { emoji: '🏦', label: 'Account', color: COLORS.info };
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

  // Build account cards HTML
  let accountCardsHtml = "";
  if (error) {
    accountCardsHtml = `
      <div class="glass-card" style="border-left: 4px solid ${COLORS.danger}; display: flex; gap: ${SPACING.md}; align-items: flex-start;">
        <div style="font-size: 2rem;">⚠️</div>
        <div>
          <h3 style="color: ${COLORS.danger}; margin: 0 0 ${SPACING.xs} 0;">Connection Error</h3>
          <p style="color: ${COLORS.text.muted}; margin: 0;">${error}</p>
        </div>
      </div>
    `;
  } else if (isConnected && connections && connections.length > 0) {
    accountCardsHtml = connections.map((conn) => {
      const providerIcon = getProviderIcon(conn.providers[0] || '');
      const itemsHtml = conn.items.map((item) => {
        const typeBadge = getAccountTypeBadge(item.kind, item.display_name);
        // Get the ID (account_id or card_id)
        const itemId = item.kind === 'account'
          ? (item as any).account_id
          : (item as any).card_id;

        // Check if this account is excluded
        const isExcluded = isAccountExcluded(itemId);

        return `
          <div style="
            background: ${isExcluded ? 'rgba(15, 23, 42, 0.2)' : 'rgba(15, 23, 42, 0.4)'};
            border: 1px solid ${isExcluded ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.05)'};
            border-radius: ${BORDER_RADIUS.md};
            padding: ${SPACING.sm} ${SPACING.md};
            display: flex;
            flex-direction: column;
            gap: ${SPACING.xs};
            transition: all 0.2s;
            opacity: ${isExcluded ? '0.6' : '1'};
            position: relative;
          ">
            ${isExcluded ? `
              <div style="
                position: absolute;
                top: ${SPACING.xs};
                right: ${SPACING.xs};
                background: ${COLORS.danger}20;
                color: ${COLORS.danger};
                padding: 0.15rem 0.4rem;
                border-radius: ${BORDER_RADIUS.sm};
                font-size: 0.65rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">🚫 Excluded</div>
            ` : ''}
            <div style="display: flex; align-items: center; gap: ${SPACING.sm};">
              <div style="font-size: 1.25rem; ${isExcluded ? 'filter: grayscale(50%);' : ''}">${typeBadge.emoji}</div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${item.display_name}
                </div>
                <div style="display: flex; gap: ${SPACING.xs}; align-items: center; flex-wrap: wrap;">
                  <span class="badge" style="background: ${typeBadge.color}20; color: ${typeBadge.color}; font-size: 0.7rem;">
                    ${typeBadge.label}
                  </span>
                  <span style="font-size: 0.75rem; color: ${COLORS.text.muted};">${item.currency}</span>
                  ${isExcluded ? `
                    <span style="font-size: 0.7rem; color: ${COLORS.danger}; font-style: italic;">
                      Not in budget
                    </span>
                  ` : ''}
                </div>
              </div>
            </div>
            <div style="
              display: flex;
              align-items: center;
              gap: ${SPACING.xs};
              background: rgba(0, 0, 0, 0.2);
              padding: ${SPACING.xs} ${SPACING.sm};
              border-radius: ${BORDER_RADIUS.sm};
              font-family: 'Monaco', 'Courier New', monospace;
              font-size: 0.7rem;
            ">
              <span style="color: ${COLORS.text.muted}; flex-shrink: 0;">ID:</span>
              <code style="
                color: ${COLORS.info};
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              " title="${itemId}">${itemId}</code>
              <button
                onclick="navigator.clipboard.writeText('${itemId}').then(() => {
                  const btn = event.target;
                  const originalText = btn.textContent;
                  btn.textContent = '✓';
                  btn.style.color = '${COLORS.success}';
                  setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.color = '${COLORS.text.muted}';
                  }, 1500);
                });"
                style="
                  background: transparent;
                  border: none;
                  color: ${COLORS.text.muted};
                  cursor: pointer;
                  padding: 0;
                  font-size: 0.8rem;
                  transition: color 0.2s;
                  flex-shrink: 0;
                "
                title="Copy ID to clipboard"
              >📋</button>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="glass-card" style="margin-bottom: ${SPACING.md}; padding: ${SPACING.md};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${SPACING.md}; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: ${SPACING.sm};">
            <div style="display: flex; align-items: center; gap: ${SPACING.sm};">
              <div style="font-size: 1.5rem;">${providerIcon}</div>
              <div>
                <div style="font-weight: 700;">${conn.providers.join(", ")}</div>
                <div style="font-size: 0.8rem; color: ${COLORS.text.muted};">${conn.items.length} ${conn.items.length === 1 ? 'account' : 'accounts'}</div>
              </div>
            </div>
            <form method="POST" action="/disconnect/${conn.tokenFileName}" style="margin: 0;"
                  onsubmit="return confirm('Disconnect ${conn.providers.join(", ")}? This will remove all associated accounts.');">
              <button type="submit" class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                Disconnect
              </button>
            </form>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: ${SPACING.sm};">
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
      <style>${generateBaseCSS()}</style>
    </head>
    <body>
      <div class="app-container">
        ${renderHeader("home")}

        <main>
          <div class="text-center" style="margin-bottom: ${SPACING.xl};">
            <h1 style="
              background: linear-gradient(135deg, ${COLORS.primary.light} 0%, ${COLORS.accent.light} 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: ${SPACING.sm};
            ">Finance Dashboard</h1>
            <p style="color: ${COLORS.text.muted}; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">
              Track your finances, analyze spending, and stay on budget with AI-powered insights.
            </p>
          </div>

          ${!isConnected ? `
            <div class="glass-card text-center" style="padding: ${SPACING['2xl']} ${SPACING.xl}; margin-bottom: ${SPACING.xl};">
              <div style="font-size: 4rem; margin-bottom: ${SPACING.md}; opacity: 0.8;">🏦</div>
              <h2 style="margin-bottom: ${SPACING.sm};">No Accounts Connected</h2>
              <p style="color: ${COLORS.text.muted}; margin-bottom: ${SPACING.lg}; max-width: 500px; margin-left: auto; margin-right: auto;">
                Connect your bank accounts and credit cards securely through TrueLayer to start tracking your transactions.
              </p>
              <a href="/link" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2rem;">
                🔗 Connect Your First Account
              </a>
            </div>

            <div class="glass-card">
              <h3 style="margin-bottom: ${SPACING.lg}; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: ${SPACING.sm};">
                How It Works
              </h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: ${SPACING.md};">
                <div style="background: rgba(255,255,255,0.03); padding: ${SPACING.md}; border-radius: ${BORDER_RADIUS.lg};">
                  <div style="font-size: 2rem; margin-bottom: ${SPACING.sm};">🔐</div>
                  <h4 style="margin-bottom: ${SPACING.xs};">1. Secure Connection</h4>
                  <p style="font-size: 0.9rem; color: ${COLORS.text.muted};">Authorize TrueLayer to securely access your banks</p>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: ${SPACING.md}; border-radius: ${BORDER_RADIUS.lg};">
                  <div style="font-size: 2rem; margin-bottom: ${SPACING.sm};">📊</div>
                  <h4 style="margin-bottom: ${SPACING.xs};">2. Fetch Transactions</h4>
                  <p style="font-size: 0.9rem; color: ${COLORS.text.muted};">Retrieve weekly or monthly transaction data</p>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: ${SPACING.md}; border-radius: ${BORDER_RADIUS.lg};">
                  <div style="font-size: 2rem; margin-bottom: ${SPACING.sm};">💡</div>
                  <h4 style="margin-bottom: ${SPACING.xs};">3. Analyze & Budget</h4>
                  <p style="font-size: 0.9rem; color: ${COLORS.text.muted};">Get AI-powered insights and stay on track</p>
                </div>
              </div>
            </div>
          ` : `
            <div style="margin-bottom: ${SPACING.xl};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${SPACING.md};">
                <h2 style="margin: 0;">Connected Accounts</h2>
                <a href="/link" class="btn btn-primary" style="font-size: 0.9rem;">
                  ➕ Add More
                </a>
              </div>
              ${accountCardsHtml}
            </div>

            <div class="glass-card">
              <h3 style="margin-bottom: ${SPACING.md};">Quick Actions</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: ${SPACING.md};">
                <a href="/transactions?window=weekly" class="btn btn-secondary" style="justify-content: flex-start;">
                  📅 View Weekly
                </a>
                <a href="/transactions?window=monthly" class="btn btn-secondary" style="justify-content: flex-start;">
                  📊 View Monthly
                </a>
                <button onclick="openCustomReportModal()" class="btn btn-secondary" style="justify-content: flex-start;">
                  📋 Custom Report
                </button>
                <a href="/settings" class="btn btn-secondary" style="justify-content: flex-start;">
                  ⚙️ Settings
                </a>
              </div>
            </div>
          `}
        </main>

        ${renderCustomReportModal()}

        ${renderFooter()}
      </div>
    </body>
    </html>
  `;
}

/**
 * Render transactions page (Legacy/Basic)
 */
export function renderTransactionsPage(output: TransactionOutput): string {
  // Redirect to enhanced version in practice, but keeping this for fallback
  return renderEnhancedTransactionsPage(output);
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
      <title>Error - Budgeter</title>
      <style>${generateBaseCSS()}</style>
    </head>
    <body>
      <div class="app-container">
        ${renderHeader("")}

        <main style="max-width: 600px; margin: 0 auto; text-align: center;">
          <div class="glass-card" style="border-top: 4px solid ${COLORS.danger};">
            <div style="font-size: 4rem; margin-bottom: ${SPACING.md};">❌</div>
            <h1 style="color: ${COLORS.danger}; margin-bottom: ${SPACING.sm};">Error</h1>
            <h3 style="margin-bottom: ${SPACING.md};">${message}</h3>
            ${details ? `
              <div style="background: rgba(239, 68, 68, 0.1); padding: ${SPACING.md}; border-radius: ${BORDER_RADIUS.md}; margin-bottom: ${SPACING.lg}; text-align: left;">
                <code style="color: #fca5a5; font-family: ${FONTS.mono}; font-size: 0.9rem;">${details}</code>
              </div>
            ` : ''}
            <a href="/" class="btn btn-primary">← Back to Home</a>
          </div>
        </main>

        ${renderFooter()}
      </div>
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
        ${generateBaseCSS()}
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: ${SPACING.md};
        }
      </style>
    </head>
    <body>
      <div class="login-wrapper">
        <div class="glass-card" style="width: 100%; max-width: 400px; padding: ${SPACING['2xl']};">
          <div class="text-center" style="margin-bottom: ${SPACING.xl};">
            <div style="font-size: 3rem; margin-bottom: ${SPACING.sm};">💰</div>
            <h1 style="font-size: 2rem; margin-bottom: ${SPACING.xs};">Budgeter</h1>
            <p style="color: ${COLORS.text.muted};">Sign in to manage your finances</p>
          </div>

          ${error ? `
            <div style="background: ${COLORS.dangerBg}; color: ${COLORS.danger}; padding: ${SPACING.md}; border-radius: ${BORDER_RADIUS.md}; margin-bottom: ${SPACING.lg}; display: flex; gap: ${SPACING.sm}; align-items: center;">
              <span>⚠️</span>
              <span>${error}</span>
            </div>
          ` : ''}

          <form method="POST" action="/login">
            <div class="form-group">
              <label for="email" class="form-label">Email Address</label>
              <input type="email" id="email" name="email" class="form-input" placeholder="you@example.com" required autofocus>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input type="password" id="password" name="password" class="form-input" placeholder="••••••••" required>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: ${SPACING.sm};">
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
  const env = process.env;
  // Check for Gmail OAuth2 or basic SMTP configuration
  const emailConfigured = !!(env.GMAIL_USER && env.GMAIL_CLIENT_ID && env.GMAIL_CLIENT_SECRET && env.GMAIL_REFRESH_TOKEN) || !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
  const aiConfigured = !!env.OPENAI_API_KEY;
  const sheetsConfigured = !!env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const weeklySchedule = !!env.WEEKLY_CRON_SCHEDULE;
  const monthlySchedule = !!env.MONTHLY_CRON_SCHEDULE;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Settings - Budgeter</title>
      <style>${generateBaseCSS()}</style>
    </head>
    <body>
      <div class="app-container">
        ${renderHeader("settings")}

        <main>
          <div class="text-center" style="margin-bottom: ${SPACING.xl};">
            <h1>Settings</h1>
            <p style="color: ${COLORS.text.muted};">System configuration and status</p>
          </div>

          ${success ? `
            <div class="glass-card" style="background: ${COLORS.successBg}; border-color: ${COLORS.success}; margin-bottom: ${SPACING.lg}; color: ${COLORS.success};">
              ✅ ${success}
            </div>
          ` : ''}

          ${error ? `
            <div class="glass-card" style="background: ${COLORS.dangerBg}; border-color: ${COLORS.danger}; margin-bottom: ${SPACING.lg}; color: ${COLORS.danger};">
              ❌ ${error}
            </div>
          ` : ''}

          <div class="glass-card" style="margin-bottom: ${SPACING.xl};">
            <h2 style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: ${SPACING.sm}; margin-bottom: ${SPACING.lg};">
              🔌 Integrations
            </h2>
            
            <div style="display: grid; gap: ${SPACING.md};">
              <!-- OpenAI -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding: ${SPACING.md}; background: rgba(255,255,255,0.03); border-radius: ${BORDER_RADIUS.lg};">
                <div style="display: flex; align-items: center; gap: ${SPACING.md};">
                  <div style="font-size: 1.5rem;">🤖</div>
                  <div>
                    <div style="font-weight: 600;">OpenAI (AI Insights)</div>
                    <div style="font-size: 0.8rem; color: ${COLORS.text.muted};">Required for spending analysis</div>
                  </div>
                </div>
                <span class="badge ${aiConfigured ? 'badge-success' : 'badge-warning'}">
                  ${aiConfigured ? 'Active' : 'Missing API Key'}
                </span>
              </div>

              <!-- Google Sheets -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding: ${SPACING.md}; background: rgba(255,255,255,0.03); border-radius: ${BORDER_RADIUS.lg};">
                <div style="display: flex; align-items: center; gap: ${SPACING.md};">
                  <div style="font-size: 1.5rem;">📊</div>
                  <div>
                    <div style="font-weight: 600;">Google Sheets</div>
                    <div style="font-size: 0.8rem; color: ${COLORS.text.muted};">For excluded expenses</div>
                  </div>
                </div>
                <span class="badge ${sheetsConfigured ? 'badge-success' : 'badge-warning'}">
                  ${sheetsConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>

              <!-- Email -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding: ${SPACING.md}; background: rgba(255,255,255,0.03); border-radius: ${BORDER_RADIUS.lg};">
                <div style="display: flex; align-items: center; gap: ${SPACING.md};">
                  <div style="font-size: 1.5rem;">✉️</div>
                  <div>
                    <div style="font-weight: 600;">Email Service</div>
                    <div style="font-size: 0.8rem; color: ${COLORS.text.muted};">For sending reports</div>
                  </div>
                </div>
                <span class="badge ${emailConfigured ? 'badge-success' : 'badge-warning'}">
                  ${emailConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>
          </div>

          <div class="glass-card">
            <h2 style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: ${SPACING.sm}; margin-bottom: ${SPACING.lg};">
              🧪 Test Actions
            </h2>
            
            <p style="color: ${COLORS.text.muted}; margin-bottom: ${SPACING.md};">
              Manually trigger reports to test your configuration.
            </p>

            <div style="display: flex; gap: ${SPACING.md}; flex-wrap: wrap;">
              <form method="POST" action="/send-alert/weekly">
                <button type="submit" class="btn btn-secondary" ${!emailConfigured ? 'disabled' : ''}>
                  📅 Send Weekly Report
                </button>
              </form>
              <form method="POST" action="/send-alert/monthly">
                <button type="submit" class="btn btn-secondary" ${!emailConfigured ? 'disabled' : ''}>
                  📊 Send Monthly Report
                </button>
              </form>
            </div>
          </div>
        </main>

        ${renderFooter()}
      </div>
    </body>
    </html>
  `;
}
