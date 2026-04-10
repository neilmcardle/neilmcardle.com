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
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        serif: ["var(--font-playfair)"],
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
