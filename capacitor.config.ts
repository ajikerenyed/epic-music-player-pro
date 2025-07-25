import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.epicmusicpro',
  appName: 'Epic Music Player',
  webDir: 'dist',
  server: {
    url: 'https://17e9ddbf-bcbe-4cc0-b723-3e17310ef558.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#1a1a2e',
      showSpinner: true,
      spinnerColor: '#6366f1'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a2e'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
