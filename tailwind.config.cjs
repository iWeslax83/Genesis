/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nexus-bg': '#111318',
        'nexus-card': '#1a1c23',
        'nexus-card-hover': '#22242c',
        'nexus-accent': '#5b8def',
        'nexus-green': '#4ead5b',
        'nexus-orange': '#d4903a',
        'nexus-red': '#d45555',
        'nexus-purple': '#8b7fc7',
        'nexus-blue': '#5b8def',
        'nexus-border': '#2a2c35',
        'nexus-text': '#c5c6cc',
        'nexus-text-dim': '#6c6e78',
        'genesis-leaf': '#4ead5b',
        'genesis-water': '#4a9caa',
        'genesis-soil': '#8b6840',
        'genesis-o2': '#4ead5b',
        'genesis-co2': '#d4903a',
        'genesis-nutrient': '#8b7fc7',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'sans': ['Inter', 'IBM Plex Sans', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.3s ease-out both',
        'flow': 'flow 3s linear infinite',
        'fill-bar': 'fill-bar 0.8s ease-out both',
        'slide-up': 'slide-up 0.3s ease-out both',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'flow': {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
        'fill-bar': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--fill-width)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
