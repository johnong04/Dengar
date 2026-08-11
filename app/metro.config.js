const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Without this the .tflite files silently do not bundle and inference fails at runtime
// with no error pointing here. See CLAUDE.md gotchas.
config.resolver.assetExts.push('tflite');

module.exports = withNativeWind(config, { input: './src/global.css' });
