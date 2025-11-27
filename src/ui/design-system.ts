/**
 * Modern Design System for Budgeter App
 * Reusable components and design tokens
 * Theme: "Cosmic Glass" - Dark, sleek, premium
 */

export const COLORS = {
  // Primary gradient (Cosmic Blue/Purple)
  primary: {
    start: '#4f46e5', // Indigo 600
    end: '#7c3aed',   // Violet 600
    light: '#818cf8', // Indigo 400
    dark: '#3730a3',  // Indigo 800
    glow: 'rgba(79, 70, 229, 0.5)',
  },
  // Accent (Emerald/Teal for money/success)
  accent: {
    start: '#10b981', // Emerald 500
    end: '#059669',   // Emerald 600
    light: '#34d399', // Emerald 400
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  // Semantic colors
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.1)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.1)',
  info: '#3b82f6',
  infoBg: 'rgba(59, 130, 246, 0.1)',

  // Neutrals (Dark Slate/Gray)
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  // Backgrounds
  bg: {
    app: '#0f172a', // Slate 900
    card: 'rgba(30, 41, 59, 0.7)', // Slate 800 with opacity
    cardHover: 'rgba(30, 41, 59, 0.9)',
    input: 'rgba(15, 23, 42, 0.6)',
  },
  text: {
    main: '#f1f5f9', // Slate 100
    muted: '#94a3b8', // Slate 400
    inverse: '#0f172a',
  }
};

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.15)',
  glow: `0 0 20px ${COLORS.primary.glow}`,
  glowAccent: `0 0 20px ${COLORS.accent.glow}`,
};

export const SPACING = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
};

export const BORDER_RADIUS = {
  sm: '0.375rem', // 6px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px
  xl: '1rem',     // 16px
  full: '9999px',
};

export const FONTS = {
  sans: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", "Monaco", monospace',
};

/**
 * Generate base CSS with design tokens
 */
