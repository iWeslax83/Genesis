/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nexus-bg': '#0a0e1a',
        'nexus-card': '#1a1f36',
        'nexus-card-hover': '#242b4a',
        'nexus-accent': '#00f0ff',
        'nexus-green': '#00ff88',
        'nexus-orange': '#ff8800',
        'nexus-red': '#ff4466',
        'nexus-purple': '#a855f7',
        'nexus-blue': '#3b82f6',
        'nexus-border': '#2a3154',
        'nexus-text': '#e2e8f0',
        'nexus-text-dim': '#94a3b8',
        'genesis-leaf': '#22c55e',
        'genesis-water': '#06b6d4',
        'genesis-soil': '#92400e',
        'genesis-o2': '#34d399',
        'genesis-co2': '#f97316',
        'genesis-nutrient': '#c084fc',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'sans': ['Inter', 'IBM Plex Sans', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'flow': 'flow 3s linear infinite',
        'ring-pulse': 'ring-pulse 2s ease-out infinite',
        'fill-bar': 'fill-bar 1s ease-out both',
        'slide-up': 'slide-up 0.5s ease-out both',
        'spin-slow': 'spin 8s linear infinite',
        'blink': 'blink 1s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 5px rgba(0,240,255,0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 20px rgba(0,240,255,0.6)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'flow': {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
        'ring-pulse': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'fill-bar': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--fill-width)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
}
