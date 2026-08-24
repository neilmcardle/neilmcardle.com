import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import plugin from "tailwindcss/plugin";

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
        "2xs": ["0.625rem", { lineHeight: "1rem" }], // 10px — labels, metadata
        "3xs": ["0.6875rem", { lineHeight: "1rem" }], // 11px — footers, captions

        "10": ["0.65625rem", { lineHeight: "1rem" }], // 10.5px — captions, inline badges
        "11": ["0.6875rem", { lineHeight: "1.25rem" }], // 11px — small text
        "12": ["0.75rem", { lineHeight: "1.25rem" }], // 12px — labels, secondary text
        "125": ["0.78125rem", { lineHeight: "1.5rem" }], // 12.5px — body, item labels
        "13": ["0.8125rem", { lineHeight: "1.5rem" }], // 13px — primary body text
      },
      colors: {
        cream: "#fbf9f3", // primary light text / surfaces on black
        tan: "#8a7f70", // muted labels, borders, hairlines

        gold: "#d8b46a",
        "gold-bright": "#f0d091",
        "gold-deep": "#b8923f",

        "me-cream": "#faf9f5", // Primary marketing background
        "me-cream-dark": "#0a0a0a", // Dark mirror for cream (signin etc.)

        "me-accent": "#008ff0",

        "me-base": "#1e1e1e", // Main panel / sidebar backgrounds
        "me-surface": "#262626", // Elevated surface (inputs, cards within panels)
        "me-raised": "#2f2f2f", // Borders, hover states, tooltips

        "action-primary": {
          50: "#fef3f0",
          100: "#fde7df",
          500: "#e56d24",
          600: "#d45d0d",
          700: "#b94806",
          dark: "#f97316",
        },

        "confirm-primary": {
          50: "#f0fdf8",
          100: "#d4f3e8",
          500: "#1f7a5f",
          600: "#157043",
          700: "#0d5930",
          dark: "#2dd4bf",
        },

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
        "coverly-sidebar": "hsl(var(--coverly-sidebar))",
        "coverly-sidebar-foreground": "hsl(var(--coverly-sidebar-foreground))",
        "coverly-sidebar-primary": "hsl(var(--coverly-sidebar-primary))",
        "coverly-sidebar-primary-foreground":
          "hsl(var(--coverly-sidebar-primary-foreground))",
        "coverly-sidebar-accent": "hsl(var(--coverly-sidebar-accent))",
        "coverly-sidebar-accent-foreground":
          "hsl(var(--coverly-sidebar-accent-foreground))",
        "coverly-sidebar-border": "hsl(var(--coverly-sidebar-border))",
        "coverly-sidebar-ring": "hsl(var(--coverly-sidebar-ring))",
        "coverly-selection": "hsl(var(--coverly-selection))",
        "coverly-chart": {
          1: "hsl(var(--coverly-chart-1))",
          2: "hsl(var(--coverly-chart-2))",
          3: "hsl(var(--coverly-chart-3))",
          4: "hsl(var(--coverly-chart-4))",
          5: "hsl(var(--coverly-chart-5))",
        },

        ka: {
          brand: {
            50: "#EEF2FF",
            500: "#6366F1",
            600: "#4F46E5",
            700: "#4338CA",
          },
          year1: { DEFAULT: "#F97316", light: "#FED7AA" },
          year2: { DEFAULT: "#EAB308", light: "#FEF08A" },
          year3: { DEFAULT: "#22C55E", light: "#BBF7D0" },
          year4: { DEFAULT: "#3B82F6", light: "#BFDBFE" },
          year5: { DEFAULT: "#A855F7", light: "#E9D5FF" },
          year6: { DEFAULT: "#EF4444", light: "#FEE2E2" },
          science: { DEFAULT: "#0EA5E9", light: "#E0F2FE" },
          maths: { DEFAULT: "#F59E0B", light: "#FEF3C7" },
          english: { DEFAULT: "#EC4899", light: "#FCE7F3" },
          history: { DEFAULT: "#8B5CF6", light: "#EDE9FE" },
          geography: { DEFAULT: "#10B981", light: "#D1FAE5" },
        },
      },
      spacing: {
        "ka-touch": "44px",
        "ka-touch-lg": "56px",

        "4.5": "1.125rem", // 18px
        "5.5": "1.375rem", // 22px
        "6.5": "1.625rem", // 26px
        "7.5": "1.875rem", // 30px
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        serif: ["var(--font-playfair)"],
        "ka-display": ["var(--font-ka-display)", "Nunito", "sans-serif"],
        "ka-body": ["var(--font-ka-body)", "Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",

        control: "8px", // standardized to 8px    // interactive controls, buttons
        chip: "8px", // compact chips, badges
        card: "8px", // standardized to 8px      // card containers
        modal: "16px", // modal dialogs
        pill: "24px", // full-width pills

        "coverly-sm": "calc(var(--coverly-radius) * 0.6)",
        "coverly-md": "calc(var(--coverly-radius) * 0.8)",
        "coverly-lg": "var(--coverly-radius)",
        "coverly-xl": "calc(var(--coverly-radius) * 1.4)",
        "coverly-2xl": "calc(var(--coverly-radius) * 1.8)",
        "coverly-3xl": "calc(var(--coverly-radius) * 2.2)",
        "coverly-4xl": "calc(var(--coverly-radius) * 2.6)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },

        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "fade-up": "fade-up 320ms cubic-bezier(0.23, 1, 0.32, 1)",
        "fade-in": "fade-in 300ms ease-out",
        "pop-in": "pop-in 250ms cubic-bezier(0.23, 1, 0.32, 1)",
      },
      boxShadow: {
        modal: "0 24px 64px rgba(0,0,0,0.24), 0 2px 8px rgba(0,0,0,0.08)",
        float: "0 12px 32px rgba(0,0,0,0.24), 0 2px 6px rgba(0,0,0,0.08)",
        border:
          "0px 0px 0px 1px rgba(0, 0, 0, 0.07), 0px 2px 3px -1px rgba(0, 0, 0, 0.06), 0px 2px 5px 0px rgba(0, 0, 0, 0.04)",
        "border-hover":
          "0px 0px 0px 1px rgba(0, 0, 0, 0.09), 0px 2px 3px -1px rgba(0, 0, 0, 0.08), 0px 2px 5px 0px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [
    typography,

    plugin(({ addVariant }) => {
      addVariant("me", "html.makeebook &");
    }),
  ],
} satisfies Config;

export default config;
