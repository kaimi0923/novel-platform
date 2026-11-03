import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色：温暖的橙红，适合阅读类网站
        brand: {
          50: "#fff8ed",
          100: "#ffefd4",
          200: "#ffdca8",
          300: "#ffc270",
          400: "#ff9d37",
          500: "#fe7f11",
          600: "#ef6306",
          700: "#c64a08",
          800: "#9e3a0f",
          900: "#7f3110",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: [
          "Georgia",
          "Noto Serif SC",
          "Songti SC",
          "SimSun",
          "serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
