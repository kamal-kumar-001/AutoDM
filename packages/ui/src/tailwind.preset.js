/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'rgba(255, 255, 255, 0.08)',
        input: 'rgba(255, 255, 255, 0.04)',
        ring: '#00BB88',
        background: '#030712',
        foreground: '#f3f4f6',
        primary: {
          DEFAULT: '#00BB88',
          foreground: '#030712',
          hover: '#00a376',
        },
        accent: {
          emerald: '#10b981',
          cyan: '#06b6d4',
          white: '#ffffff',
          gray: '#1f2937',
        },
        card: {
          DEFAULT: 'rgba(10, 15, 30, 0.6)',
          foreground: '#f3f4f6',
          border: 'rgba(255, 255, 255, 0.06)',
        },
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      backgroundImage: {
        'noise-pattern':
          'url(\'data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)"/%3E%3C/svg%3E\')',
        'glow-gradient': 'radial-gradient(circle, rgba(0,187,136,0.15) 0%, transparent 60%)',
        'mesh-gradient':
          'radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.15) 0px, transparent 50%), radial-gradient(at 50% 0%, rgba(16, 185, 129, 0.1) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 187, 136, 0.15) 0px, transparent 50%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 8px 32px 0 rgba(0, 187, 136, 0.1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(1.05)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 187, 136, 0.15)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 187, 136, 0.4)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-slow': 'pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow-pulse 2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
