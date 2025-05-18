import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../src/utils/colors';
import { styles } from '../../styles/splash.styles';

export default function Index() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = () => {
    setActiveTab('signin');
    // Fix the route path to match file structure
    router.push("/auth/login");
  };

  {/*const handleSignup = () => {
    setActiveTab('signup');
    // Fix the route path to match file structure
    router.push("/auth/signup");
  };*/}

  return (
    <View style={styles.container}>

      <View style={styles.background} />


      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/ctrl-logoo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>


      <View style={styles.charactersContainer}>
        <Image
          source={require('../../assets/splash/Casual_Boy_Celebrating.png')}
          style={[styles.characterImage, { marginRight: -40 }]}
          resizeMode="contain"
        />
        <Image
          source={require('../../assets/splash/Casual_Boy.png')}
          style={[styles.characterImage, { marginLeft: -40 }]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.welcomeText}>Welcome{'\n'}Home!</Text>
        <Text style={styles.subtitleText}>Click the button below to start your{'\n'}</Text>
        <Text style={styles.subtitleText2}>CTRLHOME</Text>
      </View>


      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.loginButtonWrapper,
            { backgroundColor: activeTab === 'start' ? colors.primary : 'transparent' },
          ]}
          onPress={handleLogin}
        >
          <Text style={[
            styles.loginButtonText,

          ]}>
            Start
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}













