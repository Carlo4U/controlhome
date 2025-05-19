import { colors } from '@/src/utils/colors'
import { useAuth, useSSO } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from 'convex/react'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { api } from '../../convex/_generated/api'
import { styles } from '../../styles/login.styles'

const signin = () => {
    const { startSSOFlow } = useSSO()
    const { isSignedIn, signOut, userId: clerkUserId } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const [showError, setShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [authCancelled, setAuthCancelled] = useState(false)

    // Get user data from Convex if signed in
    const userData = useQuery(
      api.users.getUserByClerkId,
      isSignedIn && clerkUserId ? { clerkId: clerkUserId } : "skip"
    )

    // Instead of using global error handlers, we'll focus on handling specific errors
    // in the authentication flow and improving the component's resilience

    // This useEffect will handle cleanup of any stale state when the component unmounts
    useEffect(() => {
      return () => {
        // Ensure we clean up any state when component unmounts
        setIsLoading(false);
        setShowError(false);
        setAuthCancelled(false);
      };
    }, []);

    // This useEffect will automatically clear the authentication cancelled message after a few seconds
    useEffect(() => {
      if (authCancelled) {
        // Set a timeout to clear the message after 5 seconds
        const timer = setTimeout(() => {
          setAuthCancelled(false);
        }, 5000);

        // Clean up the timer if the component unmounts or authCancelled changes
        return () => clearTimeout(timer);
      }
    }, [authCancelled]);

    // Check if user is already signed in when component mounts
    useEffect(() => {
      const checkAuthStatus = async () => {
        setIsCheckingAuth(true)
        try {
          if (isSignedIn) {
            // Check if user has completed profile setup
            if (userData !== undefined) {
              // If user doesn't have a username or profile image, they need to complete setup
              if (!userData || !userData.username || !userData.image) {
                console.log("Redirecting to profile setup: incomplete profile")
                setTimeout(() => {
                  try {
                    // Use replace instead of navigate to reset the navigation stack
                    router.replace("/auth/profile-setup")
                  } catch (navError) {
                    console.error("Navigation error:", navError)
                    // Just stay on the current screen if navigation fails
                  }
                }, 1000) // Longer delay for better reliability
              } else {
                // User is already signed in and has completed profile setup, redirect to main screen
                console.log("Redirecting to main screen: complete profile")
                setTimeout(() => {
                  try {
                    // Use replace instead of navigate to reset the navigation stack
                    router.replace("/home/mainscreen")
                  } catch (navError) {
                    console.error("Navigation error:", navError)
                    // Just stay on the current screen if navigation fails
                  }
                }, 1000) // Longer delay for better reliability
              }
              setIsCheckingAuth(false)
            } else {
              // Wait for userData to load
              console.log("Waiting for user data to load...")
              // Don't set isCheckingAuth to false yet - we're still waiting for data
            }
          } else {
            setIsCheckingAuth(false)
          }
        } catch (error) {
          console.error("Error checking auth status:", error)
          setIsCheckingAuth(false)
        }
      }

      checkAuthStatus()
    }, [isSignedIn, router, userData])

    const handleGoogleSignIn = async () => {
      if (isLoading) return; // Prevent multiple clicks

      // Hide any existing error screens first
      setShowError(false);
      setIsLoading(true)

      try {
        // If user is already signed in, sign them out first to prevent the "already signed in" error
        if (isSignedIn) {
          try {
            await signOut()
          } catch (signOutError) {
            console.error("Error signing out:", signOutError)
            // Continue anyway - we'll handle any issues in the OAuth flow
          }
        }

        // Start the OAuth flow
        console.log("Starting OAuth flow with Google...")
        let result;
        try {
          result = await startSSOFlow({ strategy: 'oauth_google' })
          console.log("OAuth flow completed, checking result:", result ? "Result received" : "No result")
        } catch (oauthError) {
          // Handle specific OAuth flow errors
          console.error("OAuth flow error:", oauthError)

          // Reset loading state immediately for all errors
          setIsLoading(false)

          const errorStr = String(oauthError)

          // Check if this is a user cancellation
          if (errorStr.includes("canceled") || errorStr.includes("cancelled") ||
              errorStr.includes("abort") || errorStr.includes("user_cancel")) {
            console.log("User cancelled the Google sign-in process")

            // Instead of showing an error screen, set the authCancelled state
            // and navigate back to the login screen
            setAuthCancelled(true);
            setIsLoading(false);

            // No need to show the error screen
            return
          }

          // For other OAuth flow errors
          setIsLoading(false)
          // Show error screen with white background instead of alert
          setErrorMessage("There was a problem connecting to Google. Please check your internet connection and try again.")
          setShowError(true)
          return
        }

        // Check if we received a result at all
        if (!result) {
          console.error("No result from OAuth flow")
          setIsLoading(false)
          // Show error screen with white background instead of alert
          setErrorMessage("No response received from Google. Please tap 'Cancel' to return to the login screen and try again.")
          setShowError(true)
          return
        }

        const { createdSessionId, setActive } = result

        // Log the session ID issue for debugging
        if (!createdSessionId) {
          console.error("Session ID is missing from OAuth result")
        }

        // Log the values to help with debugging
        console.log("Session ID:", createdSessionId ? "Received" : "Missing")
        console.log("setActive function:", setActive ? "Received" : "Missing")

        if (setActive && createdSessionId) {
          try {
            console.log("Activating session...")
            // First set the active session
            await setActive({ session: createdSessionId })

            // Show loading state for a moment to ensure auth state is fully established
            // This helps prevent the unmatched route error
            console.log("Session activated, waiting before navigation...")

            // Use a longer delay to ensure auth state is fully established
            setTimeout(() => {
              try {
                console.log("Attempting to navigate to profile setup...")
                // First reset any error state
                setShowError(false);

                // Use replace instead of navigate to reset the navigation stack
                // This helps prevent fragment attachment errors
                router.replace("/auth/profile-setup")
              } catch (navError) {
                console.error("Navigation error:", navError)
                // Show error screen with white background instead of alert
                setIsLoading(false)
                setErrorMessage("Having trouble navigating to the profile setup page. Please tap 'Cancel' to return to the login screen and try again.")
                setShowError(true)
              }
            }, 3500) // Increased delay to ensure auth state is fully established
          } catch (sessionError) {
            console.error("Session activation error:", sessionError)
            setIsLoading(false)

            // Check if the error is related to missing session ID
            const errorStr = String(sessionError)
            if (errorStr.includes("session") && errorStr.includes("missing")) {
              // Instead of showing an error message, set the authCancelled state
              setAuthCancelled(true);
              setIsLoading(false);

              // Navigate back to login screen
              try {
                router.push("/auth/login");
              } catch (navError) {
                console.error("Navigation error:", navError);
              }

              return; // Skip showing the error screen
            } else {
              setErrorMessage("Failed to activate session. Please tap 'Cancel' to return to the login screen and try again.")
              setShowError(true);
            }
          }
        } else {
          // Provide more specific error messages based on what's missing
          let message = "Failed to complete authentication. ";

          if (!createdSessionId && !setActive) {
            console.error("Both session ID and setActive function are missing")
            // Instead of showing an error message, set the authCancelled state
            setAuthCancelled(true);
            setIsLoading(false);

            // Navigate back to login screen
            try {
              router.push("/auth/login");
            } catch (navError) {
              console.error("Navigation error:", navError);
            }

            return; // Skip showing the error screen
          } else if (!createdSessionId) {
            console.error("Session ID is missing")
            // Instead of showing an error message, set the authCancelled state
            setAuthCancelled(true);
            setIsLoading(false);

            // Navigate back to login screen
            try {
              router.push("/auth/login");
            } catch (navError) {
              console.error("Navigation error:", navError);
            }

            return; // Skip showing the error screen
          } else if (!setActive) {
            console.error("setActive function is missing")
            message += "Unable to activate your session. Please tap 'Cancel' to return to the login screen and try again."
          }

          setIsLoading(false)
          // Show error screen with white background instead of alert
          setErrorMessage(message)
          setShowError(true)
        }
      } catch (error) {
        console.log("OAuth error:", error)
        setIsLoading(false) // Reset loading state on error

        // Check if the error message contains "already signed in"
        const errorStr = String(error)
        if (errorStr.includes("already signed in")) {
          // Instead of using Alert which might cause navigation issues,
          // use our custom error screen
          setErrorMessage("You're already signed in. Tap 'Try Again' to continue to your profile.")
          setShowError(true)

          // Set a flag to indicate we should navigate to profile setup on retry
          // This is safer than trying to navigate directly from an alert
          setIsLoading(false)
        } else {
          // For other errors, show a more detailed message with option to try again
          // Note: We don't need to check for cancellation here as it's handled in the OAuth flow try/catch
          setErrorMessage("There was a problem with the authentication process. Please try again.")
          setShowError(true)
        }
      }
    }

  return (
    <View style={styles.container}>
      {/* Full-screen loading overlay when checking auth */}
      {isCheckingAuth && (
        <View style={[styles.loadingOverlay, { backgroundColor: '#FFFFFF' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      )}

      {/* Error screen with white background */}
      {showError && (
        <ErrorScreen
          message={errorMessage}
          onRetry={() => {
            // First hide the error screen
            setShowError(false);
            // Wait a moment before retrying to ensure UI is updated
            setTimeout(() => {
              try {
                // Reset any loading state before retrying
                setIsLoading(false);
                // Then try sign-in again
                handleGoogleSignIn();
              } catch (error) {
                console.error("Error retrying sign-in:", error);
                // If retry fails, show error again
                setErrorMessage("Unable to retry sign-in. Please try again later.");
                setShowError(true);
              }
            }, 500); // Slightly longer delay for better reliability
          }}
          onCancel={() => {
            // First hide the error screen and reset all states
            setShowError(false);
            setIsLoading(false);
            setErrorMessage("");

            // Set the authCancelled state to true to show the message on the login screen
            setAuthCancelled(true);

            // Reset any pending auth state
            try {
              // Use router.replace to ensure we're on the login screen
              // This helps prevent the "Unmatched Route" error
              console.log("Cancelling authentication and returning to login screen");

              // First try to sign out if the user is signed in
              // This helps clear any partial authentication state
              if (isSignedIn) {
                try {
                  signOut().catch(err => console.error("Error signing out:", err));
                } catch (signOutError) {
                  console.error("Error during sign out:", signOutError);
                  // Continue with navigation even if sign out fails
                }
              }

              // Add a small delay before navigation to ensure UI state is updated
              setTimeout(() => {
                try {
                  // Use push instead of replace for more reliable navigation
                  // Go directly to login instead of index to avoid type errors
                  router.push("/auth/login");

                  // No need for a second navigation
                } catch (navError) {
                  console.error("Delayed navigation error:", navError);

                  // If navigation fails, try a different approach
                  try {
                    // Try direct navigation to login as a fallback
                    router.push("/auth/login");
                  } catch (fallbackError) {
                    console.error("Fallback navigation failed:", fallbackError);
                  }
                }
              }, 300);
            } catch (error) {
              console.error("Navigation error during cancel:", error);
              // If navigation fails, at least make sure we're not showing errors or loading
              setShowError(false);
              setIsLoading(false);
            }
          }}
        />
      )}

      {/* Control home logo */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/ctrl-logoo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Ctrl Home</Text>
        <Text style={styles.tagline}>Control your home, from anywhere.</Text>
      </View>

      {/* icon-logo */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../assets/images/icon-logo.png')}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>

      {/* Authentication cancelled message */}
      {authCancelled && (
        <View style={styles.authCancelledContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.authCancelledText}>Authentication cancelled or failed. Please try again.</Text>
        </View>
      )}

      {/* Login */}
      <View style={styles.loginSection}>
        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
          onPress={() => {
            // Clear the cancelled message when trying to sign in again
            setAuthCancelled(false);
            handleGoogleSignIn();
          }}
          activeOpacity={0.9}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.googleButtonText}>Signing in...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <View style={styles.googleIconContainer}>
                <Ionicons name="logo-google" size={24} color={colors.white} />
              </View>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.termsText}>By signing in, you agree to our Terms of Service and Privacy Policy.</Text>
      </View>
    </View>
  )
}

// Error handling component with white background
// Simplified to avoid navigation issues
interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
  onCancel: () => void;
}

const ErrorScreen = ({ message, onRetry, onCancel }: ErrorScreenProps) => {
  // Use a simpler layout to prevent fragment attachment issues
  return (
    <View style={errorStyles.container}>
      <View style={errorStyles.content}>
        <Ionicons name="alert-circle" size={60} color={colors.primary} style={errorStyles.icon} />
        <Text style={errorStyles.title}>Authentication Error</Text>
        <Text style={errorStyles.message}>{message}</Text>
        <View style={errorStyles.buttonContainer}>
          <TouchableOpacity
            style={errorStyles.retryButton}
            onPress={() => {
              // Wrap in try/catch to prevent any errors from propagating
              try {
                onRetry();
              } catch (error) {
                console.error("Error in retry button:", error);
              }
            }}
          >
            <Text style={errorStyles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={errorStyles.cancelButton}
            onPress={() => {
              // Wrap in try/catch to prevent any errors from propagating
              try {
                // Call the onCancel function which will handle navigation
                onCancel();
              } catch (error) {
                console.error("Error in cancel button:", error);
                // We can't use router here directly, so just log the error
                // The parent component's onCancel should handle navigation
              }
            }}
          >
            <Text style={errorStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Styles for the error screen
const errorStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Higher z-index to ensure it's on top
    elevation: 10, // For Android
  },
  content: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default signin
