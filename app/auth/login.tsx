import { colors } from '@/src/utils/colors'
import { useAuth, useSSO } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from 'convex/react'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native'
import { api } from '../../convex/_generated/api'
import { styles } from '../../styles/login.styles'

const signin = () => {
    const { startSSOFlow } = useSSO()
    const { isSignedIn, signOut, userId: clerkUserId } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)

    // Get user data from Convex if signed in
    const userData = useQuery(
      api.users.getUserByClerkId,
      isSignedIn && clerkUserId ? { clerkId: clerkUserId } : "skip"
    )

    // Check if user is already signed in when component mounts
    useEffect(() => {
      const checkAuthStatus = async () => {
        setIsCheckingAuth(true)
        try {
          if (isSignedIn) {
            // Check if user has completed profile setup
            if (userData) {
              // If user doesn't have a username or profile image, they need to complete setup
              if (!userData.username || !userData.image) {
                router.navigate("/auth/profile-setup")
              } else {
                // User is already signed in and has completed profile setup, redirect to main screen
                router.navigate("/home/mainscreen")
              }
            } else {
              // Wait for userData to load
              console.log("Waiting for user data to load...")
            }
          }
        } catch (error) {
          console.error("Error checking auth status:", error)
        } finally {
          if (!isSignedIn) {
            setIsCheckingAuth(false)
          } else if (userData !== undefined) {
            setIsCheckingAuth(false)
          }
        }
      }

      checkAuthStatus()
    }, [isSignedIn, router, userData])

    const handleGoogleSignIn = async () => {
      if (isLoading) return; // Prevent multiple clicks

      setIsLoading(true)
      try {
        // If user is already signed in, sign them out first to prevent the "already signed in" error
        if (isSignedIn) {
          await signOut()
        }

        // Start the OAuth flow
        const { createdSessionId, setActive } = await startSSOFlow({ strategy: 'oauth_google' })

        if (setActive && createdSessionId) {
          try {
            // First set the active session
            await setActive({ session: createdSessionId })

            // Show loading state for a moment to ensure auth state is fully established
            // This helps prevent the unmatched route error
            setTimeout(() => {
              try {
                // Redirect to profile setup page for new users
                router.navigate("/auth/profile-setup")
              } catch (navError) {
                console.error("Navigation error:", navError)
                // If that fails, try again with a delay
                setTimeout(() => {
                  router.navigate("/auth/profile-setup")
                }, 2000)
              }
            }, 2000) // Increased delay to ensure auth state is fully established
          } catch (sessionError) {
            console.error("Session activation error:", sessionError)
            setIsLoading(false)
            Alert.alert("Error", "Failed to activate session. Please try again.")
          }
        }
      } catch (error) {
        console.log("OAuth error:", error)
        setIsLoading(false) // Reset loading state on error

        // Check if the error message contains "already signed in"
        const errorStr = String(error)
        if (errorStr.includes("already signed in")) {
          Alert.alert(
            "Already Signed In",
            "You're already signed in. Redirecting to profile setup.",
            [{
              text: "OK",
              onPress: () => {
                // Redirect to profile setup page
                router.navigate("/auth/profile-setup")
              }
            }]
          )
        } else {
          // For other errors, show a generic message
          Alert.alert("Sign In Error", "There was a problem signing in. Please try again.")
        }
      }
    }

  return (
    <View style={styles.container}>
      {/* Full-screen loading overlay when checking auth */}
      {isCheckingAuth && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
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

      {/* Login */}
      <View style={styles.loginSection}>
        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
          onPress={handleGoogleSignIn}
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

export default signin
