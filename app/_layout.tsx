import { Stack } from "expo-router";
import ClerkAndConvexProvider from "../providers/ClerkandConvexProviders";

export default function RootLayout() {
  return (
    <ClerkAndConvexProvider>
      <Stack
        screenOptions={{
          headerShown: false
        }}
        initialRouteName="auth/index"
      />
    </ClerkAndConvexProvider>
  );
}



