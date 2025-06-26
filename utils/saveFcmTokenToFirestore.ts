// utils/saveFcmTokenToFirestore.ts
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase.js";

export const saveFcmTokenToFirestore = async (uid: string) => {
  console.log("Saving FCM token to Firestore for UID:", uid);

  if (!Device.isDevice) {
    console.warn("Not a physical device. Cannot get FCM token.");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permission not granted.");
    return;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const fcmToken = tokenData.data;
    console.log("Expo Push Token (FCM):", fcmToken);

    if (!fcmToken) {
      console.error("❌ No FCM token received.");
      return;
    }

    await updateDoc(doc(db, "users", uid), { fcmToken });
    console.log("✅ FCM token successfully saved to Firestore.");
  } catch (err) {
    console.error("🔥 Error saving FCM token:", err);
  }
};

