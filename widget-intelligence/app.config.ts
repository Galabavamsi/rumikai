import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Widget Intelligence',
  slug: 'widget-intelligence',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#F5F0E8',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.widget.intelligence',
    entitlements: {
      'com.apple.security.application-groups': [
        'group.widget.intelligence',
      ],
    },
  },
  android: {
    package: 'com.widget.intelligence',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#F5F0E8',
    },
    permissions: [
      'READ_CALENDAR',
      'READ_CONTACTS',
      'PACKAGE_USAGE_STATS',
      'ACTIVITY_RECOGNITION',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-calendar',
    'expo-contacts',
    'expo-notifications',
    'expo-router',
    'expo-sqlite',
    'expo-font',
    './plugins/withAndroidWidget',
  ],
  scheme: 'widget-intelligence',
  extra: {
    eas: {
      projectId: 'd9a88098-051d-4bf9-ad74-89e9d291e0fe',
    },
  },
});
