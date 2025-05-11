import { useSignUp } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useMutation } from 'convex/react'
import { router, useNavigation } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, LayoutAnimation, Platform, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native'
import { api } from '../../convex/_generated/api'
import { colors } from '../../src/utils/colors'
import { styles } from '../../styles/login.styles'

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const signup = () => {
    const navigation = useNavigation();
    const [secureEntry, setSecureEntery] = React.useState(true);
    const [activeTab, setActiveTab] = useState('signup');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerification, setShowVerification] = useState(false);

    // Get Clerk's signup hook
    const { isLoaded, signUp, setActive } = useSignUp();

    // Import the createUser mutation from Convex
    const createUser = useMutation(api.users.createUser);

    useEffect(() => {
      // Set initial tab to signup since we're on signup screen
      setActiveTab('signup');
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

    const handleSubmitSignup = async () => {
      if (!username || !email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (password.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters long');
        return;
      }

      if (!isLoaded) {
        Alert.alert('Error', 'Authentication system is not ready');
        return;
      }

      try {
        setIsLoading(true);

        if (!showVerification) {
          // Step 1: Create user in Clerk
          console.log('Creating user in Clerk...');
          await signUp.create({
            emailAddress: email,
            password,
          });

          // Step 2: Prepare verification (email)
          console.log('Preparing email verification...');
          await signUp.prepareEmailAddressVerification({
            strategy: 'email_code',
          });

          // Show verification code input
          setShowVerification(true);
          setIsLoading(false);
          Alert.alert(
            'Verification Required',
            'Please check your email for a verification code and enter it below.'
          );
          return;
        } else {
          // Step 3: Attempt to verify the email with user-provided code
          console.log('Verifying email with code:', verificationCode);
          let verificationComplete = false;
          let sessionId = '';
          let userId = '';

          try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
              code: verificationCode,
            });

            if (completeSignUp.status !== 'complete') {
              console.log('Sign up status:', completeSignUp.status);
              Alert.alert(
                'Verification Failed',
                'The verification code is incorrect. Please check the code and try again.'
              );
              return;
            }

            verificationComplete = true;
            sessionId = completeSignUp.createdSessionId || '';
            userId = completeSignUp.createdUserId || '';

          } catch (error) {
            console.error('Verification error:', error);

            // Check if the error message indicates the verification was already completed
            const verificationError = error as Error;
            if (verificationError.message && verificationError.message.includes('already been verified')) {
              console.log('Verification was already completed, proceeding...');
              verificationComplete = true;

              // Since the verification was already completed, we need to get the session ID
              try {
                // Try to complete the sign-up process
                const signInAttempt = await signUp.attemptEmailAddressVerification({
                  code: verificationCode,
                });

                if (signInAttempt.status === 'complete') {
                  sessionId = signInAttempt.createdSessionId || '';
                  userId = signUp.createdUserId || '';
                }
              } catch (signInError) {
                console.error('Error getting session after verification:', signInError);
                // Even if this fails, we can still proceed with creating the user in Convex
              }
            } else {
              // For other errors, show an alert and return
              Alert.alert(
                'Verification Error',
                verificationError.message || 'Failed to verify email. Please try again.'
              );
              return;
            }
          }

          if (!verificationComplete) {
            Alert.alert(
              'Verification Error',
              'Could not complete verification. Please try again.'
            );
            return;
          }

          // Step 4: Set the user as active if we have a session ID
          if (sessionId) {
            console.log('Setting user as active...');
            try {
              await setActive({ session: sessionId });
            } catch (activeError) {
              console.error('Error setting active session:', activeError);
            }
          }

          // Step 5: Get the Clerk user ID
          const clerkId = userId || signUp.createdUserId || '';
          console.log('User created in Clerk with ID:', clerkId);

          // Step 6: Create user in Convex
          console.log('Creating user in Convex...');
          await createUser({
            username,
            email,
            password,
            clerkId,
            image: undefined,
          });

          Alert.alert('Success', 'Account created successfully!');
          router.push("/auth/login");
        }
      } catch (error) {
        console.error('Signup error:', error);
        Alert.alert('Error', 'Failed to create account. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <View style={styles.container}>

      <View style={styles.textcontainer}>
        <Text style={styles.headingText}>Let’s get</Text>
        <Text style={styles.headingText}>started</Text>
      </View>
      <View style={styles.loginnow}>
        <Text style={styles.subheadingText}>Sign up to your account</Text>
      </View>




      <View style={styles.formContainer}>
        {!showVerification ? (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name={"person-outline"} size={24} color={colors.Secondary}/>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your username"
                placeholderTextColor={colors.Secondary}
                keyboardType='default'
                value={username}
                onChangeText={setUsername}
              />
            </View>

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
          </>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name={"key-outline"} size={24} color={colors.Secondary}/>
              <TextInput
                style={styles.textInput}
                placeholder="Enter verification code from email"
                placeholderTextColor={colors.Secondary}
                keyboardType='number-pad'
                value={verificationCode}
                onChangeText={setVerificationCode}
              />
            </View>
            <TouchableOpacity
              onPress={async () => {
                if (!isLoaded) {
                  Alert.alert('Error', 'Authentication system is not ready');
                  return;
                }

                try {
                  setIsLoading(true);
                  await signUp.prepareEmailAddressVerification({
                    strategy: 'email_code',
                  });
                  Alert.alert(
                    'Code Resent',
                    'A new verification code has been sent to your email.'
                  );
                } catch (error) {
                  console.error('Error resending code:', error);
                  Alert.alert(
                    'Error',
                    'Failed to resend verification code. Please try again.'
                  );
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <Text style={{ color: colors.primary, textAlign: 'right', marginTop: 8 }}>
                Resend Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // Reset the verification state to start over
                setShowVerification(false);
                setVerificationCode('');
              }}
            >
              <Text style={{ color: colors.Secondary, textAlign: 'right', marginTop: 8 }}>
                Start Over
              </Text>
            </TouchableOpacity>
          </>
        )}



        <TouchableOpacity
          style={styles.loginButtonWrapper}
          onPress={handleSubmitSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginText}>
              {showVerification ? 'Verify Email' : 'Signup'}
            </Text>
          )}
        </TouchableOpacity>


        <View style={styles.footerTextContainer}>
          <Text style={styles.accountText}>Already have an account?</Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.signupText}>Login</Text>
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

export default signup

