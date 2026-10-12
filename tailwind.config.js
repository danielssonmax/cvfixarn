/** @type {import('tailwindcss').Config} */
module.exports = {
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
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
        heading: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
      },
      colors: {
        // Brand green. DEFAULT is the CTA fill; 700+ are for green text on
        // white, where the base green is too light to pass contrast.
        brand: {
          50: "#effdf5",
          100: "#d8f8e6",
          200: "#b2efcd",
          DEFAULT: "#00bf63",
          600: "#00a857",
          700: "#00874a",
          800: "#006b3b",
        },
        // Navy ink, taken from the editor's preview canvas so the marketing
        // site and the editor read as one product.
        ink: {
          50: "#f5f7fa",
          100: "#e9edf3",
          200: "#d3dae5",
          300: "#a9b5c7",
          400: "#7b8aa3",
          500: "#56657f",
          600: "#3d4b64",
          700: "#2a3850",
          800: "#1c2a42",
          DEFAULT: "#16233a",
          900: "#16233a",
          950: "#0e182a",
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
      },
      boxShadow: {
        // Navy-tinted elevation instead of neutral black.
        soft: "0 1px 2px rgb(22 35 58 / 0.05), 0 4px 12px -2px rgb(22 35 58 / 0.06)",
        lift: "0 1px 2px rgb(22 35 58 / 0.06), 0 12px 32px -8px rgb(22 35 58 / 0.18)",
        float: "0 2px 6px rgb(22 35 58 / 0.06), 0 24px 60px -16px rgb(22 35 58 / 0.28)",
        page: "0 1px 2px rgb(22 35 58 / 0.08), 0 18px 40px -14px rgb(22 35 58 / 0.35)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      typography: {
        sm: {
          css: {
            fontSize: "0.875rem",
            lineHeight: "1.5",
            p: {
              marginTop: "0.5em",
              marginBottom: "0.5em",
            },
            ul: {
              marginTop: "0.5em",
              marginBottom: "0.5em",
            },
            li: {
              marginTop: "0.25em",
              marginBottom: "0.25em",
            },
          },
        },
        dynamic: {
          css: {
            fontSize: "var(--dynamic-font-size)",
            h1: { fontSize: "calc(var(--dynamic-font-size) * 2)" },
            h2: { fontSize: "calc(var(--dynamic-font-size) * 1.5)" },
            h3: { fontSize: "calc(var(--dynamic-font-size) * 1.25)" },
          },
        },
      },
      fontSize: {
        dynamic: "var(--dynamic-font-size)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
