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
        police: {
          50: '#F0F5FA',
          100: '#E1ECF5',
          200: '#C2D9EC',
          300: '#94BEDE',
          400: '#5F9ECB',
          500: '#3A80B7',
          600: '#2A6697',
          700: '#1E4E76',
          800: '#153655',
          900: '#0B192C',
          950: '#070F1E',
        },
        cyber: {
          blue: '#00A8E8',
          teal: '#00C9A7',
          amber: '#F5A623',
          red: '#E63946',
          dark: '#0B192C',
          navy: '#1E3E62',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(rgba(0, 168, 232, 0.12) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
