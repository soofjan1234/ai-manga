import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 复古漫画配色
        primary: {
          DEFAULT: "#1a1a5e", // 深蓝
          light: "#2a2a7e",
          dark: "#0f0f3d",
        },
        accent: {
          DEFAULT: "#F5A623", // 复古黄
          light: "#FFD93D",
          dark: "#E09000",
        },
        cream: {
          DEFAULT: "#F5F0E1", // 米色/奶油色
          dark: "#E8E0C8",
        },
        ink: {
          DEFAULT: "#1a1a1a", // 墨黑
          light: "#333333",
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"Space Mono"', "monospace"],
      },
      backgroundImage: {
        "dots-pattern": "radial-gradient(#4a4a8a 1px, transparent 1px)",
        "stripe-pattern": "repeating-linear-gradient(0deg, #1a1a1a 0px, #1a1a1a 2px, #F5F0E1 2px, #F5F0E1 4px)",
      },
      boxShadow: {
        "retro": "4px 4px 0px #1a1a1a",
        "retro-lg": "6px 6px 0px #1a1a1a",
        "retro-accent": "4px 4px 0px #F5A623",
        "glow-accent": "0 0 30px rgba(245, 166, 35, 0.4)",
      },
      borderWidth: {
        "3": "3px",
      },
    },
  },
  plugins: [],
};
export default config;
