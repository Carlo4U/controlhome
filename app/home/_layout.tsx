import { useAuth } from "@clerk/clerk-expo";
import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../../src/utils/colors";

export default function HomeLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Handle initial render to prevent fragment attachment issues
  useEffect(() => {
    if (isInitialRender) {
      // Minimal wait time for better responsiveness
      const timer = setTimeout(() => {
        setIsInitialRender(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isInitialRender]);

  // Handle homescreen route - redirect to mainscreen
  useEffect(() => {
    if (isInitialRender) return;

    if (pathname.includes("/home/homescreen")) {
      console.log("HomeLayout: Detected homescreen route, redirecting to mainscreen");
      try {
        // Use immediate navigation to mainscreen
        router.replace('/home/mainscreen');
      } catch (error) {
        console.error("Error redirecting from homescreen:", error);
      }
    }
  }, [pathname, isInitialRender, router]);

  // Redirect to auth if not signed in
  useEffect(() => {
    // Skip auth check during initial render to prevent navigation issues
    if (isInitialRender) return;

    const checkAuth = async () => {
      // Only redirect if we're fully loaded and definitely not signed in
      if (isLoaded && !isSignedIn) {
        console.log("HomeLayout: User not signed in, redirecting to login");
        setIsNavigating(true);
        try {
          // Use push instead of replace with minimal delay
          setTimeout(() => {
            router.push("/auth/login");
          }, 100);
        } catch (error) {
          console.error("Navigation error:", error);
        } finally {
          // Reset navigation state after a shorter delay
          setTimeout(() => {
            setIsNavigating(false);
          }, 300);
        }
      } else if (isLoaded && isSignedIn) {
        console.log("HomeLayout: User is signed in, staying in home layout");
      }
    };

    checkAuth();
  }, [isSignedIn, isLoaded, router, isInitialRender]);

  // Show loading indicator while checking auth, during navigation, or on initial render
  if (!isLoaded || isNavigating || isInitialRender) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {!isLoaded ? "Loading..." : isNavigating ? "Redirecting..." : "Preparing..."}
        </Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        gestureEnabled: false, // Disable gestures to prevent navigation issues
      }}
    >
      <Stack.Screen
        name="mainscreen"
        options={{
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="homescreen"
        options={{
          animation: "fade",
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
});
