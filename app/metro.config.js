const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Without this the .tflite files silently do not bundle and inference fails at runtime
// with no error pointing here. See CLAUDE.md gotchas.
config.resolver.assetExts.push('tflite');

// maplibre-gl is `"type": "module"` and its `exports` map offers ONLY the `import` condition — no
// `main`, no `require`, no `browser`. Metro has package-exports resolution on but resolves web with
// `['browser']` alone, so `import('maplibre-gl')` fails at runtime with `Cannot find module`.
// Adding `import` for WEB ONLY is what makes the browser basemap resolve.
//
// Scoped to web deliberately: `unstable_conditionNames` would apply the same preference to the
// native bundle, changing which entry point every ESM-shipping dependency resolves to, days before
// the deliverable's EAS build. Nothing native reads this line.
config.resolver.unstable_conditionsByPlatform = {
  ...config.resolver.unstable_conditionsByPlatform,
  web: [...(config.resolver.unstable_conditionsByPlatform?.web ?? ['browser']), 'import'],
};

module.exports = withNativeWind(config, { input: './src/global.css' });
