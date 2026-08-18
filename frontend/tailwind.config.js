/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // CIMB Niaga brand palette (dari DESIGN-PROMPTS.md)
        primary: {
          50:  '#fff1f1',
          100: '#ffe0e0',
          200: '#ffc6c6',
          300: '#ff9d9d',
          400: '#ff6464',
          500: '#ff3131',
          600: '#ed1111',
          700: '#c80a0a',  // CIMB Red utama
          800: '#a50c0c',
          900: '#881111',
        },
        gray: {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        success: {
          light: '#dcfce7',
          DEFAULT: '#16a34a',
          dark: '#15803d',
        },
        warning: {
          light: '#fef9c3',
          DEFAULT: '#ca8a04',
          dark: '#a16207',
        },
        danger: {
          light: '#fee2e2',
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
