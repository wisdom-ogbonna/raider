import { Stack } from 'expo-router';
import { AuthProvider } from "../context/AuthContext";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';

export default function RootLayout() {
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    // Register for notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        console.log("✅ Expo Push Token:", token);
        // Optional: Save this token to Firestore
      }
    });

    // Handle incoming notification
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const body = notification.request.content.body;
      Alert.alert("🚨 ICE Raid Alert", body);
    });

    return () => {
      subscription.remove(); // Clean up listener on unmount
    };
  }, []);

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

// Function to ask permission and get push token
async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert('❗Must use physical device for Push Notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('❗Notification permissions not granted');
    return;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  console.log("Expo push token:", tokenData.data);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return tokenData.data;
}
