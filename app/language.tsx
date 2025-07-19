import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import i18n from "../i18n";

const LanguageScreen = () => {
  const router = useRouter();

const selectLanguage = async (lang) => {
  await AsyncStorage.setItem("appLanguage", lang);

  await i18n.changeLanguage(lang); // Wait for change

  // Optional: add a delay for i18n to take full effect
  setTimeout(() => {
    router.replace("/onboarding");
  }, 100); // Delay to ensure language applied before routing
};


  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 24 }}>
        Select Your Language
      </Text>

      <TouchableOpacity
        onPress={() => selectLanguage("en")}
        style={{
          backgroundColor: "#2596be",
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          width: "80%",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>English</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => selectLanguage("es")}
        style={{
          backgroundColor: "#f97316",
          padding: 16,
          borderRadius: 12,
          width: "80%",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Español</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageScreen;
