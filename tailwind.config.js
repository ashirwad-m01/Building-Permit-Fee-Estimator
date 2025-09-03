/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#FE7743',
        // Light theme
        'light-bg': '#EFEEEA',
        'light-card': '#FFFFFF',
        'light-text': '#000000',
        'light-secondary': '#273F4F',
        'light-border': '#DADADA',
        
        // Dark theme
        'dark-bg': '#121212',
        'dark-card': '#273F4F',
        'dark-text': '#EFEEEA',
        'dark-secondary': '#A5B4C0',
        'dark-border': '#3B4E5C',
      }
    }
  },
  plugins: [],
};
