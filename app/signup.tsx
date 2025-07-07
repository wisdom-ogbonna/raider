import React, { useContext, useEffect, useState } from "react";
import { View, Alert, TouchableOpacity } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { db, auth } from "../config/firebase";
import styles from "../styles/SignupStyles";
import { saveFcmTokenToFirestore } from "../utils/saveFcmTokenToFirestore";
import { AuthContext } from "../context/AuthContext";

export default function Signup() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [name, setName] = useState(""); // Username/Nickname
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push("/report");
  }, [user]);

  const validateInputs = () => {
    if (!name || !email || !password) {
      Alert.alert("Missing Info", "Please fill out all fields.");
      return false;
    }
    return true;
  };

  const sendOtp = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const res = await fetch("https://lamigra-backend.onrender.com/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        Alert.alert("OTP Sent", "Check your email for the verification code.");
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP.");
      }
    } catch (err) {
      Alert.alert("Network Error", "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!otp) {
      Alert.alert("Missing OTP", "Enter the verification code sent to your email.");
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP
      const verifyRes = await fetch("https://lamigra-backend.onrender.com/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setLoading(false);
        return Alert.alert("OTP Error", verifyData.message || "OTP verification failed");
      }

      // 2. Create Firebase Account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      await setDoc(doc(db, "users", uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
      });

      await saveFcmTokenToFirestore(uid);
      Alert.alert("Success", "Account created!");
      router.push("/report");
    } catch (error) {
      Alert.alert("Signup Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Create Your La Migra Account
      </Text>

      <Text variant="bodyMedium" style={styles.subtitle}>
        Get alerts, report threats, and help keep your community safe — privately and anonymously.
      </Text>

      <TextInput
        label="Username/Nickname"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />

      {!otpSent && (
        <Button
          mode="contained"
          onPress={sendOtp}
          loading={loading}
          disabled={loading}
          buttonColor="#0d99b6"
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          style={{ marginBottom: 10 }}
        >
          {loading ? "Sending OTP..." : "Send OTP to Email"}
        </Button>
      )}

      {otpSent && (
        <>
          <TextInput
            label="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSignup}
            loading={loading}
            disabled={loading}
            buttonColor="#0d99b6"
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            style={{ marginTop: 10 }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </>
      )}

      <Text style={{ fontSize: 12, color: "#777", marginVertical: 15, textAlign: "center" }}>
        🔒 We will never share your information. No government access. No tracking. Your safety is our priority.
      </Text>

      <View style={styles.footerLinksModern}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/signin")}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
