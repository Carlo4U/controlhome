import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import React from "react";
import Config from "../config/environment";
import { UserProvider } from "../contexts/UserContext";

// Use the environment-specific configuration
const convex = new ConvexReactClient(Config.convexUrl, {
  unsavedChangesWarning: false,
});

const publishableKey = Config.clerkPublishableKey;
if (!publishableKey) {
  throw new Error("Missing Clerk Publishable Key in environment configuration");
}

export default function ClerkAndConvexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        <ClerkLoaded>
          <UserProvider>
            {children}
          </UserProvider>
        </ClerkLoaded>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}