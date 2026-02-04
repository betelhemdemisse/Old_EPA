module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
      },
      fontFamily: {
        dm: ["DM Sans", "sans-serif"],
      },
      screens: {
        mid: "1098px", 
      },
    },
  },
  plugins: [],
};
