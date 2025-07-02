import React, { useContext, useEffect, useState } from "react";
import { db } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";
import { View, Alert, TouchableOpacity } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { auth, createUserWithEmailAndPassword } from "../config/firebase";
import styles from "../styles/SignupStyles";
import { saveFcmTokenToFirestore } from "../utils/saveFcmTokenToFirestore";

export default function Signup() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [name, setName] = useState(""); // Username/Nickname
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSignup = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      const idToken = await userCredential.user.getIdToken();
      console.log("Firebase ID Token:", idToken);

      await setDoc(doc(db, "users", uid), {
        name,
        email,
        createdAt: new Date().toISOString()
      });

      await saveFcmTokenToFirestore(uid);
      Alert.alert("Success", "Account created!");
      router.push("/report");
    } catch (error) {
      const err = error as { message: string };
      Alert.alert("Signup Error", err.message);
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
        Get alerts, report threats, and help keep friends, family, and neighbors safe — privately and anonymously.
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

      {/* 🔒 Privacy Note */}
      <Text style={{ fontSize: 12, color: "#777", marginVertical: 10 }}>
        🔒 We will never share your information.{"\n"}
        No government access. No tracking. Your safety is our priority.
      </Text>

      <Button
        mode="contained"
        onPress={handleSignup}
        loading={loading}
        disabled={loading}
        buttonColor="#0d99b6"
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {loading ? "Signing up..." : "Create Account"}
      </Button>

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
