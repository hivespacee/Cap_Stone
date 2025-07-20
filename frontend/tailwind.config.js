/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'rubik': ['Rubik', 'sans-serif'], 
      },
      colors: {
        // Light theme
        cream: '#D8C9AE',
        'cream-light': '#E5D8C1',
        'cream-dark': '#C7B597',
        
        // Dark theme  
        charcoal: '#575757',
        'charcoal-light': '#6B6B6B',
        'charcoal-dark': '#434343',
        
        // Accent colors from design
        slate: '#4E6766',
        'slate-light': '#5F7A78',
        'slate-dark': '#3D504E',
        
        ivory: '#F0EDEE',
        'ivory-dark': '#E8E4E5',
        
        // Semantic colors
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};