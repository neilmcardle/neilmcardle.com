import type { Config } from "tailwindcss"
import typography from "@tailwindcss/typography"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontSize: {
        // Non-standard sizes used throughout the app — registered here so they
        // can be referenced as utility classes instead of arbitrary values.
        '2xs': ['0.625rem', { lineHeight: '1rem' }],   // 10px — labels, metadata
        '3xs': ['0.6875rem', { lineHeight: '1rem' }],  // 11px — footers, captions
      },
      colors: {
        // neilmcardle.com personal-site (dark) palette — homepage + paintings.
        // Distinct from the makeEbook marketing cream below.
        cream: '#fbf9f3',   // primary light text / surfaces on black
        tan:   '#8a7f70',   // muted labels, borders, hairlines
        // Soft-UI warm accent (CTAs, section icons, numbers). Mirrors the
        // --gold CSS vars in globals.css.
        gold:          '#d8b46a',
        'gold-bright': '#f0d091',
        'gold-deep':   '#b8923f',

        // Marketing brand surface — used by the public-facing landing, blog,
        // signin, and shared marketing nav. Distinct from the editor's
        // dark-mode panels and the e-reader paper palette.
        'me-cream':      '#faf9f5',   // Primary marketing background
        'me-cream-dark': '#0a0a0a',   // Dark mirror for cream (signin etc.)

        // Brand accent (chapter pills, active states)
        'me-accent': '#4070ff',
        // Dark-mode surface palette — use these instead of arbitrary hex values
        'me-base':    '#1e1e1e',   // Main panel / sidebar backgrounds
        'me-surface': '#262626',   // Elevated surface (inputs, cards within panels)
        'me-raised':  '#2f2f2f',   // Borders, hover states, tooltips

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Kids Academy palette — namespaced so the soft-launch product can be
        // extracted to its own repo without untangling colour tokens.
        ka: {
          brand: {
            50:  '#EEF2FF',
            500: '#6366F1',
            600: '#4F46E5',
            700: '#4338CA',
          },
          year1:   { DEFAULT: '#F97316', light: '#FED7AA' },
          year2:   { DEFAULT: '#EAB308', light: '#FEF08A' },
          year3:   { DEFAULT: '#22C55E', light: '#BBF7D0' },
          year4:   { DEFAULT: '#3B82F6', light: '#BFDBFE' },
          year5:   { DEFAULT: '#A855F7', light: '#E9D5FF' },
          year6:   { DEFAULT: '#EF4444', light: '#FEE2E2' },
          science: { DEFAULT: '#0EA5E9', light: '#E0F2FE' },
          maths:   { DEFAULT: '#F59E0B', light: '#FEF3C7' },
          english: { DEFAULT: '#EC4899', light: '#FCE7F3' },
          history: { DEFAULT: '#8B5CF6', light: '#EDE9FE' },
          geography: { DEFAULT: '#10B981', light: '#D1FAE5' },
        },
      },
      spacing: {
        'ka-touch':    '44px',
        'ka-touch-lg': '56px',
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        serif: ["var(--font-playfair)"],
        'ka-display': ["var(--font-ka-display)", "Nunito", "sans-serif"],
        'ka-body':    ["var(--font-ka-body)", "Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [typography],
} satisfies Config

export default config
