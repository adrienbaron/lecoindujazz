import daisyui from "daisyui";
import tailwindFluidTypography from "tailwind-fluid-typography";
import tailwindTypography from "@tailwindcss/typography";
import { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        primary: "#d5a612",
      },
    },
  },
  plugins: [daisyui, tailwindTypography, tailwindFluidTypography],
  daisyui: {
    themes: [
      {
        dark: {
          ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
          primary: "#d5a612",
          "base-100": "#141415",
          "base-200": "#202021",
          "base-300": "#2B2C2D",
          "base-content": "#F4F4F4",
          neutral: "#373838",
          "neutral-content": "#F4F4F4",
          "--rounded-box": "0",
          "--rounded-btn": "0",
          "--rounded-badge": "0",
        },
      },
    ],
  },
} satisfies Config;
