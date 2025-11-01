/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        // Original CargoLume Colors
        'primary-blue': '#2563eb',
        'primary-blue-dark': '#1d4ed8',
        'primary-blue-darker': '#1e3a8a',
        'orange-accent': '#ff6a3d',
        'orange-light': '#ff6b35',
        'orange-dark': '#f7931e',
        'orange-hover': '#ff8c42',
        'bg-primary': '#1a2238',
        'bg-secondary': '#283655',
        
        // Primary blue scale
        primary: {
          DEFAULT: '#2563eb',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#1e3a8a',
        },
        accent: {
          DEFAULT: '#ff6a3d',
          light: '#ff6b35',
          dark: '#f7931e',
          hover: '#ff8c42',
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
      animation: {
        'slide-in': 'fadeInSlide 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeInSlide: {
          '0%': {
            opacity: '0',
            transform: 'translateX(100%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
    },
  },
  plugins: [],
}


