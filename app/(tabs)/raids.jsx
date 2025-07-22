import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Button,
} from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
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
import { Appbar } from "react-native-paper";
import { Image } from "react-native";

const RaidPage = () => {
  const [raids, setRaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCommentInputs, setVisibleCommentInputs] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const { user, loading: authLoading } = useContext(AuthContext);
  const [commentsByRaid, setCommentsByRaid] = useState({});
  const { t } = useTranslation();

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/signin");
    }
  }, [user, authLoading]);

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

  const toggleCommentInput = (raidId) => {
    setVisibleCommentInputs((prev) => ({
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
        commentedBy: user ? user.uid : "Anonymous",
      });

      Alert.alert("Success", "Comment added!");
      setCommentTexts((prev) => ({ ...prev, [raidId]: "" }));
      setVisibleCommentInputs((prev) => ({ ...prev, [raidId]: false }));
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
    <View style={{ flex: 1 }}>

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


      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.listContainer}>
          <Text style={styles.title}>{t("raidPage.latestReports")}</Text>
          {raids.length > 0 ? (
            raids.map((raid) => (
              <View key={raid.id} style={styles.raidItem}>
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
                  {raid.reportedBy || "Anonymous"}
                </Text>

                {/* Comment icon */}
                <TouchableOpacity
                  onPress={() => toggleCommentInput(raid.id)}
                  style={{ marginTop: 10 }}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={24}
                    color="#0d99b6"
                  />
                </TouchableOpacity>

                {/* Show comment input only if toggled */}
                {visibleCommentInputs[raid.id] && (
                  <View style={styles.commentSection}>
                    <Text style={styles.commentTitle}>Leave a Comment</Text>
                    <TextInput
                      style={styles.commentInput}
                      placeholder={t("raidPage.commentPlaceholder")}
                      value={commentTexts[raid.id] || ""}
                      onChangeText={(text) =>
                        handleCommentTextChange(raid.id, text)
                      }
                    />
                    <Button
                      title="Submit"
                      color="#0d99b6"
                      onPress={() => handleCommentSubmit(raid.id)}
                    />
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noRaidsText}>No reports yet.</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.supportFab}>
        <Text
          style={styles.supportFabText}
          onPress={() => router.push("/donate")}
        >
          ?
        </Text>
      </View>
    </View>
  );
};

export default RaidPage;
