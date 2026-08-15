/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // toggled via <html class="dark">, controlled by ThemeContext
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:            "rgb(var(--color-bg) / <alpha-value>)",
        "bg-secondary":"rgb(var(--color-bg-secondary) / <alpha-value>)",
        surface:       "rgb(var(--color-surface) / <alpha-value>)",
        "surface-alt": "rgb(var(--color-surface-alt) / <alpha-value>)",
        text:          "rgb(var(--color-text) / <alpha-value>)",
        "text-muted":  "rgb(var(--color-text-muted) / <alpha-value>)",
        border:        "rgb(var(--color-border) / <alpha-value>)",
        accent:        "rgb(var(--color-accent) / <alpha-value>)",
        "accent-hover":"rgb(var(--color-accent-hover) / <alpha-value>)",
        gold:          "rgb(var(--color-gold) / <alpha-value>)",
        "gold-soft":   "rgb(var(--color-gold-soft) / <alpha-value>)",
        emphasis:      "rgb(var(--color-emphasis) / <alpha-value>)",
        success:       "rgb(var(--color-success) / <alpha-value>)",
        danger:        "rgb(var(--color-danger) / <alpha-value>)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)", // smooth easeOut, not bouncy
      },
    },
  },
  plugins: [],
}
