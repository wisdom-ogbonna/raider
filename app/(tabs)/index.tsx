import React, { useState } from "react";
import { View, ScrollView, Linking } from "react-native";
import { Banner, Text, Card, Button, Appbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { WebView } from "react-native-webview";

const Index = () => {
  const router = useRouter();
  const [bannerVisible, setBannerVisible] = useState(true);
  const { t } = useTranslation();

  // 🎥 Product videos
  const products = [
    {
      id: "1",
      name: "Wireless Headphones",
      description: "Noise-cancelling over-ear headphones with rich bass and comfort.",
      price: "$120",
      youtubeId: "2w1INkDm0Ss",
    },
    {
      id: "2",
      name: "Smart Watch",
      description: "Track your health, steps, and stay connected anywhere.",
      price: "$90",
      youtubeId: "LPwgdAAT9t0",
    },
    {
      id: "3",
      name: "Bluetooth Speaker",
      description: "Waterproof speaker with deep bass and long battery life.",
      price: "$65",
      youtubeId: "tgbNymZ7vqY",
    },
    {
      id: "4",
      name: "Wireless Keyboard",
      description: "Slim Bluetooth keyboard with responsive keys.",
      price: "$70",
      youtubeId: "vVl5kCD-P8Y",
    },
  ];

  const handleContactSeller = () => {
    const whatsappUrl = "https://w.app/lamigra";
    Linking.openURL(whatsappUrl).catch((err) =>
      console.error("Failed to open WhatsApp:", err)
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* 🧭 Header */}
      <Appbar.Header>
        <Appbar.Content
          title={
            <Text
              variant="headlineMedium"
              style={{
                color: "white",
                fontWeight: "bold",
                marginLeft: 8,
              }}
            >
              LAMIGRA VIDEO STORE
            </Text>
          }
        />
        <Appbar.Action icon="home" onPress={() => router.push("/")} />
        <Appbar.Action icon="cart" onPress={() => router.push("/cart")} />
        <Appbar.Action icon="account" onPress={() => router.push("/profile")} />
      </Appbar.Header>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
      >
        {/* 🔖 Hashtag */}
        <Text
          variant="titleSmall"
          style={{
            textAlign: "center",
            marginVertical: 10,
            color: "#0d99b6",
            fontWeight: "bold",
          }}
        >
          #LaMigraVideoStore
        </Text>

        {/* 🎉 Banner */}
        {bannerVisible && (
          <Banner
            visible={bannerVisible}
            icon="sale"
            style={{
              backgroundColor: "#ecfccb",
              borderColor: "#65a30d",
              borderWidth: 1,
              borderRadius: 12,
              marginBottom: 16,
            }}
            actions={[
              {
                label: t("index.dismiss") || "Dismiss",
                onPress: () => setBannerVisible(false),
              },
            ]}
          >
            <Text
              variant="titleMedium"
              style={{ color: "#365314", fontWeight: "bold", marginBottom: 4 }}
            >
              🎥 Explore Product Videos
            </Text>
            <Text variant="bodyMedium" style={{ color: "#3f6212" }}>
              Watch reviews and demos before you buy — real visuals, real products!
            </Text>
          </Banner>
        )}

        {/* 🛍️ Product Video Cards */}
        {products.map((item) => (
          <Card
            key={item.id}
            style={{
              marginBottom: 24,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "white",
              elevation: 4,
            }}
          >
            {/* 🎬 YouTube Video */}
            <View style={{ height: 220 }}>
              <WebView
                source={{
                  uri: `https://www.youtube.com/embed/${item.youtubeId}?controls=1&autoplay=0`,
                }}
                style={{ flex: 1 }}
                allowsFullscreenVideo
              />
            </View>

            {/* Product Info */}
            <Card.Content style={{ padding: 12 }}>
              <Text
                variant="titleMedium"
                style={{
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                {item.name}
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  color: "#4b5563",
                  marginBottom: 6,
                }}
              >
                {item.description}
              </Text>
              <Text
                variant="titleSmall"
                style={{
                  color: "#0d99b6",
                  fontWeight: "bold",
                  marginBottom: 8,
                }}
              >
                {item.price}
              </Text>
              <Button
                mode="contained"
                onPress={handleContactSeller}
                style={{
                  backgroundColor: "#16a34a",
                  borderRadius: 8,
                  marginTop: 4,
                }}
              >
                💬 Contact Seller
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

export default Index;
