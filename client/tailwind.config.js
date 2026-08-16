/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        storm: {
          950: '#05070F',
          900: '#0A0F1E',
          850: '#0D1428',
          800: '#111A33',
          700: '#1B2547',
          600: '#2A3A66',
          blue: '#38BDF8',
          electric: '#2E9BFF',
          gray: '#8B9BB4',
          violet: '#7C3AED',
          deep: '#312E81',
        },
      },
      boxShadow: {
        glow: '0 0 40px rgba(56, 189, 248, 0.16)',
        'glow-violet': '0 0 44px rgba(124, 58, 237, 0.22)',
        lift: '0 24px 48px -24px rgba(2, 6, 23, 0.9)',
      },
      keyframes: {
        aurora: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(60px, -40px) scale(1.15)' },
          '100%': { transform: 'translate(-40px, 30px) scale(0.95)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        aurora: 'aurora 16s ease-in-out infinite alternate',
        'aurora-slow': 'aurora 24s ease-in-out infinite alternate-reverse',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
};
