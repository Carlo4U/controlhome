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
    logoContainer: {
      alignItems: 'center',
      marginVertical: 30,
    },
    logoText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 10,
      color: '#004d40',
    },
    versionText: {
      fontSize: 16,
      color: '#666',
      marginTop: 5,
    },
    section: {
      marginBottom: 25,
      backgroundColor: '#f9f9f9',
      padding: 15,
      borderRadius: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#004d40',
    },
    sectionText: {
      fontSize: 16,
      lineHeight: 24,
      color: '#333',
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    featureIcon: {
      marginRight: 10,
    },
    featureText: {
      fontSize: 16,
      color: '#333',
    },
    footer: {
      marginTop: 20,
      marginBottom: 40,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
    },
  });
