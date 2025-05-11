import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/fqa.styles';

export default function FAQ() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Manual</Text>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How to use the Smart Home System?</Text>
            <Text style={styles.faqAnswer}>
              1. Toggle lights using the switches{'\n'}
              2. Edit light names by tapping the pencil icon{'\n'}
              3. Log out using the button in top right
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Questions</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I control my lights?</Text>
            <Text style={styles.faqAnswer}>
              You can control your lights by toggling the switches on the main screen. 
              Each switch corresponds to a specific light in your home.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I rename my lights?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you can rename any light by tapping the pencil icon next to its name.
              This allows you to customize your smart home experience.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}></Text>
            <Text style={styles.faqAnswer}>
              
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Support</Text>
          <Text style={styles.supportText}>
            For technical support, please contact:{'\n'}
            Email: support@smarthouse.com{'\n'}
            Phone: +1 (555) 123-4567
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}


