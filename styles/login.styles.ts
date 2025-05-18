import { Dimensions, StyleSheet } from 'react-native';
import { colors } from '../src/utils/colors';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },
    // Loading overlay styles
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.primary,
      fontWeight: '500',
    },
    brandSection: {
      alignItems: "center",
      marginTop: height * 0.1,
    },
    logoContainer: {
      width: 60,
      height: 60,
      borderRadius: 18,
      backgroundColor: "rgba(74, 222, 128, 0.15)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    logoImage: {
      width: "50%",
      height: "50%",
      resizeMode: "contain",
    },
    appName: {
      fontSize: 42,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 1,
    },
    tagline: {
      fontSize: 16,
      color: colors.primary,
      opacity: 0.6,
      textAlign: "center",
    },
    illustrationContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    illustration: {
      width: width * 0.75,
      height: width * 0.75,
      maxHeight: 280,
    },
    loginSection: {
      width: "100%",
      paddingHorizontal: 24,
      paddingBottom: 40,
      alignItems: "center",
    },
    googleButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 14,
      marginBottom: 20,
      width: "100%",
      maxWidth: 300,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
    googleButtonDisabled: {
      backgroundColor: '#7aa095', // Lighter shade of the primary color
      opacity: 0.8,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleIconContainer: {
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    googleButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.white,
      marginLeft: 8,
    },
    termsText: {
      textAlign: "center",
      fontSize: 12,
      color: colors.Secondary,
      maxWidth: 280,
    },
});

