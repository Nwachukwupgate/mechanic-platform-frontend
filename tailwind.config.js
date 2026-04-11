/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.css",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Brand: #086C40 (green), #E68324 (orange)
        primary: {
          50: '#ecf7f2',
          100: '#d3ede2',
          200: '#a7dcc5',
          300: '#6fc4a3',
          400: '#3da87d',
          500: '#1e8d62',
          600: '#086C40',
          700: '#065732',
          800: '#054329',
          900: '#032e1b',
        },
        accent: {
          50: '#fdf4ed',
          100: '#fae6d6',
          200: '#f5ccad',
          300: '#efab79',
          400: '#e88a46',
          500: '#e37028',
          600: '#E68324',
          700: '#c96a1a',
          800: '#a35616',
          900: '#7a4012',
        },
        surface: {
          DEFAULT: '#f8fafc',
          card: '#ffffff',
          elevated: '#ffffff',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        lift: '0 12px 40px -12px rgba(8, 108, 64, 0.18), 0 4px 16px -4px rgba(0, 0, 0, 0.08)',
        glow: '0 0 0 1px rgba(8, 108, 64, 0.06), 0 20px 50px -20px rgba(8, 108, 64, 0.25)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
      },
      animationDelay: {
        100: '100ms',
        200: '200ms',
        300: '300ms',
        400: '400ms',
        500: '500ms',
      },
    },
  },
  plugins: [],
}
