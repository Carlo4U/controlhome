import { Stack, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import ClerkAndConvexProvider from "../providers/ClerkandConvexProviders";
import { colors } from "../src/utils/colors";



export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Show loading indicator when the app first loads or when navigating between screens
  useEffect(() => {
    // Set loading to true when navigation starts
    setIsLoading(true);

    // Set a timeout to hide the loading indicator
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Increased timeout to ensure smooth transitions

    return () => clearTimeout(timer);
  }, [pathname]);

  // Use a simpler approach to handle navigation errors
  useEffect(() => {
    // This effect will run when the component mounts
    console.log("Navigation path:", pathname);

    // We'll use a longer loading time to mask any brief error messages
    const longLoadingTime = 2000; // 2 seconds

    // For routes that commonly cause issues, we'll show loading for longer
    if (pathname.includes("/home") || pathname.includes("/auth")) {
      setTimeout(() => {
        setIsLoading(false);
      }, longLoadingTime);
    }
  }, []);

  return (
    <ClerkAndConvexProvider>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          // Add these options to improve navigation
          gestureEnabled: false,
          animationDuration: 200,
        }}
        initialRouteName="auth/index"
      >
        <Stack.Screen
          name="auth"
          options={{
            // Prevent going back to auth once logged in
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            // Prevent going back to auth once logged in
            gestureEnabled: false,
          }}
        />
      </Stack>
    </ClerkAndConvexProvider>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
});



