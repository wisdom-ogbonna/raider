import React, { useState } from "react";
import {
  View,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Text, TextInput, Button } from "react-native-paper";
import { saveFcmTokenToFirestore } from "../utils/saveFcmTokenToFirestore";
import styles from "../styles/SignInStyles";


export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const idToken = await user.getIdToken();
      console.log("🔥 Firebase ID Token:", idToken);

      await saveFcmTokenToFirestore(user.uid);

      Alert.alert("Success", "Logged in successfully!");
      router.push("/report");
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome Back
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Sign in securely to access alerts and report nearby threats.
        100% anonymous. No government access.
      </Text>

      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Password"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity onPress={() => Alert.alert("Forgot Password?", "Feature coming soon!")}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <Text style={styles.privacyNote}>
        🔒 Your email is only used for login. We never share your information.
      </Text>

      <Button
        mode="contained"
        onPress={handleSignIn}
        loading={loading}
        disabled={loading}
        buttonColor="#0d99b6"
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {loading ? "Signing In..." : "Sign In"}
      </Button>

      <Button onPress={() => router.push("/signup")} textColor="#0d99b6" style={styles.signupLink}>
        Don't have an account? Sign Up
      </Button>
    </View>
  );
}


