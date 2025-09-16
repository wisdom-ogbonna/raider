// utils/savePushToken.js
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { doc, setDoc } from "firebase/firestore";   // ✅ use setDoc instead of updateDoc
import { db } from "../config/firebase";

export async function registerForPushNotificationsAsync(uid) {
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permission not granted.");
    return null;
  }

  // ✅ Get Expo push token (looks like ExponentPushToken[xxx])
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const expoPushToken = tokenData.data;
  console.log("✅ Got Expo Push Token:", expoPushToken);

  // ✅ Save token to Firestore under this user (creates or updates safely)
  await setDoc(
    doc(db, "users", uid),
    { pushToken: expoPushToken },
    { merge: true }
  );

  return expoPushToken;
}
