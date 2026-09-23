/** @type {import('tailwindcss').Config} */

// Semantic colours: each one is a CSS variable defined per theme in styles/globals.css,
// so components never need separate light/dark classes.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: token('page'), // page background
        fg: token('fg'), // main text
        'fg-soft': token('fg-soft'),
        muted: token('muted'), // secondary text
        subtle: token('subtle'), // labels, captions
        faint: token('faint'),
        tint: token('tint'), // translucent overlays and borders (use with /opacity)
        shade: token('shade'), // inset panels
        accent: token('accent'),
        ai: token('ai'),
        'chart-min': token('chart-min'),
        warn: token('warn'),
        success: token('success'),
        danger: token('danger'),
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
