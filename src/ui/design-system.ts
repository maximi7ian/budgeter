/**
 * Modern Design System for Budgeter App
 * Reusable components and design tokens
 */

export const COLORS = {
  // Primary gradient
  primary: {
    start: '#6366f1',
    end: '#8b5cf6',
    light: '#a78bfa',
    dark: '#4c1d95',
  },
  // Semantic colors
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  // Neutrals
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // Background
  background: '#f8fafc',
  white: '#ffffff',
};

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  glow: '0 0 20px rgba(99, 102, 241, 0.3)',
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

export const BORDER_RADIUS = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const FONTS = {
  sans: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", "Droid Sans Mono", "Source Code Pro", monospace',
};

/**
 * Generate base CSS with design tokens
 */
export function generateBaseCSS(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${FONTS.sans};
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      background-attachment: fixed;
      min-height: 100vh;
      color: ${COLORS.gray[900]};
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .app-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: ${SPACING.lg};
    }

    /* Glass Morphism Card */
    .glass-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: ${BORDER_RADIUS.xl};
      box-shadow: ${SHADOWS.xl};
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
    }

    .glass-card:hover {
      transform: translateY(-2px);
      box-shadow: ${SHADOWS.xl}, ${SHADOWS.glow};
    }

    /* Modern Button */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: ${SPACING.sm};
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 600;
      border-radius: ${BORDER_RADIUS.md};
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      text-decoration: none;
      font-family: ${FONTS.sans};
    }

    .btn-primary {
      background: linear-gradient(135deg, ${COLORS.primary.start} 0%, ${COLORS.primary.end} 100%);
      color: white;
      box-shadow: ${SHADOWS.md};
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: ${SHADOWS.lg};
    }

    .btn-secondary {
      background: white;
      color: ${COLORS.primary.start};
      border: 2px solid ${COLORS.primary.start};
      box-shadow: ${SHADOWS.sm};
    }

    .btn-secondary:hover {
      background: ${COLORS.gray[50]};
      transform: translateY(-1px);
    }

    .btn-ghost {
      background: transparent;
      color: ${COLORS.gray[700]};
      border: 1px solid ${COLORS.gray[300]};
    }

    .btn-ghost:hover {
      background: ${COLORS.gray[50]};
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Form Inputs */
    .form-group {
      margin-bottom: ${SPACING.lg};
    }

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: ${COLORS.gray[700]};
      margin-bottom: ${SPACING.sm};
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      font-size: 15px;
      border: 2px solid ${COLORS.gray[300]};
      border-radius: ${BORDER_RADIUS.md};
      transition: all 0.2s ease;
      font-family: ${FONTS.sans};
      background: white;
    }

    .form-input:focus {
      outline: none;
      border-color: ${COLORS.primary.start};
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    /* Badge */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: ${BORDER_RADIUS.full};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-success {
      background: ${COLORS.successLight};
      color: #065f46;
    }

    .badge-warning {
      background: ${COLORS.warningLight};
      color: #92400e;
    }

    .badge-danger {
      background: ${COLORS.dangerLight};
      color: #991b1b;
    }

    .badge-info {
      background: ${COLORS.infoLight};
      color: #1e40af;
    }

    /* Scrollable Table */
    .table-container {
      overflow-x: auto;
      border-radius: ${BORDER_RADIUS.lg};
      box-shadow: ${SHADOWS.base};
      background: white;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table thead {
      background: ${COLORS.gray[50]};
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .table th {
      padding: 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: ${COLORS.gray[600]};
      border-bottom: 2px solid ${COLORS.gray[200]};
    }

    .table td {
      padding: 16px;
      border-bottom: 1px solid ${COLORS.gray[100]};
      font-size: 14px;
    }

    .table tbody tr {
      transition: background 0.2s ease;
    }

    .table tbody tr:hover {
      background: ${COLORS.gray[50]};
    }

    /* Loading Spinner */
    .spinner {
      border: 3px solid ${COLORS.gray[200]};
      border-top: 3px solid ${COLORS.primary.start};
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .fade-in {
      animation: fadeIn 0.4s ease;
    }

    .slide-in {
      animation: slideIn 0.4s ease;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .app-container {
        padding: ${SPACING.md};
      }
    }
  `;
}

/**
 * Generate header component
 */
export function renderHeader(currentPage: string, userName?: string): string {
  return `
    <header style="
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: ${BORDER_RADIUS.xl};
      padding: ${SPACING.lg};
      margin-bottom: ${SPACING['2xl']};
      box-shadow: ${SHADOWS.lg};
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: ${SPACING.md};">
        <div>
          <h1 style="
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(135deg, white 0%, rgba(255,255,255,0.8) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 4px;
          ">💰 Budgeter</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px;">Smart Budget Tracking with AI Insights</p>
        </div>
        <nav style="display: flex; gap: ${SPACING.md}; align-items: center;">
          <a href="/" class="btn ${currentPage === 'home' ? 'btn-primary' : 'btn-ghost'}" style="color: ${currentPage === 'home' ? 'white' : 'rgba(255,255,255,0.9)'};">
            🏠 Home
          </a>
          <a href="/transactions?window=weekly" class="btn ${currentPage === 'transactions' ? 'btn-primary' : 'btn-ghost'}" style="color: ${currentPage === 'transactions' ? 'white' : 'rgba(255,255,255,0.9)'};">
            📊 Transactions
          </a>
          <a href="/settings" class="btn ${currentPage === 'settings' ? 'btn-primary' : 'btn-ghost'}" style="color: ${currentPage === 'settings' ? 'white' : 'rgba(255,255,255,0.9)'};">
            ⚙️ Settings
          </a>
          ${userName ? `
            <a href="/logout" class="btn btn-ghost" style="color: rgba(255,255,255,0.9);">
              🚪 Logout
            </a>
          ` : ''}
        </nav>
      </div>
    </header>
  `;
}
