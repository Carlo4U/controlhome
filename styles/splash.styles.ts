import { Dimensions, StyleSheet } from 'react-native';
import { colors } from '../src/utils/colors';
import { fonts } from '../src/utils/fonts';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 70,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 1,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  charactersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: height * 0.4, // Make container taller
  },
  characterImage: {
    height: 200,
    width: 200, // Make images bigger
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 2,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: fonts.Regular,
    color: colors.primary,
    marginBottom: 10,
    lineHeight: 38,
  },
  subtitleText: {
    fontSize: 15,
    color: '#333',
    paddingHorizontal: 20,
    fontFamily: fonts.Italic,
    marginTop: 5,
    lineHeight: 20,
    marginVertical: 20,
  },
  subtitleText2: {
    fontSize: 15,
    color: '#333',
    paddingHorizontal: 20,
    fontFamily: fonts.Bold,
    marginTop: 5,
    lineHeight: 20,
    marginVertical: 20,
  },
  buttonContainer: {
    width: '80%',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    marginTop: 20,
    height: 60,
    borderRadius: 20,
  },
  loginButtonWrapper:{
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 98,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.SemiBold,
    fontWeight: 'bold',
  },
});
