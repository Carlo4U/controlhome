import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/utils/colors';

/**
 * This is a redirect component to handle any navigation to /home/homescreen
 * It automatically redirects to /home/mainscreen which is the actual main screen
 */
export default function HomeScreen() {
  // Use immediate redirect without delay
  useEffect(() => {
    try {
      console.log("Redirecting from homescreen to mainscreen immediately");
      // Use immediate navigation to mainscreen
      router.replace('/home/mainscreen');
    } catch (error) {
      console.error("Error redirecting to mainscreen:", error);
      // Fallback with minimal timeout if immediate redirect fails
      setTimeout(() => {
        try {
          router.replace('/home/mainscreen');
        } catch (fallbackError) {
          console.error("Fallback navigation failed:", fallbackError);
        }
      }, 100);
    }
  }, []);

  // Show a loading indicator while redirecting
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Redirecting to main screen...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
});
