/**
 * Injects secrets into the static `app.json` at config-evaluation time, so no key is ever
 * committed. Expo merges this on top of app.json automatically.
 *
 * The Google Maps key is baked into AndroidManifest at BUILD time, not read at runtime — so it
 * must be present when `eas build` runs, or the APK ships a permanently grey map and fixing it
 * costs another build.
 *
 * Locally: `app/.env` (gitignored) — Expo CLI loads it before evaluating this file.
 * On EAS:  an EAS secret of the same name, created with
 *          `npx eas-cli secret:create --scope project --name GOOGLE_MAPS_ANDROID_KEY --value <key>`
 *
 * An empty key still builds; it just renders grey. The build log will not warn you.
 */
module.exports = ({ config }) => {
  const androidGoogleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_KEY ?? '';

  config.plugins = (config.plugins ?? []).map((p) =>
    Array.isArray(p) && p[0] === 'react-native-maps'
      ? ['react-native-maps', { ...p[1], androidGoogleMapsApiKey }]
      : p,
  );

  return config;
};
