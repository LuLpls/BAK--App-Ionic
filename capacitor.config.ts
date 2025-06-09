import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.my.shoppinglist',
  appName: 'shoppingList',
  webDir: 'www',
  server: {
    cleartext: true
  }
};

export default config;
