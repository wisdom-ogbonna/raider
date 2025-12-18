import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Image, ActivityIndicator } from "react-native";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import styles from "../../styles/RaidPageStyles";

const RaidPage = () => {
  const [raids, setRaids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raidQuery = query(collection(db, "ice_raids"), orderBy("createdAt", "desc"));

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
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: "center" }} />;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {raids.length === 0 && <Text>No reports yet.</Text>}
      {raids.map((raid) => (
        <View
          key={raid.id}
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
            Address:
          </Text>
          <Text style={{ marginBottom: 8 }}>
            {raid.reportedAddress || "No address provided"}
          </Text>

          <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
            Description:
          </Text>
          <Text style={{ marginBottom: 8 }}>
            {raid.description || "No description provided"}
          </Text>

          {raid.imageUrl ? (
            <Image
              source={{ uri: raid.imageUrl }}
              style={{ width: "100%", height: 200, borderRadius: 12 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ color: "gray", fontStyle: "italic" }}>No image</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default RaidPage;
