import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import ClerkAndConvexProvider from "../providers/ClerkandConvexProviders";
import { colors } from "../src/utils/colors";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Handle initial render to prevent fragment attachment issues
  useEffect(() => {
    console.log("RootLayout: Initial render");

    // Set a shorter initial loading time for better responsiveness
    const initialLoadingTime = 1000; // 1 second

    const timer = setTimeout(() => {
      console.log("RootLayout: Initial loading complete");
      setIsInitialRender(false);
      setIsLoading(false);
    }, initialLoadingTime);

    return () => clearTimeout(timer);
  }, []);

  // Show loading indicator when navigating between screens (after initial render)
  useEffect(() => {
    // Skip during initial render since it's handled by the effect above
    if (isInitialRender) return;

    console.log("RootLayout: Navigation to", pathname);

    // Set loading to true when navigation starts
    setIsLoading(true);

    // Set a timeout to hide the loading indicator
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Very short timeout for better responsiveness

    return () => clearTimeout(timer);
  }, [pathname, isInitialRender]);

  // Special handling for routes that commonly cause issues
  useEffect(() => {
    // Skip during initial render
    if (isInitialRender) return;

    // For routes that commonly cause issues, we'll show loading for longer
    if (pathname.includes("/home") || pathname.includes("/auth/profile-setup")) {
      console.log("RootLayout: Special handling for route:", pathname);

      // Handle homescreen specifically - show loading for longer
      if (pathname.includes("/home/homescreen")) {
        console.log("RootLayout: Handling homescreen route");
        // Redirect to mainscreen immediately
        try {
          router.replace('/home/mainscreen');
        } catch (error) {
          console.error("Error redirecting from homescreen:", error);
        }
        setTimeout(() => {
          setIsLoading(false);
        }, 200); // Very short timeout for homescreen redirects
      } else {
        // Shorter loading time for home routes
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    }
  }, [pathname, isInitialRender, router]);

  // Handle unmatched routes
  useEffect(() => {
    if (isInitialRender) return;

    // If we detect an unmatched route, redirect to a safe route
    if (pathname === "/_sitemap" || pathname === "/_not-found") {
      console.log("RootLayout: Detected unmatched route, redirecting to safe route");
      try {
        router.replace('/home/mainscreen');
      } catch (error) {
        console.error("Error redirecting from unmatched route:", error);
      }
    }
  }, [pathname, isInitialRender, router]);

  return (
    <ClerkAndConvexProvider>
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

      {/* Global loading overlay - placed after Stack to ensure it's on top */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {pathname.includes("/auth/login") ? "Signing in..." :
             pathname.includes("/auth/profile-setup") ? "Loading profile..." :
             pathname.includes("/home/homescreen") ? "Redirecting to main screen..." :
             pathname.includes("/home") ? "Loading..." :
             "Please wait..."}
          </Text>
        </View>
      )}
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
    backgroundColor: "#FFFFFF", // Solid white background to prevent seeing unmatched routes
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999, // Higher z-index to ensure it's on top of everything
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
});



