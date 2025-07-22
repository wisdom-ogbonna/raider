import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../i18n"; // Load translations before anything else
import i18n from "../i18n";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkLanguageAndOnboarding = async () => {
      try {
        const lang = await AsyncStorage.getItem("appLanguage");

        if (!lang) {
          router.replace("/language"); // 🟡 Redirect to language screen first
          return;
        }

        // Set selected language in i18n
        i18n.changeLanguage(lang);

        const onboarded = await AsyncStorage.getItem("onboarded");
        if (onboarded !== "true") {
          router.replace("/onboarding"); // 🟡 Go to onboarding if not done
        }

        // If both are OK, do nothing. Allow normal routing.
      } catch (error) {
        console.error("Error checking onboarding/language:", error);
        router.replace("/language"); // fallback
      }
    };

    checkLanguageAndOnboarding();
  }, []);

  return (
    <AuthProvider>
      <Stack>
        {/* Language Selection Screen */}
        <Stack.Screen name="language" options={{ headerShown: false }} />

        {/* Onboarding Screen */}
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />

        {/* Main App Tabs */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, headerBackTitle: "Back" }}
        />

        {/* Auth Screens */}
        <Stack.Screen name="signin" options={{ headerTitle: "Sign In" }} />
        <Stack.Screen name="signup" options={{ headerTitle: "Sign Up" }} />
        <Stack.Screen
          name="PhoneVerificationScreen"
          options={{ headerShown: false }}
        />

        {/* Donation */}
        <Stack.Screen
          name="donate"
          options={{
            headerTitle: "Donate",
            headerBackTitle: "Back",
             headerShown: false
          }}
        />
        <Stack.Screen name="profile" options={{ headerShown: false }} />

        {/* Not Found */}
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}
