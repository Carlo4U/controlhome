import { Dimensions, StyleSheet } from 'react-native';
const { width, height } = Dimensions.get('window');


export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
      backgroundColor: '#004d40',
      padding: 16,
      paddingTop: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      height: 100,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    profilePictureContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    profileImageWrapper: {
      position: 'relative',
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 10,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    defaultProfileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#2196F3',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cameraIconContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#004d40',
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#fff',
    },
    changePhotoText: {
      color: '#004d40',
      fontSize: 16,
      fontWeight: '500',
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      fontWeight: 'bold',
      color: '#333',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: '#f9f9f9',
    },
    saveButton: {
      backgroundColor: '#004d40',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
