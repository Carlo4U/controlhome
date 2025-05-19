import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Linking,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { styles } from '../../styles/mainscreen.styles';
export default function MainScreen() {
  const { profileImage, username, email } = useUser();
  const { signOut } = useAuth();
  console.log("Profile image in MainScreen:", profileImage);
  const [lightStates, setLightStates] = useState({
    'V1': false,
    'V2': false,
    'V3': false,
    'V4': false,
    'V5': false,
    'V6': false,
  });

  const [lightLabels, setLightLabels] = useState({
    'V1': "Bedroom Light",
    'V2': "Stairs Light",
    'V3': "Dining Room Light",
    'V4': "Foyer Light",
    'V5': "Front Door Light",
    'V6': "Tree Light",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newLabel, setNewLabel] = useState('');

  // Add state for drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;

  // Define toggleDrawer function
  const toggleDrawer = () => {
    if (drawerVisible) {
      // Close drawer
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true
      }).start(() => setDrawerVisible(false));
    } else {
      // Open drawer
      setDrawerVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  };

  const authToken = 'A-AELA4LGPRcAAfmzmFmDXIAshsyG5CN';
  const blynkUrl = "https://blynk.cloud/dashboard/750179/dashboards/id-16673s";

  // Launch Blynk dashboard in browser
  const launchBlynk = async () => {
    try {
      const supported = await Linking.canOpenURL(blynkUrl);
      if (supported) {
        await Linking.openURL(blynkUrl);
      } else {
        Alert.alert('Error', `Cannot open URL: ${blynkUrl}`);
      }
    } catch (error) {
      Alert.alert('Error', `Could not launch ${blynkUrl}`);
    }
  };

  // Toggle Blynk Virtual Pin
  interface ToggleLightResponse {
    ok: boolean;
    status: number;
  }

  interface LightState {
    V1: boolean;
    V2: boolean;
    V3: boolean;
    V4: boolean;
    V5: boolean;
    V6: boolean;
  }

  const toggleLight = async (pin: string, value: boolean): Promise<void> => {
    const blynkValue: number = value ? 1 : 0;
    const url: string = `https://blynk.cloud/external/api/update?token=${authToken}&pin=${pin}&value=${blynkValue}`;

    try {
      const response: Response = await fetch(url);

      if (response.ok) {
        setLightStates((prevStates: LightState) => ({
          ...prevStates,
          [pin]: value
        }));
      } else {
        Alert.alert('Error', `Failed to control ${pin}`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      Alert.alert('Error', `Network error: ${err.message}`);
    }
  };

  interface LightLabels {
      V1: string;
      V2: string;
      V3: string;
      V4: string;
      V5: string;
      V6: string;
    }

  interface AlertButton {
    text: string;
    style?: 'cancel';
    onPress?: (value?: string) => void;
  }

  const editLabelDialog = (pin: string): void => {
    setCurrentPin(pin);
    setNewLabel(lightLabels[pin as keyof typeof lightLabels]);
    setModalVisible(true);
  };

  const saveNewLabel = (): void => {
    if (newLabel.trim()) {
      setLightLabels((prevLabels: LightLabels) => ({
        ...prevLabels,
        [currentPin]: newLabel.trim()
      }));
    }
    setModalVisible(false);
  };



  // Navigation functions
  const navigateToEditAccount = () => {
    toggleDrawer(); // Close drawer first
    router.push('/home/editaccount');
  };

  const navigateToAboutUs = () => {
    toggleDrawer(); // Close drawer first
    router.push('/home/aboutus');
  };

  const handleLogout = async () => {
    try {
      toggleDrawer(); // Close drawer first

      // Sign out from Clerk before navigating
      await signOut();

      // Navigate to auth screen after successful sign out
      // Use navigate instead of replace to avoid routing issues
      router.navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  // Add a new navigation function for FAQ
  const navigateToFAQ = () => {
    toggleDrawer(); // Close drawer first
    router.push('/home/fqa');
  };

  interface LightLabel {
    [key: string]: string;
  }

  interface LightSwitchProps {
    pin: string;
    state: boolean;
    label: string;
    onToggle: (pin: string, value: boolean) => void;
    onEditLabel: (pin: string) => void;
  }

  const buildLightSwitch = (pin: string): React.ReactElement => {
    return (
      <View key={pin} style={styles.lightSwitchContainer}>
        <View style={styles.lightIconContainer}>
          <Ionicons
            name={lightStates[pin as keyof typeof lightStates] ? "bulb" : "bulb-outline"}
            size={24}
            color={lightStates[pin as keyof typeof lightStates] ? "#FFD700" : "#888"}
          />
        </View>
        <View style={styles.lightInfoContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.lightLabel}>{lightLabels[pin as keyof typeof lightLabels]}</Text>
            <TouchableOpacity onPress={() => editLabelDialog(pin)}>
              <Ionicons name="pencil-outline" size={20} color="#555" />
            </TouchableOpacity>
          </View>
          <Text style={styles.statusText}>{lightStates[pin as keyof typeof lightStates] ? "ON" : "OFF"}</Text>
        </View>
        <Switch
          value={lightStates[pin as keyof typeof lightStates]}
          onValueChange={(value: boolean) => toggleLight(pin, value)}
          trackColor={{ false: "#e0e0e0", true: "#00c853" }} // Light gray when off, green when on
          thumbColor={lightStates[pin as keyof typeof lightStates] ? "#ffffff" : "#f4f3f4"} // White thumb
          ios_backgroundColor="#e0e0e0"
        />
      </View>
    );
  };

  // Remove this function as it's now in the FAQ screen
  // const showManualGuide = () => { ... };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Home System</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.lightsContainer}>
          {Object.keys(lightStates).map(pin => buildLightSwitch(pin))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.helpButton}
        onPress={navigateToFAQ}
      >
        <Ionicons name="help-circle" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Edit Label Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Light Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newLabel}
              onChangeText={setNewLabel}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveNewLabel}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Navigation Drawer */}
      {drawerVisible && (
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerDismiss}
            onPress={toggleDrawer}
          />
          <Animated.View
            style={[
              styles.drawer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            {/* User Profile Section */}
            <View style={styles.drawerHeader}>
              <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <Ionicons name="person" size={40} color="#fff" style={styles.profileIcon} />
                  )}
                </View>
                <View style={styles.profileTextContainer}>
                  <Text style={styles.profileName}>{username}</Text>
                  <Text style={styles.profileEmail}>{email}</Text>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.drawerContent}>
              {/* FAQ Section */}
              <TouchableOpacity style={styles.drawerItem} onPress={navigateToFAQ}>
                <View style={styles.drawerItemIconContainer}>
                  <Ionicons name="document-text-outline" size={24} color="#333" />
                </View>
                <Text style={styles.drawerItemText}>FAQ</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Account Section */}
              <Text style={styles.sectionTitle}>Account</Text>
              <TouchableOpacity style={styles.drawerItem} onPress={navigateToEditAccount}>
                <View style={styles.drawerItemIconContainer}>
                  <Ionicons name="create-outline" size={24} color="#333" />
                </View>
                <Text style={styles.drawerItemText}>Edit Account</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* About Us Section */}
              <Text style={styles.sectionTitle}>About us</Text>
              <TouchableOpacity style={styles.drawerItem} onPress={navigateToAboutUs}>
                <View style={styles.drawerItemIconContainer}>
                  <Ionicons name="information-circle-outline" size={24} color="#333" />
                </View>
                <Text style={styles.drawerItemText}>About smart home</Text>
              </TouchableOpacity>

              {/* Logout at the bottom */}
              <View style={styles.logoutContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={24} color="#333" />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </View>
  );
}


