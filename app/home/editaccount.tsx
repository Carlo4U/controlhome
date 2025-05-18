import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../convex/_generated/api';
import { imageToBase64 } from '../../src/utils/imageUtils';
import { styles } from '../../styles/editaccount.styles';

export default function EditAccount() {
  const { username, setUsername, email, fullname, setFullname, profileImage, setProfileImage } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Log the current email for debugging
  console.log('EditAccount - Current email:', email);

  // Get the updateProfileByEmail mutation from Convex
  const updateProfileByEmail = useMutation(api.users.updateProfileByEmail);

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
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Validate inputs
      if (!username.trim()) {
        Alert.alert('Error', 'Username is required');
        setIsLoading(false);
        return;
      }

      if (!fullname.trim()) {
        Alert.alert('Error', 'Full Name is required');
        setIsLoading(false);
        return;
      }

      // Convert image to base64 if it exists and starts with file://
      let imageData = profileImage;
      if (profileImage && profileImage.startsWith('file://')) {
        try {
          imageData = await imageToBase64(profileImage);
          console.log('Image converted to base64 successfully');
        } catch (imageError) {
          console.error('Error converting image to base64:', imageError);
          Alert.alert('Warning', 'There was an issue processing your profile image. Other changes will still be saved.');
          imageData = null;
        }
      }

      console.log('Attempting to update profile with email:', email);

      // Update profile in Convex database using the new mutation
      const result = await updateProfileByEmail({
        email, // Current email to find the user
        username,
        fullname, // Add fullname to the update
        image: imageData || undefined,
      });

      console.log('Update profile result:', result);

      if (!result.success) {
        throw new Error(result.error || "Failed to update profile");
      }

      // Now the profile image is already saved in context when picked
      Alert.alert('Success', 'Account information updated successfully!');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Account</Text>
        <View style={{ width: 24 }} />
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
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullname}
            onChangeText={setFullname}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={email}
            editable={false}
            placeholder="Your email address"
          />
          <Text style={styles.helperText}>Email cannot be changed</Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}






