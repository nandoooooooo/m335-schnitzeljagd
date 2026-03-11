import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'm335-schnitzeljagd',
  webDir: 'www',
  plugins: {
    StatusBar: {
      overlaysWebView: true,
    },
  },
};

export default config;
