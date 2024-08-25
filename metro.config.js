const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("pem", "json", "rawjs", "css");

module.exports = config;
