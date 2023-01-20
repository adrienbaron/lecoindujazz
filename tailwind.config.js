/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        primary: "#d5a612",
      },
    },
  },
  plugins: [
    require("tailwind-fluid-typography"),
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      {
        dark: {
          ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
          primary: "#d5a612",
          "base-100": "#141415",
          "base-200": "#202021",
          "base-300": "#2B2C2D",
          neutral: "#373838",
          "--rounded-box": "0",
          "--rounded-btn": "0",
          "--rounded-badge": "0",
        },
      },
    ],
  },
};
