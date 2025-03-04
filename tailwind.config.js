module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a365d',
          light: '#2c4c7c',
          dark: '#122844'
        },
        secondary: {
          DEFAULT: '#c41e3a',
          light: '#d43353',
          dark: '#a11830'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif']
      },
      animation: {
        'slide': 'slide 20s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        slide: {
          'from': { backgroundPosition: '0 0' },
          'to': { backgroundPosition: '40px 40px' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: [],
}
