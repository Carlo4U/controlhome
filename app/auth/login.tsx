import { useSignIn } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from 'convex/react'
import { router, useNavigation, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, LayoutAnimation, Platform, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native'
import { useUser } from '../../contexts/UserContext'
import { api } from '../../convex/_generated/api'
import { colors } from '../../src/utils/colors'
import { styles } from '../../styles/login.styles'

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const login = () => {
    const navigation = useNavigation();
    const route = useRouter();
    const [secureEntry, setSecureEntery] = React.useState(true);
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setUsername, setEmail: setUserEmail, setProfileImage } = useUser();

    // Get Clerk's signin hook
    const { isLoaded, signIn, setActive } = useSignIn();

    // Import the loginUser query from Convex
    const loginUser = useQuery(api.users.loginUser, { email, password });

    useEffect(() => {
      // Set initial tab to login since we're on login screen
      setActiveTab('login');
    }, []);

    const handleLogin = () => {
      // Configure animation before state change
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveTab('login');
      router.push("/auth/login");
    };

    const handleSignup = () => {
      // Configure animation before state change
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveTab('signup');
      router.push("/auth/signup");
    };

    const handleSubmitLogin = async () => {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }

      if (!isLoaded) {
        Alert.alert('Error', 'Authentication system is not ready');
        return;
      }

      try {
        setIsLoading(true);

        // Step 1: Try to sign in with Clerk
        console.log('Attempting to sign in with Clerk...');
        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === 'complete') {
          // Step 2: Set the user as active
          console.log('Setting user as active...');
          await setActive({ session: result.createdSessionId });

          // Step 3: Get user data from Convex
          console.log('Getting user data from Convex...');
          if (loginUser && loginUser.success && loginUser.user) {
            // Update the UserContext with the user data
            setUserEmail(loginUser.user.email || '');
            setUsername(loginUser.user.username || '');
            setProfileImage(loginUser.user.image || null);

            console.log('Login successful! User email set to:', loginUser.user.email);
          } else {
            console.log('User authenticated with Clerk but Convex data not available');
          }

          Alert.alert('Success', 'Login successful!');
          router.push("/home/mainscreen");
        } else {
          console.log('Clerk sign in status:', result.status);
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.error('Login error:', error);

        // Try to login with Convex as fallback
        if (loginUser && loginUser.success && loginUser.user) {
          // Update the UserContext with the user data
          setUserEmail(loginUser.user.email || '');
          setUsername(loginUser.user.username || '');
          setProfileImage(loginUser.user.image || null);

          console.log('Fallback login successful! User email set to:', loginUser.user.email);
          Alert.alert('Success', 'Login successful!');
          router.push("/home/mainscreen");
        } else {
          // Handle specific error messages from the backend
          const errorMessage = loginUser?.error || 'Invalid email or password';
          Alert.alert('Error', errorMessage);

          // If user not found, suggest signing up
          if (errorMessage?.includes('User not found')) {
            setTimeout(() => {
              Alert.alert(
                'Account Not Found',
                'Would you like to create a new account?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Sign Up',
                    onPress: () => router.push("/auth/signup"),
                  },
                ]
              );
            }, 500);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <View style={styles.container}>

      <View style={styles.textcontainer}>
        <Text style={styles.headingText}>Hey,</Text>
        <Text style={styles.headingText}>Welcome</Text>
        <Text style={styles.headingText}>Back</Text>
      </View>
      <View style={styles.loginnow}>
        <Text style={styles.subheadingText}>Login to your account</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name={"mail-open-outline"} size={24} color={colors.Secondary}/>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email"
            placeholderTextColor={colors.Secondary}
            keyboardType='email-address'
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name={"lock-closed-outline"} size={24} color={colors.Secondary}/>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your password"
            placeholderTextColor={colors.Secondary}
            secureTextEntry={secureEntry}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={()=> {
              setSecureEntery((prev) => !prev);
            }}
          >
            <Ionicons name={"eye-outline"} size={20} color={colors.Secondary}/>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButtonWrapper}
          onPress={handleSubmitLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.continueText}>or continue with</Text>

        <TouchableOpacity style={styles.loginnButtonWrapper}>
          <Ionicons name="logo-google" size={24} color={colors.primary} style={styles.googleImage} />
          <Text style={styles.googleText}>Google</Text>
        </TouchableOpacity>

        <View style={styles.footerTextContainer}>
          <Text style={styles.accountText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/auth/signup")}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.authButtonWrapper,
            { backgroundColor: activeTab === 'login' ? colors.primary : 'transparent' },
          ]}
          onPress={handleLogin}
        >
          <Text style={[
            styles.loginButtonText,
            { color: activeTab === 'login' ? colors.white : colors.primary }
          ]}>
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.authButtonWrapper,
            { backgroundColor: activeTab === 'signup' ? colors.primary : 'transparent' }
          ]}
          onPress={handleSignup}
        >
          <Text style={[
            styles.signupButtonText,
            { color: activeTab === 'signup' ? colors.white : colors.primary }
          ]}>
            Sign-Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default login

