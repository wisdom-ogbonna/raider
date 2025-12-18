import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  Card,
  Text,
  Button,
  Appbar,
  Avatar,
  IconButton,
  Banner,
} from "react-native-paper";
import { useRouter } from "expo-router";
import YoutubePlayer from "react-native-youtube-iframe";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { AuthContext } from "../../context/AuthContext";

const ProductsPage = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [commentsByProduct, setCommentsByProduct] = useState({});
  const [visibleComments, setVisibleComments] = useState({});
  const [visibleCommentInputs, setVisibleCommentInputs] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [bannerVisible, setBannerVisible] = useState(true);

  // Fetch products from backend every 10s
  useEffect(() => {
    let interval;
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "https://lamigra-backend.onrender.com/api/products"
        );
        const data = await res.json();
        setProducts((prev) => {
          const newData = JSON.stringify(data);
          const oldData = JSON.stringify(prev);
          if (newData !== oldData) return data;
          return prev;
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setLoading(false);
      }
    };

    fetchProducts();
    interval = setInterval(fetchProducts, 10000);
    return () => clearInterval(interval);
  }, []);

  // Real-time comments listener
  useEffect(() => {
    const unsubscribers = [];

    products.forEach((product) => {
      const commentsQuery = query(
        collection(db, `products/${product.id}/comments`),
        orderBy("createdAt", "asc")
      );

      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        setCommentsByProduct((prev) => ({
          ...prev,
          [product.id]: snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        }));
      });

      unsubscribers.push(unsubscribe);
    });

    return () => unsubscribers.forEach((u) => u());
  }, [products]);

  const toggleComments = (id) =>
    setVisibleComments((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleCommentInput = (id) =>
    setVisibleCommentInputs((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCommentTextChange = (id, text) =>
    setCommentTexts((prev) => ({ ...prev, [id]: text }));

  const handleCommentSubmit = async (id) => {
    const text = commentTexts[id]?.trim();
    if (!text) return;

    try {
      await addDoc(collection(db, `products/${id}/comments`), {
        text,
        createdAt: serverTimestamp(),
        commentedBy: user?.displayName || user?.email || "Anonymous",
        photoURL: user?.photoURL || null,
      });
      setCommentTexts((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const renderProduct = ({ item }) => {
    const comments = commentsByProduct[item.id] || [];
    const showComments = visibleComments[item.id];

    return (
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "white",
          elevation: 4,
        }}
      >
        {/* 🎬 Video / Thumbnail */}
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
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
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

        {/* Product Info */}
        <Card.Content style={{ padding: 12 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 4 }}>
            {item.name}
          </Text>
          <Text style={{ color: "#4b5563", marginBottom: 6 }}>
            {item.description}
          </Text>
          <Text
            style={{ color: "#0d99b6", fontWeight: "bold", marginBottom: 8 }}
          >
            {item.price}
          </Text>

          {/* Comments toggle */}
          {comments.length > 0 && (
            <TouchableOpacity onPress={() => toggleComments(item.id)}>
              <Text style={{ color: "#0d99b6", marginBottom: 8 }}>
                {showComments
                  ? "Hide comments"
                  : `View all ${comments.length} comments`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Show comments */}
          {showComments &&
            comments.map((comment) => (
              <View
                key={comment.id}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                {comment.photoURL ? (
                  <Avatar.Image size={36} source={{ uri: comment.photoURL }} />
                ) : (
                  <Avatar.Text
                    size={36}
                    label={comment.commentedBy?.[0]?.toUpperCase() || "A"}
                  />
                )}
                <View
                  style={{
                    marginLeft: 8,
                    backgroundColor: "#f0f2f5",
                    padding: 10,
                    borderRadius: 12,
                    flex: 1,
                  }}
                >
                  <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                    {comment.commentedBy}
                  </Text>
                  <Text style={{ fontSize: 14 }}>{comment.text}</Text>
                  {comment.createdAt?.toDate && (
                    <Text style={{ fontSize: 12, color: "gray", marginTop: 2 }}>
                      {moment(comment.createdAt.toDate()).fromNow()}
                    </Text>
                  )}
                </View>
              </View>
            ))}

          {/* Comment input */}
          {visibleCommentInputs[item.id] && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f0f2f5",
                borderRadius: 25,
                paddingHorizontal: 12,
                marginTop: 10,
              }}
            >
              {user?.photoURL ? (
                <Avatar.Image size={32} source={{ uri: user.photoURL }} />
              ) : (
                <Avatar.Text size={32} label={user?.displayName?.[0] || "A"} />
              )}
              <TextInput
                style={{
                  flex: 1,
                  marginHorizontal: 8,
                  paddingVertical: 8,
                  fontSize: 14,
                }}
                placeholder="Write a comment..."
                value={commentTexts[item.id] || ""}
                onChangeText={(text) => handleCommentTextChange(item.id, text)}
              />
              <IconButton
                icon="send"
                iconColor="#0d99b6"
                size={22}
                onPress={() => handleCommentSubmit(item.id)}
              />
            </View>
          )}

          {/* Toggle comment input */}
          <TouchableOpacity
            onPress={() => toggleCommentInput(item.id)}
            style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#0d99b6" />
            <Text style={{ marginLeft: 5, color: "#0d99b6" }}>
              {visibleCommentInputs[item.id] ? "Cancel" : "Comment"}
            </Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0d99b6" />
        <Text style={{ marginTop: 10, color: "#4b5563" }}>
          Loading products...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <Appbar.Header>
        <Appbar.Content
          title={
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Image
                source={require("../../assets/images/logo1.png")}
                style={{ width: 100, height: 50, marginLeft: 10 }}
              />
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                <Text variant="headlineMedium" style={{ color: "white" }}>
                  LAMIGRA
                </Text>
              </View>
            </View>
          }
        />
        <Appbar.Action icon="home" onPress={() => router.push("/")} />
        <Appbar.Action
          icon="hand-heart"
          onPress={() => router.push("/donate")}
        />
        <Appbar.Action icon="account" onPress={() => router.push("/profile")} />
      </Appbar.Header>

      {/* Banner */}
      {bannerVisible && (
<Banner
  visible={bannerVisible}
  icon="fire"
  style={{
    backgroundColor: "#fefce8",
    borderRadius: 14,
    margin: 16,
    paddingVertical: 10,
    elevation: 2,
  }}
  actions={[
    { label: "Dismiss", onPress: () => setBannerVisible(false) },
  ]}
>
  <View style={{ flexDirection: "column", gap: 4 }}>
    <Text
      variant="titleSmall"
      style={{
        color: "#713f12",
        fontWeight: "700",
        fontSize: 16,
      }}
    >
      🔥 Trending Videos From Our Community
    </Text>

    <Text
      variant="bodySmall"
      style={{
        color: "#854d0e",
        lineHeight: 18,
      }}
    >
      Discover the latest posts powered by #LaMigraApp 🚀  
      Explore, support, and share with the community.
    </Text>
  </View>
</Banner>

      )}

      {/* Products */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }}
      />
    </View>
  );
};

export default ProductsPage;
