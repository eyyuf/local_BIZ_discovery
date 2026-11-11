/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          bg: '#0D0D0C',
          surface: '#151513',
          elevated: '#1D1C19',
          border: '#34322D',
          'border-defined': 'rgba(255, 255, 255, 0.20)',
          'border-active': '#FFFFFF',
          foreground: '#F5F2EA',
          muted: '#AAA69C',
          status: '#2E8555',
          destructive: '#E05252',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
      },
    },
  },
  plugins: [],
}
