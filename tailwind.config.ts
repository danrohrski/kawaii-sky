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
        // Enhanced Kawaii Pastel Palette
        'kawaii-pink': '#FFB6C1', // Soft pink
        'kawaii-lavender': '#E6E6FA', // Light lavender
        'kawaii-mint': '#F0FFF0', // Mint cream
        'kawaii-peach': '#FFEAA7', // Soft peach
        'kawaii-sky': '#E0F6FF', // Very light sky blue
        'kawaii-cream': '#FFF8DC', // Cornsilk cream

        // Text colors - much softer than black
        'kawaii-brown': '#6EB2A0', // Updated to teal-green for primary text
        'kawaii-gray': '#7A94BE', // Updated to blue-grey for secondary text
        'kawaii-purple': '#C8A2C8', // Lilac for accents

        // Game-specific colors
        'cinnamon-brown': '#DEB887', // Lighter burlywood for Cinnamoroll
        'cloud-white': '#FFFAFA', // Snow white for highlights
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