export function generateBaseCSS(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --primary-start: ${COLORS.primary.start};
      --primary-end: ${COLORS.primary.end};
      --bg-app: ${COLORS.bg.app};
      --text-main: ${COLORS.text.main};
      --text-muted: ${COLORS.text.muted};
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${FONTS.sans};
      background-color: ${COLORS.bg.app};
      background-image: 
        radial-gradient(circle at 15% 50%, rgba(79, 70, 229, 0.08), transparent 25%),
        radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.08), transparent 25%);
      color: ${COLORS.text.main};
      line-height: 1.6;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    ::-webkit-scrollbar-track {
      background: ${COLORS.gray[900]};
    }
    ::-webkit-scrollbar-thumb {
      background: ${COLORS.gray[700]};
      border-radius: 5px;
      border: 2px solid ${COLORS.gray[900]};
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${COLORS.gray[600]};
    }

    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: ${SPACING.lg} ${SPACING.md};
    }

    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      color: ${COLORS.text.main};
      line-height: 1.2;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    h1 { font-size: 2.5rem; margin-bottom: ${SPACING.md}; }
    h2 { font-size: 1.75rem; margin-bottom: ${SPACING.md}; }
    h3 { font-size: 1.25rem; margin-bottom: ${SPACING.sm}; }

    a {
      color: ${COLORS.primary.light};
      text-decoration: none;
      transition: color 0.2s;
    }
    a:hover { color: ${COLORS.primary.start}; }

    /* Glass Cards */
    .glass-card {
      background: ${COLORS.bg.card};
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: ${BORDER_RADIUS.xl};
      box-shadow: ${SHADOWS.base};
      padding: ${SPACING.lg};
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    /* Gradient border effect on glass cards */
    .glass-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: ${BORDER_RADIUS.xl};
      padding: 1px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(16, 185, 129, 0.3));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .glass-card:hover {
      background: ${COLORS.bg.cardHover};
      border-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-4px);
      box-shadow: ${SHADOWS.lg}, 0 0 40px rgba(79, 70, 229, 0.15);
    }

    .glass-card:hover::before {
      opacity: 1;
    }

    /* Shimmer effect for premium feel */
    .glass-card::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(255, 255, 255, 0.03) 50%,
        transparent 70%
      );
      transform: translateX(-100%);
      transition: transform 0.6s ease;
      pointer-events: none;
    }

    .glass-card:hover::after {
      transform: translateX(100%);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: ${SPACING.sm};
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: ${BORDER_RADIUS.lg};
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      text-decoration: none;
      font-family: ${FONTS.sans};
      position: relative;
      overflow: hidden;
    }

    /* Ripple effect for buttons */
    .btn::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    .btn:active::before {
      width: 300px;
      height: 300px;
    }

    .btn-primary {
      background: linear-gradient(135deg, ${COLORS.primary.start}, ${COLORS.primary.end});
      color: white;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .btn-primary:hover {
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
      transform: translateY(-2px) scale(1.02);
    }

    .btn-primary:active {
      transform: translateY(0) scale(0.98);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      color: ${COLORS.text.main};
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .btn-secondary:active {
      transform: translateY(0);
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
      transform: translateY(-1px);
    }

    .btn-danger:active {
      transform: translateY(0);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-icon {
      padding: 0.5rem;
      border-radius: ${BORDER_RADIUS.md};
      color: ${COLORS.text.muted};
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-icon:hover {
      background: rgba(255, 255, 255, 0.1);
      color: ${COLORS.text.main};
      transform: scale(1.1);
    }

    .btn-icon:active {
      transform: scale(0.95);
    }

    /* Forms */
    .form-group { margin-bottom: ${SPACING.lg}; }
    
    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: ${COLORS.text.muted};
      margin-bottom: ${SPACING.xs};
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      background: ${COLORS.bg.input};
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: ${BORDER_RADIUS.lg};
      color: ${COLORS.text.main};
      transition: all 0.2s;
      font-family: ${FONTS.sans};
    }

    .form-input:focus {
      outline: none;
      border-color: ${COLORS.primary.light};
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
      background: rgba(15, 23, 42, 0.8);
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: ${BORDER_RADIUS.full};
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-success { background: ${COLORS.successBg}; color: ${COLORS.success}; border: 1px solid rgba(16, 185, 129, 0.2); }
    .badge-warning { background: ${COLORS.warningBg}; color: ${COLORS.warning}; border: 1px solid rgba(245, 158, 11, 0.2); }
    .badge-danger { background: ${COLORS.dangerBg}; color: ${COLORS.danger}; border: 1px solid rgba(239, 68, 68, 0.2); }
    .badge-info { background: ${COLORS.infoBg}; color: ${COLORS.info}; border: 1px solid rgba(59, 130, 246, 0.2); }

    /* Utilities */
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-muted { color: ${COLORS.text.muted}; }
    .text-success { color: ${COLORS.success}; }
    .text-danger { color: ${COLORS.danger}; }
    .font-mono { font-family: ${FONTS.mono}; }
    
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-2 { gap: ${SPACING.sm}; }
    .gap-4 { gap: ${SPACING.md}; }
    .mt-4 { margin-top: ${SPACING.md}; }
    .mb-4 { margin-bottom: ${SPACING.md}; }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    .animate-slide-in-left { animation: slideInLeft 0.5s ease-out forwards; }
    .animate-slide-in-right { animation: slideInRight 0.5s ease-out forwards; }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    .animate-spin { animation: spin 1s linear infinite; }

    /* Skeleton Loading States */
    .skeleton {
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.03) 25%,
        rgba(255, 255, 255, 0.08) 50%,
        rgba(255, 255, 255, 0.03) 75%
      );
      background-size: 1000px 100%;
      animation: shimmer 2s infinite;
      border-radius: ${BORDER_RADIUS.md};
    }

    .skeleton-text {
      height: 1rem;
      margin-bottom: 0.5rem;
      border-radius: ${BORDER_RADIUS.sm};
    }

    .skeleton-title {
      height: 2rem;
      width: 60%;
      margin-bottom: 1rem;
      border-radius: ${BORDER_RADIUS.md};
    }

    .skeleton-card {
      height: 200px;
      border-radius: ${BORDER_RADIUS.xl};
    }

    /* Loading Spinner */
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: ${COLORS.primary.light};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-lg {
      width: 40px;
      height: 40px;
      border-width: 4px;
    }

    /* Modal */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(10, 14, 39, 0.8);
      backdrop-filter: blur(8px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal {
      background: ${COLORS.bg.card};
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: ${BORDER_RADIUS.xl};
      box-shadow: ${SHADOWS.lg};
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: ${SPACING.lg};
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: ${COLORS.text.main};
      margin: 0;
      display: flex;
      align-items: center;
      gap: ${SPACING.sm};
    }

    .modal-close {
      background: ${COLORS.dangerBg};
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      width: 32px;
      height: 32px;
      border-radius: ${BORDER_RADIUS.md};
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 1.25rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-close:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.5);
      transform: scale(1.1);
    }

    .modal-body {
      padding: ${SPACING.lg};
    }

    .modal-form-group {
      margin-bottom: ${SPACING.lg};
    }

    .modal-label {
      display: block;
      color: ${COLORS.text.muted};
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: ${SPACING.sm};
    }

    .modal-input {
      width: 100%;
      padding: 0.75rem;
      background: ${COLORS.bg.input};
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: ${BORDER_RADIUS.md};
      color: ${COLORS.text.main};
      font-size: 0.95rem;
      transition: all 0.2s ease;
      font-family: ${FONTS.sans};
    }

    .modal-input:focus {
      outline: none;
      border-color: ${COLORS.primary.light};
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
    }

    .modal-input::placeholder {
      color: ${COLORS.gray[500]};
    }

    .modal-hint {
      color: ${COLORS.text.muted};
      font-size: 0.8rem;
      margin-top: ${SPACING.xs};
    }

    .modal-footer {
      padding: ${SPACING.md} ${SPACING.lg};
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      gap: ${SPACING.md};
      justify-content: flex-end;
    }

    .modal-btn {
      padding: 0.75rem 1.5rem;
      border-radius: ${BORDER_RADIUS.md};
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      font-family: ${FONTS.sans};
    }

    .modal-btn-primary {
      background: linear-gradient(135deg, ${COLORS.primary.start}, ${COLORS.primary.end});
      color: white;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .modal-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
    }

    .modal-btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: ${COLORS.text.muted};
    }

    .modal-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    /* Dropdown */
    .dropdown {
      position: relative;
      display: inline-block;
    }

    .dropdown-toggle {
      display: inline-flex;
      align-items: center;
      gap: ${SPACING.xs};
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + ${SPACING.xs});
      left: 0;
      min-width: 200px;
      background: ${COLORS.bg.card};
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: ${BORDER_RADIUS.lg};
      box-shadow: ${SHADOWS.lg};
      padding: ${SPACING.xs};
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 9999;
    }

    .dropdown:hover .dropdown-menu,
    .dropdown-menu.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      display: block;
      width: 100%;
      padding: ${SPACING.sm} ${SPACING.md};
      color: ${COLORS.text.main};
      text-decoration: none;
      border-radius: ${BORDER_RADIUS.md};
      transition: all 0.15s;
      cursor: pointer;
      background: transparent;
      border: none;
      text-align: left;
      font-size: 0.9rem;
    }

    .dropdown-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: ${COLORS.primary.light};
      transform: translateX(4px);
    }

    .dropdown-item.active {
      background: rgba(79, 70, 229, 0.15);
      color: ${COLORS.primary.light};
    }

    .dropdown-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: ${SPACING.xs} 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .app-container { padding: ${SPACING.md}; }
      h1 { font-size: 2rem; }
      .glass-card { padding: ${SPACING.md}; }

      .dropdown-menu {
        min-width: 160px;
        right: 0;
        left: auto;
      }
    }
  `;
}

/**
 * Render common header
 */
export function renderHeader(currentPage: string, userName?: string): string {
  // Determine active report type (weekly, monthly, custom, or none)
  const isWeekly = currentPage === 'transactions' && userName === 'weekly';
  const isMonthly = currentPage === 'transactions' && userName === 'monthly';
  const isCustom = currentPage === 'transactions' && userName === 'custom';
  const isReportPage = isWeekly || isMonthly || isCustom;

  return `
    <header class="glass-card" style="margin-bottom: ${SPACING.xl}; padding: ${SPACING.md} ${SPACING.lg}; border-radius: ${BORDER_RADIUS.xl};">
      <div class="flex justify-between items-center" style="flex-wrap: wrap; gap: ${SPACING.md};">
        <!-- Logo/Brand -->
        <a href="/" style="text-decoration: none; display: flex; align-items: center; gap: ${SPACING.sm};">
          <div style="font-size: 2rem; background: linear-gradient(135deg, ${COLORS.primary.light}, ${COLORS.accent.light}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            💰
          </div>
          <div>
            <h1 style="font-size: 1.5rem; margin: 0; background: linear-gradient(to right, white, ${COLORS.gray[400]}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              Budgeter
            </h1>
            <p style="font-size: 0.75rem; color: ${COLORS.text.muted}; margin: 0;">Smart Finance Tracking</p>
          </div>
        </a>

        <!-- Navigation -->
        <nav class="flex gap-2" style="flex-wrap: wrap; align-items: center;">
          <!-- Home Link -->
          <a href="/" class="btn ${currentPage === 'home' ? 'btn-primary' : 'btn-secondary'}">
            🏠 <span style="display: inline-block;">Home</span>
          </a>

          <!-- Budget Reports Dropdown -->
          <div class="dropdown">
            <button class="btn dropdown-toggle ${isReportPage ? 'btn-primary' : 'btn-secondary'}">
              📊 Reports
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style="opacity: 0.7;">
                <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
              </svg>
            </button>
            <div class="dropdown-menu">
              <a href="/transactions?window=weekly" class="dropdown-item ${isWeekly ? 'active' : ''}">
                📅 Weekly Report
              </a>
              <a href="/transactions?window=monthly" class="dropdown-item ${isMonthly ? 'active' : ''}">
                📊 Monthly Report
              </a>
              <div class="dropdown-divider"></div>
              <a href="javascript:void(0)" onclick="openCustomReportModal()" class="dropdown-item ${isCustom ? 'active' : ''}">
                📋 Custom Report...
              </a>
            </div>
          </div>

          <!-- Settings Link -->
          <a href="/settings" class="btn ${currentPage === 'settings' ? 'btn-primary' : 'btn-secondary'}">
            ⚙️ <span style="display: inline-block;">Settings</span>
          </a>

          <!-- Logout (if authenticated) -->
          ${userName ? `
            <a href="/logout" class="btn btn-secondary" style="padding: 0.75rem;" title="Logout">
              🚪
            </a>
          ` : ''}
        </nav>
      </div>
    </header>
  `;
}

/**
 * Render common footer
 */
export function renderFooter(): string {
  return `
    <footer class="text-center" style="margin-top: ${SPACING['2xl']}; padding: ${SPACING.xl} 0; color: ${COLORS.text.muted}; border-top: 1px solid rgba(255,255,255,0.05);">
      <p style="font-size: 0.9rem;">
        Powered by <a href="https://truelayer.com" target="_blank" style="color: ${COLORS.text.main};">TrueLayer</a> 
        & <a href="https://sheets.google.com" target="_blank" style="color: ${COLORS.text.main};">Google Sheets</a>
      </p>
      <p style="font-size: 0.8rem; margin-top: ${SPACING.sm}; opacity: 0.6;">
        ${new Date().getFullYear()} Budgeter App • Secure & Private
      </p>
    </footer>
  `;
}
