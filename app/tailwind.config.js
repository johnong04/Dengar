/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Font tokens — names must match the keys registered in src/app/_layout.tsx useFonts().
      // Weight lives in the family name on native; never use font-bold with these.
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
      // Color tokens land after the board is gated (docs/design/design-system.md is draft until then).
    },
  },
  plugins: [],
};
