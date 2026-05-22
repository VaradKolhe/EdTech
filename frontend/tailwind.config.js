/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#00a86b", dark: "#007a4d", light: "#e6f7f1" },
        sidebar: { DEFAULT: "#1a1f2e", light: "#252b3b" },
      },
    },
  },
  plugins: [],
};
