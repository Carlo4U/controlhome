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

  // Redirect to auth if not signed in
  useEffect(() => {
    const checkAuth = async () => {
      // Only redirect if we're fully loaded and definitely not signed in
      if (isLoaded && !isSignedIn) {
        setIsNavigating(true);
        try {
          // Use push instead of replace
          router.push("/auth/login");
        } catch (error) {
          console.error("Navigation error:", error);
        } finally {
          // Reset navigation state after a delay
          setTimeout(() => {
            setIsNavigating(false);
          }, 500);
        }
      }
    };

    checkAuth();
  }, [isSignedIn, isLoaded, router]);

  // Show loading indicator while checking auth or during navigation
  if (!isLoaded || isNavigating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {!isLoaded ? "Loading..." : "Redirecting..."}
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
