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
    }

    .glass-card:hover {
      background: ${COLORS.bg.cardHover};
      border-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
      box-shadow: ${SHADOWS.md};
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
    }

    .btn-primary {
      background: linear-gradient(135deg, ${COLORS.primary.start}, ${COLORS.primary.end});
      color: white;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .btn-primary:hover {
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      color: ${COLORS.text.main};
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
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
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    
    /* Responsive */
    @media (max-width: 768px) {
      .app-container { padding: ${SPACING.md}; }
      h1 { font-size: 2rem; }
      .glass-card { padding: ${SPACING.md}; }
    }
  `;
}

/**
 * Render common header
 */
export function renderHeader(currentPage: string, userName?: string): string {
  return `
    <header class="glass-card" style="margin-bottom: ${SPACING.xl}; padding: ${SPACING.md} ${SPACING.lg}; border-radius: ${BORDER_RADIUS.xl};">
      <div class="flex justify-between items-center" style="flex-wrap: wrap; gap: ${SPACING.md};">
        <div class="flex items-center gap-2">
          <div style="font-size: 2rem; background: linear-gradient(135deg, ${COLORS.primary.light}, ${COLORS.accent.light}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            💰
          </div>
          <div>
            <h1 style="font-size: 1.5rem; margin: 0; background: linear-gradient(to right, white, ${COLORS.gray[400]}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              Budgeter
            </h1>
            <p style="font-size: 0.8rem; color: ${COLORS.text.muted}; margin: 0;">Smart Finance Tracking</p>
          </div>
        </div>
        
        <nav class="flex gap-2" style="flex-wrap: wrap;">
          <a href="/" class="btn ${currentPage === 'home' ? 'btn-primary' : 'btn-secondary'}">
            🏠 Home
          </a>
          <a href="/transactions?window=weekly" class="btn ${currentPage === 'transactions' && !userName?.includes('monthly') ? 'btn-primary' : 'btn-secondary'}">
            📅 Weekly
          </a>
          <a href="/transactions?window=monthly" class="btn ${currentPage === 'transactions' && userName?.includes('monthly') ? 'btn-primary' : 'btn-secondary'}">
            📊 Monthly
          </a>
          <a href="/settings" class="btn ${currentPage === 'settings' ? 'btn-primary' : 'btn-secondary'}">
            ⚙️ Settings
          </a>
          ${userName ? `
            <a href="/logout" class="btn btn-secondary" style="padding: 0.75rem;">
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
