import { Dimensions, StyleSheet } from 'react-native';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    header: {
      backgroundColor: '#004d40',
      paddingTop: 50,
      paddingBottom: 15,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerTitle: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    backButton: {
      padding: 5,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    section: {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#004d40',
    },
    faqItem: {
      marginBottom: 16,
    },
    faqQuestion: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#333',
    },
    faqAnswer: {
      fontSize: 14,
      lineHeight: 20,
      color: '#555',
    },
    supportText: {
      fontSize: 14,
      lineHeight: 20,
      color: '#555',
    },
  });
