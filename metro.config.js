const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Alias tslib to its CommonJS build to resolve the __extends destructuring crash on tslib.default
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  tslib: path.resolve(__dirname, "node_modules/tslib/tslib.js"),
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
