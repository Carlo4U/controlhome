// Environment configuration for the app
import Constants from 'expo-constants';

// Default values for development
const defaultConfig = {
  convexUrl: "https://eager-otter-724.convex.cloud",
  clerkPublishableKey: "pk_test_ZWFnZXItb3R0ZXItNzI0LmNsZXJrLmFjY291bnRzLmRldiQ",
};

// Get values from environment variables if available
const Config = {
  convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL || defaultConfig.convexUrl,
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 
                       Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY || 
                       defaultConfig.clerkPublishableKey,
};

export default Config;
