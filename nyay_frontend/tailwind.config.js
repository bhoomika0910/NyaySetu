/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        "primary-light": "#EEF2FF",
        accent: "#F59E0B",
        success: "#10B981",
        danger: "#EF4444",
        "neutral-50": "#FAFAF9",
        "neutral-900": "#1C1917"
      },
      fontFamily: {
        primary: ['"Noto Sans"', "sans-serif"],
        display: ['"Tiro Devanagari Hindi"', "serif"]
      },
      lineHeight: {
        relaxed: "1.7"
      },
      borderRadius: {
        "2xl": "1.25rem"
      }
    }
  },
  plugins: []
};
