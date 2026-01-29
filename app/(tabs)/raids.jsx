import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Image,
} from "react-native";
import {
  Text,
  ActivityIndicator,
  Appbar,
  Avatar,
  IconButton,
} from "react-native-paper";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { AuthContext } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import moment from "moment";
import ImageSlider from "../../components/ImageSlider";
import styles from "../../styles/RaidPageStyles";

const RaidPage = () => {
  const [raids, setRaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCommentInputs, setVisibleCommentInputs] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const { user, loading: authLoading } = useContext(AuthContext);
  const [commentsByRaid, setCommentsByRaid] = useState({});
  const [visibleComments, setVisibleComments] = useState({});
  const [reactionsByRaid, setReactionsByRaid] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { t } = useTranslation();
  const router = useRouter();

  // --- Category options ---
  const categoryOptions = [
    {
      label: t("iceReporter.checkpointRoadblock"),
      value: "checkpoint",
      icon: require("../../assets/icons/sos_emergency.png"),
    },
    {
      label: t("iceReporter.secondHandReport"),
      value: "second_hand",
      icon: require("../../assets/icons/unusual_vehicle.png"),
    },
    {
      label: t("iceReporter.suspiciousVehicle"),
      value: "suspicious",
      icon: require("../../assets/icons/law_enforcement.png"),
    },
    {
      label: t("iceReporter.iceAgentsOnSight"),
      value: "ice_agents",
      icon: require("../../assets/icons/traffic_checkpoint.png"),
    },
    {
      label: t("iceReporter.sosGettingDetained"),
      value: "sos",
      icon: require("../../assets/icons/abandoned_vehicle.png"),
    },
  ];

  // ✅ fetch raids
  useEffect(() => {
    const raidQuery = query(
      collection(db, "ice_raids"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      raidQuery,
      (snapshot) => {
        const raidList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRaids(raidList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching raids:", error);
        Alert.alert("Error", "Failed to load raids. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ✅ fetch comments for each raid
  useEffect(() => {
    const unsubscribers = [];
    raids.forEach((raid) => {
      const commentsQuery = query(
        collection(db, `ice_raids/${raid.id}/comments`),
        orderBy("createdAt", "asc")
      );

      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        setCommentsByRaid((prev) => ({
          ...prev,
          [raid.id]: snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        }));
      });

      unsubscribers.push(unsubscribe);
    });
    return () => unsubscribers.forEach((u) => u());
  }, [raids]);

  // ✅ fetch reactions for each raid
  useEffect(() => {
    const unsubscribers = [];
    raids.forEach((raid) => {
      const reactionsRef = collection(db, `ice_raids/${raid.id}/reactions`);

      const unsubscribe = onSnapshot(reactionsRef, (snapshot) => {
        const reactions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReactionsByRaid((prev) => ({
          ...prev,
          [raid.id]: reactions,
        }));
      });

      unsubscribers.push(unsubscribe);
    });

    return () => unsubscribers.forEach((u) => u());
  }, [raids]);

  // ✅ toggle comment input bar
  const toggleCommentInput = (raidId) => {
    setVisibleCommentInputs((prev) => ({
      ...prev,
      [raidId]: !prev[raidId],
    }));
  };

  // ✅ toggle all comments view
  const toggleComments = (raidId) => {
    setVisibleComments((prev) => ({
      ...prev,
      [raidId]: !prev[raidId],
    }));
  };

  const handleCommentTextChange = (raidId, text) => {
    setCommentTexts((prev) => ({
      ...prev,
      [raidId]: text,
    }));
  };

  const handleCommentSubmit = async (raidId) => {
    const commentText = commentTexts[raidId]?.trim();
    if (!commentText) return;

    try {
      await addDoc(collection(db, `ice_raids/${raidId}/comments`), {
        text: commentText,
        createdAt: serverTimestamp(),
        commentedBy: user?.displayName || user?.email || "Anonymous",
        photoURL: user?.photoURL || null,
      });
      setCommentTexts((prev) => ({ ...prev, [raidId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment.");
    }
  };

  const handleReaction = async (raidId, type) => {
    if (!user) return;

    const reactionRef = doc(db, `ice_raids/${raidId}/reactions/${user.uid}`);
    const existing = await getDoc(reactionRef);

    if (existing.exists()) {
      const current = existing.data().type;

      // Remove reaction if same clicked again
      if (current === type) {
        await deleteDoc(reactionRef);
        return;
      }
    }

    await setDoc(reactionRef, {
      type,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  const filteredRaids = raids.filter((raid) =>
    selectedCategory === "all" ? true : raid.category === selectedCategory
  );

  if (loading || authLoading) {
    return (
      <ActivityIndicator
        animating={true}
        size="large"
        style={styles.loadingIndicator}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {/* --- Top Appbar --- */}
      <Appbar.Header>
        <Appbar.Content
          title={
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Image
                source={require("../../assets/images/logo.png")}
                style={{ width: 120, height: 120, marginLeft: 15 }}
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

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.listContainer}>
          <Text style={styles.title}>{t("raidPage.latestReports")}</Text>

          {/* --- Category filter --- */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 10 }}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            {categoryOptions.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setSelectedCategory(cat.value)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 25,
                  marginRight: 10,
                  backgroundColor:
                    selectedCategory === cat.value ? "#0d99b6" : "#f0f0f0",
                  shadowColor: "#000",
                  shadowOpacity: selectedCategory === cat.value ? 0.2 : 0,
                  shadowRadius: selectedCategory === cat.value ? 4 : 0,
                  elevation: selectedCategory === cat.value ? 3 : 0,
                }}
              >
                <Image
                  source={cat.icon}
                  style={{ width: 18, height: 18, marginRight: 6 }}
                />
                <Text
                  style={{
                    color: selectedCategory === cat.value ? "white" : "black",
                    fontWeight: "500",
                    fontSize: 14,
                  }}
                  numberOfLines={1} // prevents text from overflowing
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* All button */}
            <TouchableOpacity
              onPress={() => setSelectedCategory("all")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 25,
                backgroundColor:
                  selectedCategory === "all" ? "#0d99b6" : "#f0f0f0",
                shadowColor: "#000",
                shadowOpacity: selectedCategory === "all" ? 0.2 : 0,
                shadowRadius: selectedCategory === "all" ? 4 : 0,
                elevation: selectedCategory === "all" ? 3 : 0,
              }}
            >
              <Text
                style={{
                  color: selectedCategory === "all" ? "white" : "black",
                  fontWeight: "500",
                  fontSize: 14,
                }}
              >
                All
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {filteredRaids.length > 0 ? (
            filteredRaids.map((raid) => {
              const comments = commentsByRaid[raid.id] || [];
              const showComments = visibleComments[raid.id];
              const reactions = reactionsByRaid[raid.id] || [];
              const likes = reactions.filter((r) => r.type === "like").length;
              const dislikes = reactions.filter(
                (r) => r.type === "dislike"
              ).length;
              const userReaction = reactions.find(
                (r) => r.userId === user?.uid
              );

              return (
                <View
                  key={raid.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    padding: 15,
                    marginBottom: 15,
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text style={styles.raidText}>
                    <Text style={styles.boldText}>
                      {t("raidPage.address")}:{" "}
                    </Text>
                    {raid.reportedAddress}
                  </Text>
                  <Text style={styles.raidText}>
                    <Text style={styles.boldText}>Description: </Text>
                    {raid.description}
                  </Text>

                  <ImageSlider images={raid.imageUrls || []} />

                  <Text style={styles.raidText}>
                    <Text style={styles.boldText}>Reported By: </Text>
                    {raid.reportedByName || "Anonymous"}
                  </Text>

                  {/* --- Reactions --- */}
                  <View style={{ flexDirection: "row", marginTop: 10 }}>
                    <TouchableOpacity
                      onPress={() => handleReaction(raid.id, "like")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 20,
                      }}
                    >
                      <Ionicons
                        name={
                          userReaction?.type === "like"
                            ? "thumbs-up"
                            : "thumbs-up-outline"
                        }
                        size={20}
                        color="#0d99b6"
                      />
                      <Text style={{ marginLeft: 5 }}>{likes}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleReaction(raid.id, "dislike")}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name={
                          userReaction?.type === "dislike"
                            ? "thumbs-down"
                            : "thumbs-down-outline"
                        }
                        size={20}
                        color="red"
                      />
                      <Text style={{ marginLeft: 5 }}>{dislikes}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* --- Comments toggle --- */}
                  {comments.length > 0 && (
                    <TouchableOpacity
                      onPress={() => toggleComments(raid.id)}
                      style={{ marginTop: 8 }}
                    >
                      <Text style={{ color: "#0d99b6", fontWeight: "500" }}>
                        {showComments
                          ? t("raidPage.hideComments")
                          : `${t("raidPage.viewComments")} (${
                              comments.length
                            })`}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* --- Show comments --- */}
                  {showComments && comments.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      {comments.map((comment) => (
                        <View
                          key={comment.id}
                          style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                            marginBottom: 8,
                          }}
                        >
                          {comment.photoURL ? (
                            <Avatar.Image
                              size={36}
                              source={{ uri: comment.photoURL }}
                            />
                          ) : (
                            <Avatar.Text
                              size={36}
                              label={
                                comment.commentedBy?.[0]?.toUpperCase() || "A"
                              }
                            />
                          )}
                          <View
                            style={{
                              marginLeft: 8,
                              backgroundColor: "#f0f2f5",
                              padding: 10,
                              borderRadius: 15,
                              flex: 1,
                            }}
                          >
                            <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                              {comment.commentedBy}
                            </Text>
                            <Text style={{ fontSize: 14 }}>{comment.text}</Text>
                            {comment.createdAt?.toDate && (
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "gray",
                                  marginTop: 2,
                                }}
                              >
                                {moment(comment.createdAt.toDate()).fromNow()}
                              </Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* --- Comment input --- */}
                  {visibleCommentInputs[raid.id] && (
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
                        <Avatar.Image
                          size={32}
                          source={{ uri: user.photoURL }}
                        />
                      ) : (
                        <Avatar.Text
                          size={32}
                          label={user?.displayName?.[0] || "A"}
                        />
                      )}
                      <TextInput
                        style={{
                          flex: 1,
                          marginHorizontal: 8,
                          paddingVertical: 8,
                          fontSize: 14,
                        }}
                        placeholder={t("raidPage.commentPlaceholder")}
                        value={commentTexts[raid.id] || ""}
                        onChangeText={(text) =>
                          handleCommentTextChange(raid.id, text)
                        }
                      />
                      <IconButton
                        icon="send"
                        iconColor="#0d99b6"
                        size={22}
                        onPress={() => handleCommentSubmit(raid.id)}
                      />
                    </View>
                  )}

                  {/* --- Comment toggle button --- */}
                  <TouchableOpacity
                    onPress={() => toggleCommentInput(raid.id)}
                    style={{
                      marginTop: 8,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#0d99b6"
                    />
                    <Text style={{ marginLeft: 5, color: "#0d99b6" }}>
                      {visibleCommentInputs[raid.id]
                        ? t("cancel")
                        : t("raidPage.comment")}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <Text style={styles.noRaidsText}>No reports yet.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default RaidPage;
