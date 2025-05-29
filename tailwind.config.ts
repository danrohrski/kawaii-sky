import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Kawaii Pastel Palette (Placeholders)
        'pastel-pink': '#FFD1DC',
        'pastel-blue': '#AEC6CF',
        'pastel-green': '#C1E1C1',
        'pastel-yellow': '#FDFD96',
        'pastel-purple': '#D7BDE2',
        'cinnamon-brown': '#D2B48C', // For Cinnamoroll accents
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;
