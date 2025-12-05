import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import i18n from "../i18n";

const LanguageScreen = () => {
  const router = useRouter();

  const selectLanguage = async (lang) => {
    await AsyncStorage.setItem("appLanguage", lang);
    await i18n.changeLanguage(lang);

    // Add short delay to ensure language applies before navigation
    setTimeout(() => {
      router.replace("/onboarding");
    }, 100);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#ffffff",
      }}
    >
      {/* 🖼️ Logo */}
      <Image
        source={require("../assets/images/splashh.png")}
        style={{
          width: 150,
          height: 150,
          marginBottom: 32,
          resizeMode: "contain",
        }}
      />

      <Text variant="headlineMedium" style={{ marginBottom: 24, fontWeight: "600" }}>
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
          backgroundColor: "#000000",
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
