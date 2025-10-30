import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, FlatList, Linking, ActivityIndicator } from "react-native";
import { Banner, Text, Card, Button, Appbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import YoutubePlayer from "react-native-youtube-iframe";

const Index = () => {
  const router = useRouter();
  const [bannerVisible, setBannerVisible] = useState(true);
  const { t } = useTranslation();
  const [activeVideo, setActiveVideo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch products
useEffect(() => {
  let interval;
  const fetchProducts = async () => {
    try {
      const res = await fetch("https://lamigra-backend.onrender.com/api/products");
      const data = await res.json();

      // Only update if products changed (to avoid re-render spam)
      setProducts((prev) => {
        const newData = JSON.stringify(data);
        const oldData = JSON.stringify(prev);
        if (newData !== oldData) return data;
        return prev;
      });

      setLoading(false);

      // Prefetch thumbnails
      data.forEach((p) => {
        if (p.youtubeId) {
          Image.prefetch(`https://img.youtube.com/vi/${p.youtubeId}/hqdefault.jpg`);
        }
      });
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      setLoading(false);
    }
  };

  fetchProducts();

  // 🔄 Poll every 10 seconds
  interval = setInterval(fetchProducts, 10000);

  return () => clearInterval(interval);
}, []);


  const handleContactSeller = () => {
    const whatsappUrl = "https://w.app/lamigra";
    Linking.openURL(whatsappUrl).catch((err) =>
      console.error("Failed to open WhatsApp:", err)
    );
  };

  const renderProduct = ({ item }) => (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "white",
        elevation: 4,
      }}
    >
      {/* 🎬 Video or Thumbnail */}
      <View style={{ height: 220, backgroundColor: "#000" }}>
        {activeVideo === item.id ? (
          <YoutubePlayer
            height={220}
            play={true}
            videoId={item.youtubeId}
            onError={(e) => console.error("YouTube error:", e)}
          />
        ) : (
          <TouchableOpacity
            onPress={() => setActiveVideo(item.id)}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Image
              source={{
                uri: `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`,
              }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
            <View
              style={{
                position: "absolute",
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: 16,
                borderRadius: 50,
              }}
            >
              <Text style={{ color: "white", fontSize: 18 }}>▶</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* 🛍 Product Info */}
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
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0d99b6" />
        <Text style={{ marginTop: 10, color: "#4b5563" }}>Loading products...</Text>
      </View>
    );
  }

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

      {/* 🔖 Banner */}
      {bannerVisible && (
        <Banner
          visible={bannerVisible}
          icon="sale"
          style={{
            backgroundColor: "#ecfccb",
            borderColor: "#65a30d",
            borderWidth: 1,
            borderRadius: 12,
            margin: 16,
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

      {/* 🛍️ Product List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }}
      />
    </View>
  );
};

export default Index;
