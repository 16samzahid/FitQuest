/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        blue: "#393EA6",
        lightBlue: "#5092AC",
        red: "#FD4545",
        green: "#47A639",
        orange: "#DD742D",
        lightGray: "#A4A4A4",
        yellow: "#fcbb0a",
      },
    },
  },
  plugins: [],
};
