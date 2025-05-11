import { Dimensions, StyleSheet } from 'react-native';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    header: {
      backgroundColor: '#004d40', // Dark green color from the image
      padding: 16,
      paddingTop: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      height: 100, // Taller header as shown in the image
    },
    headerTitle: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 10, // Add some margin to align with the hamburger menu
    },
    logoutButton: {
      padding: 8,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    blynkButton: {
      backgroundColor: '#2196F3',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      marginBottom: 24,
    },
    blynkButtonText: {
      color: '#fff',
      fontSize: 16,
      marginLeft: 8,
    },
    lightsContainer: {
      backgroundColor: '#fff',
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 16,
    },
    lightSwitchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      backgroundColor: '#f0f0f0', // Light gray background for switches
      marginBottom: 8, // Add spacing between switches
      borderRadius: 8, // Rounded corners
    },
    lightIconContainer: {
      marginRight: 16,
    },
    lightInfoContainer: {
      flex: 1,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    lightLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginRight: 8,
    },
    statusText: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
    helpButton: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      backgroundColor: '#004d40', // Dark green to match header
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 8,
      width: '80%',
      maxWidth: 300,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      borderRadius: 4,
      marginBottom: 10,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      padding: 10,
      borderRadius: 4,
      marginHorizontal: 5,
    },
    cancelButton: {
      backgroundColor: '#ccc',
    },
    saveButton: {
      backgroundColor: '#4CAF50',
    },
    buttonText: {
      color: '#fff',
      textAlign: 'center',
    },
    drawerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      flexDirection: 'row',
    },
    drawerDismiss: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    drawer: {
      width: 280,
      backgroundColor: 'white',
      height: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
    },
    drawerHeader: {
      backgroundColor: '#004d40',
      borderBottomRightRadius: 20,
      paddingBottom: 15,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      paddingTop: 50,
    },
    profileImageContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#2196F3',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    profileIcon: {
      marginLeft: 2, // Fine-tune icon position
    },
    profileTextContainer: {
      flex: 1,
    },
    profileName: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    profileEmail: {
      color: '#fff',
      fontSize: 14,
      opacity: 0.8,
    },
    drawerContent: {
      flex: 1,
    },
    drawerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    drawerItemIconContainer: {
      width: 30,
      marginRight: 15,
    },
    drawerItemText: {
      fontSize: 16,
      color: '#333',
    },
    divider: {
      height: 1,
      backgroundColor: '#e0e0e0',
      marginVertical: 8,
      marginHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginTop: 10,
      marginBottom: 5,
      paddingHorizontal: 20,
    },
    logoutContainer: {
      marginTop: 'auto',
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
      padding: 20,
      paddingTop: 250,
      alignItems: 'center',
    },
    logoutButtonStyle: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoutText: {
      fontSize: 16,
      color: '#333',
      marginLeft: 15,
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
  });

















  
