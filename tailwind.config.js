// const fs = require('fs')

// const colors = JSON.parse(fs.readFileSync('./colors.json').toString())

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {},
  variants: {
    extend: {},
  },
  plugins: [],
};
