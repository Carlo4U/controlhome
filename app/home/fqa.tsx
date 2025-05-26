import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/fqa.styles';

export default function FAQ() {
  const [question, setQuestion] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSendQuestion = () => {
    if (!question.trim()) {
      Alert.alert('Empty Question', 'Please enter your question before sending.');
      return;
    }

    const email = 'ctrlhomecamp01@gmail.com';
    const subject = 'Question from Smart Home App';
    const body = question;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.canOpenURL(mailtoUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(mailtoUrl);
        } else {
          Alert.alert('Email Not Supported', 'Your device does not support sending emails.');
        }
      })
      .then(() => {
        // Clear the input and show success message
        setQuestion('');
        setShowSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      })
      .catch(error => {
        Alert.alert('Error', 'An error occurred while trying to send your question.');
        console.error('Error opening mail client:', error);
      });
  };

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

          {/* Ask Your Own Question Section */}
          <View style={styles.questionInputContainer}>
            <Text style={styles.questionInputLabel}>Have a question? Ask us directly:</Text>
            <TextInput
              style={styles.questionInput}
              placeholder="Type your question here..."
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={4}
              value={question}
              onChangeText={setQuestion}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendQuestion}>
              <Text style={styles.sendButtonText}>Send to Ctrlhome.</Text>
            </TouchableOpacity>
            {showSuccess && (
              <Text style={styles.successMessage}>
                Your question has been sent successfully!
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Support</Text>
          <Text style={styles.supportText}>
            For technical support, please contact:{'\n'}
            Email support: ctrlhomecamp01@gmail.com{'\n'}
            Phone: +63 (916) 444-7869
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}


