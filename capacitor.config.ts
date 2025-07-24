import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.17e9ddbfbcbe4cc0b7233e17310ef558',
  appName: 'soundscape-sonic-studio',
  webDir: 'dist',
  server: {
    url: 'https://17e9ddbf-bcbe-4cc0-b723-3e17310ef558.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false
    }
  }
};

export default config;