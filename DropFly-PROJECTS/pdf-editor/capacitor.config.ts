import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dropfly.pdfeditor',
  appName: 'PDF Doc Sign',
  webDir: 'out',
  ios: {
    contentInset: 'always',
  },
  server: {
    iosScheme: 'capacitor',
  },
};

export default config;
