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
          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.25rem",
          "--rounded-badge": "0.25rem",
        },
      },
    ],
  },
};
