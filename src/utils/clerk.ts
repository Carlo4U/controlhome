import * as SecureStore from 'expo-secure-store';
import { ClerkProvider } from '@clerk/clerk-expo';
import Constants from 'expo-constants';

// Get the publishable key from environment variables
export const publishableKey = Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY || 
                       process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// This function will be used to securely store the token
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export { ClerkProvider, tokenCache };
