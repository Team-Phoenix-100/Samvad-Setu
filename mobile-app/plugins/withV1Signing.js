const { withAppBuildGradle, withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withV1Signing(config) {
  // 1. Android Manifest: Allow HTTP cleartext traffic for local backend
  config = withAndroidManifest(config, (modConfig) => {
    const mainApplication = modConfig.modResults.manifest.application?.[0];
    if (mainApplication) {
      mainApplication.$['android:usesCleartextTraffic'] = 'true';
    }
    return modConfig;
  });

  // 2. Build Gradle: Force V1 and V2/V3 signing for universal device installation
  config = withAppBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.language === 'groovy') {
      const v1Snippet = `
android {
    signingConfigs {
        debug {
            v1SigningEnabled true
            v2SigningEnabled true
        }
        release {
            v1SigningEnabled true
            v2SigningEnabled true
        }
    }
}
`;
      if (!modConfig.modResults.contents.includes('v1SigningEnabled true')) {
        modConfig.modResults.contents += v1Snippet;
      }
    }
    return modConfig;
  });

  return config;
};
