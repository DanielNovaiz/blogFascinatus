/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Branco gelo - fundos principais
        ivory: {
          50: '#fefefe',
          100: '#faf9f7',
          200: '#f5f3ef',
          300: '#ede9e2',
        },
        // Amarelo palha - destaques quentes suaves
        straw: {
          50: '#fdfcf5',
          100: '#f9f5e3',
          200: '#f2ebc7',
          300: '#e8dda0',
          400: '#dcc873',
          500: '#c9b350',
          600: '#a89440',
        },
        // Bege - base neutra terrosa
        beige: {
          50: '#fdfbf7',
          100: '#f7f2e9',
          200: '#ece2d1',
          300: '#deccb0',
          400: '#d1b892',
          500: '#c4a57a',
          600: '#a88b62',
          700: '#8b7152',
          800: '#705a45',
          900: '#564435',
        },
        // Marrom - textos e elementos fortes
        earth: {
          50: '#f9f6f2',
          100: '#efe8df',
          200: '#e0d0c0',
          300: '#cbb59d',
          400: '#b89778',
          500: '#a47d5a',
          600: '#8a6649',
          700: '#70523d',
          800: '#594335',
          900: '#433025',
        },
        // Laranja fraco/peach - acentos quentes delicados
        peach: {
          50: '#fdf8f5',
          100: '#f9ebe4',
          200: '#f2d5c7',
          300: '#e8b8a3',
          400: '#d99578',
          500: '#c97a58',
          600: '#a86245',
          700: '#855038',
          800: '#6b4232',
          900: '#523528',
        },
        // Lilás sutil - toques femininos suaves
        lilac: {
          50: '#fdfbfd',
          100: '#f7f0f7',
          200: '#ede0ed',
          300: '#dec8de',
          400: '#c8a8c8',
          500: '#b088b0',
          600: '#966a96',
          700: '#7a557a',
          800: '#614661',
          900: '#4a364a',
        },
        // Verde claro - frescor natural
        mint: {
          50: '#f6faf7',
          100: '#e8f5ea',
          200: '#c8e8cd',
          300: '#9dd6a6',
          400: '#72bf7e',
          500: '#4ca85c',
          600: '#3a8a48',
          700: '#306e3b',
          800: '#275731',
          900: '#1f4226',
        },
        // Verde escuro - profundidade e contraste
        forest: {
          50: '#f0f4f1',
          100: '#dce8de',
          200: '#b8d2bd',
          300: '#8eb596',
          400: '#669872',
          500: '#467a53',
          600: '#356240',
          700: '#2a4f34',
          800: '#21402a',
          900: '#193122',
        },
      },
      fontFamily: {
        sans: ['var(--font-space_grotesk)', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
