import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Map color names to CSS variables
        // Tailwind will generate utilities like bg-background, text-foreground, etc.
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // You might want to add other variable-based colors here if needed
        // Example:
        // primary: {
        //   DEFAULT: "hsl(var(--primary))",
        //   foreground: "hsl(var(--primary-foreground))",
        // },
        // destructive: {
        //   DEFAULT: "hsl(var(--destructive))",
        //   foreground: "hsl(var(--destructive-foreground))",
        // },
        // ... etc.
      },
      fontFamily: {
        sans: [
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      // Add other theme extensions if necessary (e.g., borderRadius, keyframes)
    },
  },
  plugins: [
     // Add any Tailwind plugins here (e.g., @tailwindcss/forms, @tailwindcss/typography)
  ],
} satisfies Config;
