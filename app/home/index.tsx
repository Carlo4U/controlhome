import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/utils/colors';

/**
 * This is a redirect component to handle any navigation to /home
 * It automatically redirects to /home/mainscreen which is the actual main screen
 */
export default function HomeIndex() {
  useEffect(() => {
    try {
      // Redirect to mainscreen immediately
      console.log("Redirecting from home index to mainscreen immediately");
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

    // Add a safety timeout to ensure we don't get stuck (shorter timeout)
    const safetyTimer = setTimeout(() => {
      try {
        router.replace('/home/mainscreen');
      } catch (error) {
        console.error("Safety timer navigation failed:", error);
      }
    }, 500);

    return () => clearTimeout(safetyTimer);
  }, []);

  // Show a loading indicator while redirecting
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Loading main screen...</Text>
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
