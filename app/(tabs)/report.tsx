import React, { useState, useEffect, useContext, useRef } from "react";
import { View, FlatList, Alert, StyleSheet, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  Menu,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { styles } from "../../styles/IceReporter";
import { startBackgroundLocationUpdates } from "../../utils/backgroundLocationTask.js";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import { customMapStyle } from "../../styles/mapStyle";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import ImageViewing from "react-native-image-viewing";
import { TouchableOpacity } from "react-native";
// bottom sheet and helpers
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { useMemo } from "react";
import { KeyboardAvoidingView } from "react-native";

// Firestore extras for comments
import { addDoc, serverTimestamp } from "firebase/firestore";
import { ScrollView } from "react-native-gesture-handler";

const GOOGLE_API_KEY = "AIzaSyCtVR76BLZhF4qjFRCP3yv8FkrTnzEhR20";
const API_URL = "https://lamigra-backend.onrender.com/api/report-raid";

const IceReporter = () => {
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState("");
  const [reportedAddress, setReportedAddress] = useState("");
  const [image, setImage] = useState(null);
  const [radius, setRadius] = useState(500);
  const [region, setRegion] = useState({
    latitude: 6.5243793,
    longitude: 3.3792057,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [raids, setRaids] = useState([]);
  const mapRef = useRef(null);
  const [category, setCategory] = useState("sos");

  const { t } = useTranslation();

  const [visible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const categoryOptions = [
    { label: "SOS - Getting Detained", value: "sos" },
    { label: "Suspicious Vehicle", value: "suspicious" },
    { label: "Checkpoint / Roadblock", value: "checkpoint" },
    { label: "ICE Agents on sight", value: "ice_agents" },
    { label: "Reports from others (second hand info)", value: "second_hand" },
  ];

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);
  // Bottom Sheet
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "50%", "85%"], []);
  const [selectedRaid, setSelectedRaid] = useState(null);

  // comments state (optional)
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const sheetUnsubscribeRef = useRef(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const raidQuery = query(
      collection(db, "ice_raids"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(
      raidQuery,
      (snapshot) => {
        const raidList = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate
                ? data.createdAt.toDate()
                : null, // ✅ convert timestamp
            };
          })
          .filter((raid) => raid.latitude && raid.longitude);

        setRaids(raidList);
      },
      (error) => {
        console.error("Error fetching raids:", error);
        Alert.alert(t("iceReporter.error"), t("iceReporter.failedToLoadRaids"));
      }
    );
    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   if (!loading && !user) router.replace("/signin");
  // }, [user, loading]);

  useEffect(() => {
    (async () => {
      try {
        // 1. Ask for foreground location permission
        const { status: fgStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (fgStatus !== "granted") {
          Alert.alert("Permission Denied", "Foreground location is required.");
          return;
        }

        // 2. Ask for background location permission
        const { status: bgStatus } =
          await Location.requestBackgroundPermissionsAsync();
        if (bgStatus !== "granted") {
          console.warn("Background permission not granted.");
        }

        // 3. Get current location
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
        fetchAddress(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        // 4. Start background location updates ONLY if background permission is granted
        if (bgStatus === "granted") {
          await startBackgroundLocationUpdates();
        }
      } catch (error) {
        console.error("Location setup failed:", error);
        Alert.alert("Location Error", "Failed to get your location.");
      }
    })();
  }, []);

  useEffect(() => {
    startBackgroundLocationUpdates();
  }, []);

  useEffect(() => {
    return () => {
      sheetUnsubscribeRef.current?.();
    };
  }, []);

  // when a marker is tapped
  const handleMarkerPress = (raid) => {
    // cleanup previous listener
    sheetUnsubscribeRef.current?.();
    setSelectedRaid(raid);
    setCommentText("");
    sheetRef.current?.snapToIndex(1); // open mid snap

    // subscribe to comments subcollection: ice_raids/{raidId}/comments
    try {
      const commentsQuery = query(
        collection(db, "ice_raids", raid.id, "comments"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(
        commentsQuery,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setComments(list);
        },
        (err) => {
          console.error("Comments listener error", err);
          setComments([]);
        }
      );
      sheetUnsubscribeRef.current = unsubscribe;
    } catch (err) {
      console.error("Comments subscribe error", err);
    }
  };

  const closeSheet = () => {
    sheetRef.current?.close();
    setSelectedRaid(null);
    setComments([]);
    sheetUnsubscribeRef.current?.();
    sheetUnsubscribeRef.current = null;
  };

  const postComment = async () => {
    if (!commentText.trim() || !selectedRaid) return;
    try {
      await addDoc(collection(db, "ice_raids", selectedRaid.id, "comments"), {
        text: commentText.trim(),
        userId: user?.uid || null,
        displayName: user?.displayName || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setCommentText("");
    } catch (err) {
      console.error("Failed to post comment", err);
      Alert.alert("Error", "Failed to post comment");
    }
  };

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK")
        setReportedAddress(data.results[0].formatted_address);
      else setReportedAddress(t("iceReporter.addressNotFound"));
    } catch (error) {
      setReportedAddress(t("iceReporter.errorFetchingAddress"));
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const reportRaid = async () => {
    if (!reportedAddress || !location) {
      Alert.alert(t("iceReporter.error"), t("iceReporter.locationMissing"));
      return;
    }
    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("description", description);
      formData.append("latitude", location.latitude);
      formData.append("longitude", location.longitude);
      formData.append("radius", radius);
      formData.append("reportedAddress", reportedAddress);
      formData.append("category", selectedCategory.value);

      if (image) {
        const localUri = image.uri;
        const filename = localUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const type = match ? `image/${match[1]}` : `image`;

        // On iOS, uri must start with file://
        const correctedUri =
          Platform.OS === "android"
            ? localUri
            : localUri.replace("file://", "file:///");

        formData.append("file", {
          uri: correctedUri,
          name: filename,
          type,
        });
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ DO NOT manually set "Content-Type"
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }

      await response.json();
      Alert.alert(t("iceReporter.success"), t("iceReporter.raidReported"));
      setDescription("");
      setImage(null);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(t("iceReporter.error"), error.message);
    }
  };

  if (loading)
    return (
      <ActivityIndicator
        animating={true}
        size="large"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={(newRegion) => {
            const center = {
              latitude: newRegion.latitude,
              longitude: newRegion.longitude,
            };
            setLocation(center);
            setRegion(newRegion);
            fetchAddress(center.latitude, center.longitude);
          }}
          customMapStyle={customMapStyle}
          showsUserLocation
          showsMyLocationButton
          loadingEnabled
        >
          {raids.map((raid) => (
            <Marker
              key={raid.id}
              coordinate={{
                latitude: raid.latitude,
                longitude: raid.longitude,
              }}
              onPress={() => handleMarkerPress(raid)}
            >
              <Text style={{ fontSize: 32 }}>
                {raid.category === "sos"
                  ? "🆘"
                  : raid.category === "suspicious"
                  ? "🚨"
                  : raid.category === "checkpoint"
                  ? "🚧"
                  : raid.category === "ice_agents"
                  ? "👮"
                  : raid.category === "second_hand"
                  ? "📡"
                  : "📍"}
              </Text>
            </Marker>
          ))}
        </MapView>

        {/* Center pin overlay */}
        <View style={styles.centerPin}>
          <Image
            source={require("../../assets/images/pin.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Live Address Display */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Live Address Display */}
          {reportedAddress ? (
            <View style={{ padding: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                {t("iceReporter.selectedAddress")}
              </Text>
              <Text style={{ color: "#555" }}>{reportedAddress}</Text>
            </View>
          ) : (
            <Text style={{ padding: 10, color: "#888" }}>
              {t("iceReporter.fetchingAddress")}
            </Text>
          )}

          {/* Description Input */}
          <TextInput
            label={t("iceReporter.describeRaid")}
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
            mode="outlined"
            outlineColor="#E0E4EA"
            activeOutlineColor="#007AFF"
            placeholderTextColor="#888"
          />

          {/* Category Dropdown */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Category</Text>
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.categoryButton}
              contentStyle={styles.categoryButtonContent}
              labelStyle={styles.categoryButtonLabel}
            >
              {selectedCategory.label}
            </Button>

            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <View style={{ width: "100%", alignItems: "center" }}>
                  <Text></Text>
                </View>
              }
              style={[styles.categoryMenu, { alignSelf: "center" }]}
            >
              {categoryOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setSelectedCategory(option);
                    setCategory(option.value);
                    setMenuVisible(false);
                  }}
                  title={option.label}
                  titleStyle={[
                    styles.menuItemTitle,
                    option.value === selectedCategory.value &&
                      styles.menuItemTitleSelected,
                  ]}
                  style={[
                    styles.menuItem,
                    option.value === selectedCategory.value &&
                      styles.menuItemSelected,
                  ]}
                />
              ))}
            </Menu>
          </View>

          {/* Pick Image */}
          <Button
            mode="contained"
            onPress={pickImage}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {image ? t("iceReporter.changeImage") : t("iceReporter.pickImage")}
          </Button>

          {image && (
            <TouchableOpacity
              onPress={() => {
                setSelectedImage([{ uri: image.uri }]);
                setIsVisible(true);
              }}
            >
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
            </TouchableOpacity>
          )}

          {/* Submit */}
          <Button
            mode="contained"
            onPress={reportRaid}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {t("iceReporter.reportRaid")}
          </Button>
        </View>
      </ScrollView>

      <ImageViewing
        images={selectedImage || []}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
      />

      {/* 👇 Paste the BottomSheet here */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={closeSheet}
        backgroundStyle={{ borderRadius: 24, backgroundColor: "#fff" }}
      >
        {selectedRaid ? (
          <BottomSheetFlatList
            data={showComments ? comments : []} // show comments if toggled
            keyExtractor={(item, index) => item.id || index.toString()}
            ListHeaderComponent={
              <View
                style={{
                  backgroundColor: "#f9f9f9",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{ fontSize: 20, fontWeight: "700", marginBottom: 6 }}
                >
                  {selectedRaid.reportedAddress || "Unknown Location"}
                </Text>

                <Text style={{ fontSize: 15, color: "#444", marginBottom: 10 }}>
                  {selectedRaid.description || "No description available."}
                </Text>

                <Text style={{ color: "#999", fontSize: 13 }}>
                  {selectedRaid.createdAt
                    ? formatDistanceToNow(selectedRaid.createdAt, {
                        addSuffix: true,
                      })
                    : "Time not available"}
                </Text>

                {selectedRaid.imageUrl && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImage([{ uri: selectedRaid.imageUrl }]);
                      setIsVisible(true);
                    }}
                    style={{ marginTop: 12 }}
                  >
                    <Image
                      source={{ uri: selectedRaid.imageUrl }}
                      style={{ width: "100%", height: 200, borderRadius: 16 }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}

                {/* Toggle Comments Button */}
                {!showComments && (
                  <TouchableOpacity
                    onPress={() => setShowComments(true)}
                    style={{
                      backgroundColor: "#007AFF",
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: "center",
                      marginTop: 16,
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}
                    >
                      View Comments ({comments.length})
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            renderItem={({ item }) => {
              const date = item.createdAt?.toDate
                ? item.createdAt.toDate()
                : null;

              return (
                <View style={{ flexDirection: "row", marginBottom: 16 }}>
                  {/* Avatar */}
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#e6f0ff",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                      overflow: "hidden",
                    }}
                  >
                    {item.photoURL ? (
                      <Image
                        source={{ uri: item.photoURL }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    ) : (
                      <Text style={{ fontWeight: "700", color: "#007AFF" }}>
                        {(item.displayName || "A")[0].toUpperCase()}
                      </Text>
                    )}
                  </View>

                  {/* Comment Body */}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontWeight: "600",
                          fontSize: 14,
                          marginRight: 6,
                        }}
                      >
                        {item.displayName || "Anonymous"}
                      </Text>
                      {date && (
                        <Text style={{ color: "#999", fontSize: 12 }}>
                          {formatDistanceToNow(date, { addSuffix: true })}
                        </Text>
                      )}
                    </View>

                    <View
                      style={{
                        backgroundColor: "#f2f2f7",
                        padding: 12,
                        borderRadius: 16,
                        marginTop: 6,
                      }}
                    >
                      <Text style={{ fontSize: 14, color: "#333" }}>
                        {item.text}
                      </Text>
                    </View>

                    <View
                      style={{ flexDirection: "row", marginTop: 8, gap: 24 }}
                    >
                      <TouchableOpacity>
                        <Text style={{ fontSize: 13, color: "#007AFF" }}>
                          👍 Like
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text style={{ fontSize: 13, color: "#007AFF" }}>
                          💬 Reply
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
            ListFooterComponent={
              showComments && (
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  style={{ paddingVertical: 12 }}
                >
                  <TextInput
                    placeholder="Write a comment..."
                    value={commentText}
                    onChangeText={setCommentText}
                    mode="outlined"
                    right={<TextInput.Icon icon="send" onPress={postComment} />}
                    style={{
                      marginTop: 12,
                      borderRadius: 12,
                      backgroundColor: "#f9f9f9",
                    }}
                  />
                </KeyboardAvoidingView>
              )
            }
            contentContainerStyle={{ padding: 16 }}
          />
        ) : (
          <View style={{ padding: 16 }}>
            <Text style={{ color: "#666" }}>Select a raid to see details</Text>
          </View>
        )}
      </BottomSheet>
    </View>
  );
};

export default IceReporter;
