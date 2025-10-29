/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Grok AI Premium Theme
        'midnight-ocean': '#001F3F',
        'soft-ivory': '#F5F5F0',
        'emerald-whisper': '#A8DADC',
        'saffron-gold': '#F4C430',
        'dark-navy': '#001829',
        'light-ivory': '#FAFAF7',
        'emerald-dark': '#7FB8BA',
        'gold-bright': '#FFD700',
        
        // Legacy color mappings for compatibility
        primary: {
          DEFAULT: '#001F3F',
          50: '#E6F2F7',
          100: '#CCE6EF',
          200: '#99CCD',
          300: '#66B3CC',
          400: '#3399BA',
          500: '#001F3F',
          600: '#001933',
          700: '#001326',
          800: '#000C1A',
          900: '#00060D',
        },
        accent: {
          DEFAULT: '#A8DADC',
          light: '#C4E8E9',
          dark: '#7FB8BA',
        },
        gold: {
          DEFAULT: '#F4C430',
          bright: '#FFD700',
          dark: '#D4A017',
        },
      },
      fontFamily: {
        heading: ['Futura', 'Trebuchet MS', 'Arial', 'sans-serif'],
        body: ['Montserrat', 'Segoe UI', 'Tahoma', 'sans-serif'],
        accent: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 31, 63, 0.05)',
        'md': '0 4px 6px rgba(0, 31, 63, 0.1)',
        'lg': '0 10px 15px rgba(0, 31, 63, 0.15)',
        'xl': '0 20px 25px rgba(0, 31, 63, 0.2)',
        '2xl': '0 25px 50px rgba(0, 31, 63, 0.25)',
        'glow': '0 0 20px rgba(244, 196, 48, 0.3)',
        'glow-strong': '0 0 30px rgba(244, 196, 48, 0.5)',
      },
      spacing: {
        'xs': '0.5rem',
        'sm': '1rem',
        'md': '1.5rem',
        'lg': '2rem',
        'xl': '3rem',
        '2xl': '4rem',
        '3xl': '6rem',
      },
    },
  },
  plugins: [],
}


