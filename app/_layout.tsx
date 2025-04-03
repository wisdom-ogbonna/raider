import { Stack } from 'expo-router';
import { AuthProvider } from "../context/AuthContext";
export default function RootLayout() {
  return (
    <AuthProvider>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="signin" options={{ headerTitle: "Sign In" }} />
      <Stack.Screen name="signup" options={{ headerTitle: "Sign Up" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
    </AuthProvider>
  );
}
