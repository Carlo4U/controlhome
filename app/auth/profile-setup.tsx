import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../convex/_generated/api';
import { colors } from '../../src/utils/colors';
import { imageToBase64 } from '../../src/utils/imageUtils';

export default function ProfileSetup() {
  const { isSignedIn, userId: clerkUserId } = useAuth();
  const { username, setUsername, email, setEmail, profileImage, setProfileImage } = useUser();
  const [fullname, setFullname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Get user data from Convex
  const userData = useQuery(
    api.users.getUserByClerkId,
    isSignedIn && clerkUserId ? { clerkId: clerkUserId } : "skip"
  );

  // Get the updateProfile mutation from Convex
  const updateProfile = useMutation(api.users.updateProfile);

  // Check if user already has a profile and redirect if needed
  useEffect(() => {
    const checkProfile = async () => {
      try {
        // If not signed in, redirect to login
        if (!isSignedIn) {
          console.log("Not signed in, redirecting to login");
          setIsInitialLoading(false);
          setTimeout(() => {
            router.replace('/auth/login');
          }, 500);
          return;
        }

        // If we have user data from Convex
        if (userData !== undefined) {
          console.log("User data loaded:", userData ? "found" : "not found");

          // If user exists and has already set up their profile (has username and image), redirect to main screen
          if (userData && userData.username && userData.image) {
            console.log("Profile complete, redirecting to main screen");
            setTimeout(() => {
              router.replace('/home/mainscreen');
            }, 500);
          } else if (userData) {
            console.log("Profile incomplete, staying on setup page");
            // Pre-fill form with any existing data
            if (userData.username) setUsername(userData.username);
            if (userData.email) setEmail(userData.email);
            if (userData.fullname) setFullname(userData.fullname);
            if (userData.image) setProfileImage(userData.image);

            // Determine if this is a new user (no username or image yet)
            setIsNewUser(!userData.username || !userData.image);
          } else {
            // userData is null but defined - user doesn't exist in Convex yet
            console.log("User not found in Convex database");
            // Keep default values from UserContext
          }

          setIsInitialLoading(false);
        }
        // If userData is undefined, we're still waiting for the query to complete
      } catch (error) {
        console.error('Error checking profile:', error);
        setIsInitialLoading(false);
        Alert.alert(
          "Error Loading Profile",
          "There was a problem loading your profile. Please try again.",
          [{ text: "OK" }]
        );
      }
    };

    checkProfile();
  }, [userData, isSignedIn]);

  // Function to pick an image from the gallery
  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      // Just store the local URI for now - we'll convert to base64 when saving
      setProfileImage(result.assets[0].uri);
    }
  };

  // Function to take a photo with the camera
  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    // Launch camera
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      // Just store the local URI for now - we'll convert to base64 when saving
      setProfileImage(result.assets[0].uri);
    }
  };

  // Function to show image selection options
  const showImageOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    // Validate inputs
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    if (!fullname.trim()) {
      Alert.alert('Error', 'Full Name is required');
      return;
    }

    // Validate email
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'A valid email address is required');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Saving profile data...');

      // Convert image to base64 if it exists and starts with file://
      let imageData = profileImage;
      if (profileImage && profileImage.startsWith('file://')) {
        try {
          console.log('Converting image to base64...');
          imageData = await imageToBase64(profileImage);
          console.log('Image converted to base64 successfully');
        } catch (imageError) {
          console.error('Error converting image to base64:', imageError);
          Alert.alert('Warning', 'There was an issue processing your profile image. Other changes will still be saved.');
          imageData = null;
        }
      } else if (!profileImage) {
        // If no profile image is set, use a default placeholder
        console.log('No profile image selected, using default');
        // You could set a default image here if needed
      }

      console.log('Updating profile in Convex...');
      // Update profile in Convex database
      await updateProfile({
        username,
        fullname,
        image: imageData || undefined,
        email, // Make sure email is saved
      });

      console.log('Profile updated successfully, navigating to main screen');

      // Add a small delay before navigation to ensure state is updated
      setTimeout(() => {
        // Navigate to main screen
        router.replace('/home/mainscreen');
      }, 500);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(
        'Error',
        'Failed to save profile. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Please provide the following information to complete your profile setup</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureContainer}>
          <TouchableOpacity onPress={showImageOptions} style={styles.profileImageWrapper}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.defaultProfileImage}>
                <Ionicons name="person" size={60} color="#fff" />
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>
            {isNewUser ? "Your Google profile picture will be used by default" : "Add Profile Photo"}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Username <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
          />
          <Text style={styles.helperText}>Required for your profile</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Full Name <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={fullname}
            onChangeText={setFullname}
            placeholder="Enter your full name"
          />
          <Text style={styles.helperText}>Required for your profile</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={email}
            editable={false}
            placeholder="Your email address"
          />
          <Text style={styles.helperText}>Email is automatically set from your Google account</Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Complete Setup</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  defaultProfileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  requiredStar: {
    color: 'red',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
