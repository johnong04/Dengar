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
      // Dark-ground citizen palette — docs/design/design-system.md is law for these values.
      // Board screens under src/app/board/* are frozen artifacts and keep their raw hex.
      colors: {
        bg: '#0B0C0E',
        surface: '#141619',
        line: '#26292E',
        ink: '#E9ECEF',
        muted: '#9AA3AD',
        faint: '#5C646E',
        primary: '#4C9FE0',
        alert: '#FF5C49',
        ok: '#35B981',
        caution: '#E8B44C',
        'verdict-aedes': '#7E1B10',
        'verdict-aedes-soft': '#F3C7C0',
        'verdict-aedes-line': '#9E3D30',
        'verdict-quiet': '#1A2030',
        'verdict-quiet-soft': '#B8C1D4',
        'verdict-quiet-muted': '#9FA9BF',
        'verdict-quiet-line': '#333D52',
      },
    },
  },
  plugins: [],
};
