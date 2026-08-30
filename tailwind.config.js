/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        '3xl': '1920px',
        '4xl': '2560px',
        '5xl': '3840px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      colors: {
        // Semantic colors - mapped to CSS variables
        background: {
          main: 'var(--bg-main)',
          card: 'var(--bg-card)',
          panel: 'var(--bg-panel)',
          sidebar: 'var(--bg-sidebar)',
          topbar: 'var(--bg-topbar)',
          hover: 'var(--bg-hover)',
          active: 'var(--bg-active)',
          overlay: 'var(--bg-overlay)',
        },
        bg: {
          main: 'var(--bg-main)',
          card: 'var(--bg-card)',
          panel: 'var(--bg-panel)',
          sidebar: 'var(--bg-sidebar)',
          topbar: 'var(--bg-topbar)',
          hover: 'var(--bg-hover)',
          active: 'var(--bg-active)',
          overlay: 'var(--bg-overlay)',
        },
        foreground: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
          accent: 'var(--text-accent)',
        },
        border: {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
          focus: 'var(--border-focus)',
          accent: 'var(--border-accent)',
        },
        accent: {
          cyan: 'var(--accent-cyan)',
          'cyan-hover': 'var(--accent-cyan-hover)',
          'cyan-light': 'var(--accent-cyan-light)',
          emerald: 'var(--accent-emerald)',
          'emerald-hover': 'var(--accent-emerald-hover)',
          'emerald-light': 'var(--accent-emerald-light)',
          rose: 'var(--accent-rose)',
          'rose-hover': 'var(--accent-rose-hover)',
          'rose-light': 'var(--accent-rose-light)',
          yellow: 'var(--accent-yellow)',
          amber: 'var(--accent-amber)',
          indigo: 'var(--accent-indigo)',
          purple: 'var(--accent-purple)',
        },
        status: {
          success: {
            bg: 'var(--status-success-bg)',
            text: 'var(--status-success-text)',
            border: 'var(--status-success-border)',
            icon: 'var(--status-success-icon)',
          },
          warning: {
            bg: 'var(--status-warning-bg)',
            text: 'var(--status-warning-text)',
            border: 'var(--status-warning-border)',
            icon: 'var(--status-warning-icon)',
          },
          danger: {
            bg: 'var(--status-danger-bg)',
            text: 'var(--status-danger-text)',
            border: 'var(--status-danger-border)',
            icon: 'var(--status-danger-icon)',
          },
          info: {
            bg: 'var(--status-info-bg)',
            text: 'var(--status-info-text)',
            border: 'var(--status-info-border)',
            icon: 'var(--status-info-icon)',
          },
          neutral: {
            bg: 'var(--status-neutral-bg)',
            text: 'var(--status-neutral-text)',
            border: 'var(--status-neutral-border)',
            icon: 'var(--status-neutral-icon)',
          },
        },
        empty: {
          icon: 'var(--empty-state-icon)',
          text: 'var(--empty-state-text)',
        },
        // Keep semantic slate mapping for backwards compatibility
        slate: {
          50:  'var(--slate-50)',
          100: 'var(--slate-100)',
          200: 'var(--slate-200)',
          300: 'var(--slate-300)',
          400: 'var(--slate-400)',
          500: 'var(--slate-500)',
          600: 'var(--slate-600)',
          700: 'var(--slate-700)',
          800: 'var(--slate-800)',
          900: 'var(--slate-900)',
          950: 'var(--slate-950)',
        },
      },
      boxShadow: {
        'glass': 'var(--glass-shadow)',
        'focus': 'var(--focus-ring)',
        'focus-error': 'var(--focus-ring-error)',
        'focus-success': 'var(--focus-ring-success)',
      },
      backdropBlur: {
        'glass': 'var(--glass-blur)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fade-in 220ms ease-out',
        'skeleton': 'skeleton-loading 1.5s ease-in-out infinite',
        'indicator-glow': 'indicator-glow 2.5s ease-in-out infinite',
        'indicator-alert': 'indicator-alert 1.6s ease-in-out infinite',
        'indicator-sync': 'indicator-sync 1.2s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0.7', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'skeleton-loading': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'indicator-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
          '50%': { boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)' },
        },
        'indicator-alert': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
          '50%': { boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.1)' },
        },
        'indicator-sync': {
          '0%': { boxShadow: '0 0 0 0 rgba(6, 182, 212, 0.4)' },
          '50%': { boxShadow: '0 0 0 5px rgba(6, 182, 212, 0.08)' },
          '100%': { boxShadow: '0 0 0 0 rgba(6, 182, 212, 0.4)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [
    // Plugin to add form element base styles
    function({ addBase, theme }) {
      addBase({
        'input, select, textarea': {
          backgroundColor: theme('colors.background.main'),
          color: theme('colors.foreground.primary'),
          borderColor: theme('colors.border.secondary'),
        },
      });
    },
  ],
}
