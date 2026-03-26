/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          200: '#b9ccff',
          300: '#85a5ff',
          400: '#4d77ff',
          500: '#2952ff',
          600: '#1435f5',
          700: '#1028e1',
          800: '#1324b6',
          900: '#15238f',
          950: '#0e1660',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6010',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8f9ff',
          100: '#f0f2ff',
          200: '#e4e8ff',
          800: '#0f1117',
          900: '#080a12',
          950: '#04050c',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.4s ease forwards',
        'slide-down': 'slideDown 0.3s ease forwards',
        'pop':        'pop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'countdown':  'countdown linear forwards',
        'shake':      'shake 0.4s ease',
        'correct':    'correct 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'wrong':      'wrong 0.4s ease forwards',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pop:       { from: { opacity: 0, transform: 'scale(0.8)' }, to: { opacity: 1, transform: 'scale(1)' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shake:     { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-8px)' }, '75%': { transform: 'translateX(8px)' } },
        correct:   { from: { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' }, to: { transform: 'scale(1)' } },
        wrong:     { from: { opacity: 1 }, to: { opacity: 0.7 } },
        pulseRing: {
          '0%':   { transform: 'scale(0.8)', opacity: 1 },
          '100%': { transform: 'scale(2)',   opacity: 0 },
        },
        countdown: {
          from: { strokeDashoffset: 0 },
          to:   { strokeDashoffset: 283 },
        },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232952ff' fill-opacity='0.05'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
