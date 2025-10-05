// /app/_layout.js or /app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../i18n"; // Load translations
import i18n from "../i18n";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StripeProvider } from "@stripe/stripe-react-native";







export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkLanguageAndOnboarding = async () => {
      try {
        const lang = await AsyncStorage.getItem("appLanguage");

        if (!lang) {
          router.replace("/language"); // Redirect to language screen
          return;
        }

        // Set selected language in i18n
        i18n.changeLanguage(lang);

        const onboarded = await AsyncStorage.getItem("onboarded");
        if (onboarded !== "true") {
          router.replace("/onboarding"); // Go to onboarding if not done
        }

        // Both checks passed → do nothing, allow normal routing
      } catch (error) {
        console.error("Error checking onboarding/language:", error);
        router.replace("/language"); // fallback
      }
    };

    checkLanguageAndOnboarding();
  }, []);

  return (
    <StripeProvider publishableKey="pk_live_51S8ENdDgrgdXEt1S3E3pkRZ2XcW6xRc1oprPgBpDLdOsFExHPNoqU8U1Yrd8TIhSuThR2c0Womxi7HdsriInBp7s00yK8iknn3">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={MD3LightTheme}>
          <AuthProvider>
            <Stack>
              {/* Language Selection Screen */}
              <Stack.Screen name="language" options={{ headerShown: false }} />

              {/* Onboarding Screen */}
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />

              {/* Main App Tabs Layout */}
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

              {/* Not Found */}
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthProvider>
        </PaperProvider>
      </GestureHandlerRootView>
      </StripeProvider>

  );
}
