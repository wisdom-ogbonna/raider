import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import {
  Text,
  ActivityIndicator,
  Appbar,
  Avatar,
  IconButton,
} from "react-native-paper";
import {
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
import styles from "../../styles/RaidPageStyles";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Image } from "react-native";
import moment from "moment";

const RaidPage = () => {
  const [raids, setRaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCommentInputs, setVisibleCommentInputs] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const { user, loading: authLoading } = useContext(AuthContext);
  const [commentsByRaid, setCommentsByRaid] = useState({});
  const [visibleComments, setVisibleComments] = useState({});
  const { t } = useTranslation();

  const router = useRouter();

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
      {/* ✅ Top Appbar */}
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

      {/* ✅ Raid list with comments */}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.listContainer}>
          <Text style={styles.title}>{t("raidPage.latestReports")}</Text>
          {raids.length > 0 ? (
            raids.map((raid) => {
              const comments = commentsByRaid[raid.id] || [];
              const showComments = visibleComments[raid.id];
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
                    <Text style={styles.boldText}>{t("raidPage.address")}: </Text>
                    {raid.reportedAddress}
                  </Text>
                  <Text style={styles.raidText}>
                    <Text style={styles.boldText}>Description: </Text>
                    {raid.description}
                  </Text>
                  <Text style={styles.raidText}>
                    <Text style={styles.boldText}>Reported By: </Text>
                    {raid.reportedByName || "Anonymous"}
                  </Text>

                  {/* ✅ Comments toggle */}
                  {comments.length > 0 && (
                    <TouchableOpacity
                      onPress={() => toggleComments(raid.id)}
                      style={{ marginTop: 8 }}
                    >
                      <Text style={{ color: "#0d99b6", fontWeight: "500" }}>
                        {showComments
                          ? "Hide comments"
                          : `View all ${comments.length} comments`}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* ✅ Show comments if toggled */}
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
                              borderRadius: 15,
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
                    </View>
                  )}

                  {/* ✅ Comment input bar */}
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
                        value={commentTexts[raid.id] || ""}
                        onChangeText={(text) => handleCommentTextChange(raid.id, text)}
                      />
                      <IconButton
                        icon="send"
                        iconColor="#0d99b6"
                        size={22}
                        onPress={() => handleCommentSubmit(raid.id)}
                      />
                    </View>
                  )}

                  {/* ✅ Comment toggle button */}
                  <TouchableOpacity
                    onPress={() => toggleCommentInput(raid.id)}
                    style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color="#0d99b6" />
                    <Text style={{ marginLeft: 5, color: "#0d99b6" }}>
                      {visibleCommentInputs[raid.id] ? "Cancel" : "Comment"}
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
