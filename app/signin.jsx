import React, { useState } from "react";
import { View, Alert, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Text, TextInput, Button, Appbar } from "react-native-paper";
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const idToken = await user.getIdToken();
      console.log("🔥 Firebase ID Token:", idToken);

      await saveFcmTokenToFirestore(user.uid);

      Alert.alert("Success", "Logged in successfully!");
      router.push("/report");
    } catch (error) {
      let errorMessage = "Something went wrong. Please try again.";

      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
          errorMessage = "Incorrect email or password.";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Too many failed attempts. Please reset your password or try again later.";
          break;
      }

      console.log("Firebase Error:", error.code, error.message);
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <>
        <Appbar.Header style={{ elevation: 0, backgroundColor: "#ffffff8e" }}>
          <Image
            source={require("../assets/images/logo1.png")}
            style={{
              width: 300,
              height: 300,
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 40,
            }}
            resizeMode="contain"
          />
        </Appbar.Header>
      </>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome Back
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Sign in securely to access alerts and report nearby threats. 100%
        anonymous. No government access.
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

      <TouchableOpacity
        onPress={() => Alert.alert("Forgot Password?", "Feature coming soon!")}
      >
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

      <Button
        onPress={() => router.push("/signup")}
        textColor="#0d99b6"
        style={styles.signupLink}
      >
        Don't have an account? Sign Up
      </Button>
    </View>
  );
}
