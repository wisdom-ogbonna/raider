import React, { useContext, useEffect, useState } from "react";
import { db } from "../config/firebase"; // Make sure this is imported
import { doc, setDoc } from "firebase/firestore";
import { View, Alert, TouchableOpacity } from "react-native";
import { TextInput, Button, Text, Checkbox } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { auth, createUserWithEmailAndPassword } from "../config/firebase";
import styles from "../styles/SignupStyles";


export default function Signup() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [name, setName] = useState(""); // New Name field
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [underAge, setUnderAge] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push("/report");
  }, [user]);

  const validateInputs = () => {
    if (!name || !email || !password || !phone) {
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
  
      // Save to Firestore
      await setDoc(doc(db, "users", uid), {
        name,
        email,
        phone,
        underAge,
        createdAt: new Date().toISOString()
      });
  
      Alert.alert("Success", "Account created!");
      router.push(underAge ? "/raids" : "/report");
    } catch (error) {
      const err = error as { message: string }; // 👈 Fix here
      Alert.alert("Signup Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Join IceRaider
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Sign up to receive alerts and help others stay safe.
      </Text>

      <TextInput
        label="Full Name"
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
      <TextInput
        label="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        mode="outlined"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setUnderAge(!underAge)}
      >
        <View style={styles.checkboxWrapper}>
          <Checkbox
            status={underAge ? "checked" : "unchecked"}
            color="#0d99b6"
            uncheckedColor="#ffffff"
          />
        </View>
        <Text style={styles.checkboxLabel}>
          I am under 16 (reporting will be disabled)
        </Text>
      </TouchableOpacity>

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

      <View style={styles.footerLinks}>
        <Button onPress={() => router.back()} mode="text">
          ⬅️ Go Back
        </Button>
        <Button onPress={() => router.push("/signin")} mode="text">
          Already have an account? Sign In
        </Button>
      </View>
    </View>
  );
}
