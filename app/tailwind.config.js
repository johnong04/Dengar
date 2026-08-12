/** @type {import('tailwindcss').Config} */
const tokens = require('./tailwind.tokens.js');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Font tokens — names must match the keys registered in src/app/_layout.tsx useFonts().
      // Weight lives in the family name on native; never use font-bold with these.
      // IBM Plex Sans + Plex Mono serve BOTH surfaces (citizen dark and officer light) —
      // see design-system.md §Type. Inter is retained only for the frozen B / officer-a..c
      // board artifacts; no shipped screen uses it.
      fontFamily: {
        plex: 'IBMPlexSans_400Regular',
        'plex-medium': 'IBMPlexSans_500Medium',
        'plex-semibold': 'IBMPlexSans_600SemiBold',
        'plex-bold': 'IBMPlexSans_700Bold',
        mono: 'IBMPlexMono_400Regular',
        'mono-medium': 'IBMPlexMono_500Medium',
        inter: 'Inter_400Regular',
        'inter-medium': 'Inter_500Medium',
        'inter-semibold': 'Inter_600SemiBold',
        'inter-bold': 'Inter_700Bold',
      },

      // Palette + radius live in tailwind.tokens.js — ONE source, shared with the
      // /board/tokens swatch probe. Never re-declare a color here.
      borderRadius: tokens.borderRadius,
      colors: tokens.colors,
    },
  },
  plugins: [],
};
