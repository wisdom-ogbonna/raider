import React, { useState } from "react";
import { View, Alert, Image } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { auth, createUserWithEmailAndPassword } from "../../config/firebase";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created successfully!");
      router.push("/report");
    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text variant="headlineLarge" style={{ marginBottom: 10 }}>Create an Account</Text>
      <Text variant="bodyMedium" style={{ marginBottom: 20 }}>Join IceRaider to report and receive alerts.</Text>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={{ marginBottom: 15 }}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={{ marginBottom: 15 }}
      />
      
      <Button mode="contained" onPress={handleSignup} loading={loading} disabled={loading}>
        {loading ? "Signing Up..." : "Sign Up"}
      </Button>

      <Button mode="outlined" onPress={() => router.back()} style={{ marginTop: 20 }}>
        ⬅️ Go Back
      </Button>
    </View>
  );
}