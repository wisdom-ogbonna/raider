import React, { useState } from "react";
import { View, Image } from "react-native";
import { Button, Banner, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { Appbar } from "react-native-paper";

const Index = () => {
  const router = useRouter();
  const [bannerVisible, setBannerVisible] = useState(true);

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <Appbar.Header>
        <Appbar.Content
          title={
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={{ width: 120, height: 120, marginLeft: 15 }}
              />
              <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-start" }}>
                <Text variant="headlineMedium" style={{ color: "white" }}>
                  LAMIGRA
                </Text>
              </View>
            </View>
          }
        />
        <Appbar.Action icon="home" onPress={() => router.push("/")} />
        <Appbar.Action icon="hand-heart" onPress={() => router.push("/donate")} />
        <Appbar.Action icon="account" onPress={() => router.push("/profile")} />
      </Appbar.Header>

      {/* Body */}
      <View style={{ flex: 1, padding: 20 }}>
        {/* #LaMigraApp Hashtag */}
        <Text
          variant="titleSmall"
          style={{
            textAlign: "center",
            marginVertical: 10,
            color: "#0d99b6",
            fontWeight: "bold",
          }}
        >
          #LaMigraApp
        </Text>

        {/* 🔥 Banner Announcement */}
        <Banner
          visible={bannerVisible}
          icon="alert-circle"
          style={{
            backgroundColor: "#fef3c7",
            borderColor: "#fbbf24",
            borderWidth: 1,
            borderRadius: 12,
            marginVertical: 10,
          }}
          actions={[
            {
              label: "Dismiss",
              onPress: () => setBannerVisible(false),
            },
          ]}
        >
          <Text
            variant="titleMedium"
            style={{ color: "#b45309", fontWeight: "bold", marginBottom: 4 }}
          >
            🔥 Important alerts, tips, and announcements
          </Text>
          <Text variant="bodyMedium" style={{ color: "#78350f" }}>
            Want to be featured? Use the hashtag <Text style={{ fontWeight: "bold" }}>#LaMigraApp</Text> when posting!
          </Text>
        </Banner>
      </View>
    </View>
  );
};

export default Index;
