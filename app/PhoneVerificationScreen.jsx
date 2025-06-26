import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import { useRouter } from 'expo-router';

const PhoneVerificationScreen = () => {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Send Code, 2: Verify Code
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!phoneNumber) {
      return Alert.alert('Error', 'Phone number is required');
    }

    try {
      setLoading(true);
      const res = await axios.post('https://lamigra-backend.onrender.com/api/send-code', { phoneNumber });
      setStep(2);
      Alert.alert('Success', res.data.message);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!otp) {
      return Alert.alert('Error', 'OTP is required');
    }

    try {
      setLoading(true);
      const res = await axios.post('https://lamigra-backend.onrender.com/api/verify-code', { phoneNumber, otp });
      Alert.alert('Success', res.data.message);
      router.replace('/signup'); // 🔁 Redirect to signup page
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {step === 1 ? 'Verify Your Phone' : 'Enter OTP Code'}
          </Text>

          <TextInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={styles.input}
            disabled={step === 2}
            mode="outlined"
            outlineColor="#6B7280"
            activeOutlineColor="#6B7280"
          />

          {step === 2 && (
            <TextInput
              label="OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              outlineColor="#6B7280"
              activeOutlineColor="#6B7280"
            />
          )}

          {loading ? (
            <ActivityIndicator animating size="large" color="#6B7280" />
          ) : (
            <Button
              mode="contained"
              onPress={step === 1 ? sendCode : verifyCode}
              style={styles.button}
              buttonColor="#6B7280"
              textColor="#ffffff"
            >
              {step === 1 ? 'Send Code' : 'Verify Code'}
            </Button>
          )}
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
};

export default PhoneVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  card: {
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#ffffff',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 20,
    color: '#6B7280',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 6,
  },
});
