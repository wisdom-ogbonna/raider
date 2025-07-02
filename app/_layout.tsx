import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboarded = await AsyncStorage.getItem("onboarded");
      if (onboarded !== "true") {
        router.replace("/onboarding"); // Redirect to onboarding if not completed
      }
    };
    checkOnboarding();
  }, []);
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, headerBackTitle: "Back" }}
        />
        <Stack.Screen name="signin" options={{ headerTitle: "Sign In" }} />
        <Stack.Screen
          name="donate"
          options={{
            headerTitle: "Donate",
            headerBackTitle: "Back", // <- ✅ This changes the back label
          }}
        />

        <Stack.Screen name="signup" options={{ headerTitle: "Sign Up" }} />
        <Stack.Screen
          name="PhoneVerificationScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}
