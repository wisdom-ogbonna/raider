// /app/(tabs)/_layout.js or _layout.tsx
import { Tabs } from "expo-router";
import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/AuthContext";

export default function TabLayout() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Report / Maps Tab */}
      <Tabs.Screen
        name="report"
        options={{
          title: t("maps"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="warning-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!user) {
              e.preventDefault();
              router.replace("/signin");
            }
          },
        }}
      />

      {/* Raids / Reports Tab */}
      <Tabs.Screen
        name="raids"
        options={{
          title: t("reports"), 
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Donate Tab */}
      <Tabs.Screen
        name="donate"
        options={{
          title: t("donate.donate"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile.profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
