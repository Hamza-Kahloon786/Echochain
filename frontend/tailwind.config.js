/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        echo: {
          50: '#effef4',
          100: '#d9ffe7',
          200: '#b5fdd0',
          300: '#7cf8ab',
          400: '#3ce97f',
          500: '#14d15e',
          600: '#09ad4a',
          700: '#0b873d',
          800: '#0f6a34',
          900: '#0e572d',
          950: '#013117',
        },
        carbon: {
          50: '#f6f6f9',
          100: '#ededf1',
          200: '#d7d7e0',
          300: '#b4b4c5',
          400: '#8b8ba5',
          500: '#6d6d8a',
          600: '#575772',
          700: '#47475d',
          800: '#3d3d4f',
          900: '#272733',
          950: '#1a1a23',
        },
      },
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
