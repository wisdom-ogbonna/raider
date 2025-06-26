import React, { useState } from "react";
import { View, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Text, TextInput, Button } from "react-native-paper";
import { saveFcmTokenToFirestore } from "../utils/saveFcmTokenToFirestore";

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

      // ✅ Log the Firebase ID Token (for testing API requests)
      const idToken = await user.getIdToken();
      console.log("🔥 Firebase ID Token:", idToken);

      // ✅ Save FCM token to Firestore
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
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text
        variant="headlineMedium"
        style={{ textAlign: "center", marginBottom: 10 }}
      >
        Welcome Back
      </Text>
      <Text
        variant="bodyMedium"
        style={{ textAlign: "center", marginBottom: 20 }}
      >
        Sign in to continue using IceRaider.
      </Text>

      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ marginBottom: 10 }}
      />
      <TextInput
        label="Password"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 15 }}
      />

      <Button
        mode="contained"
        onPress={handleSignIn}
        loading={loading}
        disabled={loading}
        buttonColor="#0d99b6"
        contentStyle={{ height: 55 }}
        labelStyle={{ fontSize: 18 }}
      >
        {loading ? "Signing In..." : "Sign In"}
      </Button>

      <Button
        mode="outlined"
        icon={() => (
          <Image
            source={{
              uri:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png",
            }}
            style={{ width: 20, height: 20, marginRight: 10 }}
          />
        )}
        onPress={() => Alert.alert("Google Sign-In", "Coming soon!")}
        style={{ marginTop: 15 }}
      >
        Sign in with Google
      </Button>

      <Button onPress={() => router.push("/signup")} style={{ marginTop: 20 }}>
        Don't have an account? Sign Up
      </Button>
    </View>
  );
}
