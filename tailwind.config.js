/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        iosBg: '#f5f7fb',
        iosCard: '#ffffff',
        pastelBlue: '#dbeafe',
        lavender: '#ede9fe',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
};
