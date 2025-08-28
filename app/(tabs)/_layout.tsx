import { Tabs } from "expo-router";
import { AuthProvider, AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 
import { useTranslation } from "react-i18next"; // ✅ import i18n hook

export default function TabLayout() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const { t } = useTranslation();

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <AuthProvider>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t("home"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: t("maps"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="warning-outline" size={size} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (!user) {
                e.preventDefault();
                router.replace("/signin");
              }
            },
          })}
        />
        <Tabs.Screen
          name="raids"
          options={{
            title: t("reports"), 
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="document-text-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="donate"
          options={{
             title: t("donate.donate"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
           title: t("profile.profile"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />

        {/* <Tabs.Screen
          name="RaidMapPage"
          options={{
            title: "map",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map-outline" size={size} color={color} />
            ),
          }}
        /> */}
      </Tabs>
    </AuthProvider>
  );
}
