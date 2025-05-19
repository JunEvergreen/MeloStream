import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.melostream.app',
  appName: 'MeloStream',
  webDir: 'www',
  plugins: {
    App: {
      url: 'melostream',
      androidScheme: 'melostream'
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerStyle: 'large',
      spinnerColor: '#000000',
    },
  },
};

export default config;
