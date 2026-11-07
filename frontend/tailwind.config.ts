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
        cyber: {
          bg: "#0a0e1a",
          surface: "#121829",
          "surface-hover": "#161e33",
          "surface-card": "#0f1524",
        },
        neon: {
          cyan: "#00f0ff",
          magenta: "#ff007f",
          yellow: "#fcee0a",
        },
        crisp: {
          text: "#f1f5f9",
        },
        cool: {
          slate: "#94a3b8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
