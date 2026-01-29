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
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
} from "firebase/firestore";
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
import {
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import RaidReportForm from "../../components/RaidReportForm";
import { registerForPushNotifications } from "../../utils/registerPushToken";

const GOOGLE_API_KEY = "AIzaSyCtVR76BLZhF4qjFRCP3yv8FkrTnzEhR20";
const API_URL = "https://lamigra-backend.onrender.com/api/report-raid";

const IceReporter = () => {
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState("");
  const [reportedAddress, setReportedAddress] = useState("");
  const [images, setImages] = useState([]);
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
  const [selectedImage, setSelectedImage] = useState([]);

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
  const [reporting, setReporting] = useState(false); // ✅ New loading state
  const [showForm, setShowForm] = useState(false);
  const [sourceLink, setSourceLink] = useState("");
  const [carPlateNumber, setCarPlateNumber] = useState("");
  const now = new Date();
  const [liveRaid, setLiveRaid] = useState(null);

  useEffect(() => {
    const raidQuery = query(
      collection(db, "ice_raids"),
      where("expiresAt", ">", now),
      orderBy("expiresAt"),
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
    return () => {
      sheetUnsubscribeRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (user) {
      savePushTokenToServer();
    }
  }, [user]);

  const handleMarkerPress = (raid) => {
    // cleanup previous listeners
    sheetUnsubscribeRef.current?.();

    setSelectedRaid(raid);
    setLiveRaid(null);
    setCommentText("");
    setShowComments(false);
    sheetRef.current?.snapToIndex(1);

    const unsubscribers = [];

    // 🔥 RAID REALTIME LISTENER
    const raidRef = doc(db, "ice_raids", raid.id);
    const unsubscribeRaid = onSnapshot(raidRef, (docSnap) => {
      if (docSnap.exists()) {
        setLiveRaid({ id: docSnap.id, ...docSnap.data() });
      }
    });
    unsubscribers.push(unsubscribeRaid);

    // 💬 COMMENTS REALTIME LISTENER
    const commentsQuery = query(
      collection(db, "ice_raids", raid.id, "comments"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setComments(list);
    });
    unsubscribers.push(unsubscribeComments);

    // Save combined cleanup
    sheetUnsubscribeRef.current = () => {
      unsubscribers.forEach((unsub) => unsub());
    };
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
      Alert.alert(t("iceReporter.error"), t("iceReporter.failedToPostComment"));
    }
  };
  const handleReaction = async (type) => {
    if (!user || !raidData) return;

    const raidRef = doc(db, "ice_raids", raidData.id);
    const uid = user.uid;

    const alreadyLiked = raidData.likedBy?.includes(uid);
    const alreadyDisliked = raidData.dislikedBy?.includes(uid);

    try {
      // 👍 LIKE BUTTON PRESSED
      if (type === "like") {
        // If already liked → remove like
        if (alreadyLiked) {
          await updateDoc(raidRef, {
            likes: increment(-1),
            likedBy: arrayRemove(uid),
          });
          return;
        }

        // If previously disliked → remove dislike first
        if (alreadyDisliked) {
          await updateDoc(raidRef, {
            dislikes: increment(-1),
            dislikedBy: arrayRemove(uid),
          });
        }

        // Add like
        await updateDoc(raidRef, {
          likes: increment(1),
          likedBy: arrayUnion(uid),
        });
      }

      // 👎 DISLIKE BUTTON PRESSED
      if (type === "dislike") {
        // If already disliked → remove dislike
        if (alreadyDisliked) {
          await updateDoc(raidRef, {
            dislikes: increment(-1),
            dislikedBy: arrayRemove(uid),
          });
          return;
        }

        // If previously liked → remove like first
        if (alreadyLiked) {
          await updateDoc(raidRef, {
            likes: increment(-1),
            likedBy: arrayRemove(uid),
          });
        }

        // Add dislike
        await updateDoc(raidRef, {
          dislikes: increment(1),
          dislikedBy: arrayUnion(uid),
        });
      }
    } catch (err) {
      console.log("Reaction error:", err);
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
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== "granted") {
        alert("Permission required to access photos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const newImage = result.assets[0];
        setImages((prevImages) => [...prevImages, newImage]); // ✅ FIX
      }
    } catch (error) {
      console.log("Image picker error:", error);
    }
  };

  const reportRaid = async () => {
    if (!reportedAddress || !location) {
      Alert.alert(t("iceReporter.error"), t("iceReporter.locationMissing"));
      return;
    }

    try {
      setReporting(true);

      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("description", description);
      formData.append("latitude", location.latitude);
      formData.append("longitude", location.longitude);
      formData.append("radius", radius);
      formData.append("reportedAddress", reportedAddress);
      formData.append("category", selectedCategory.value);
      formData.append("sourceLink", sourceLink);
      formData.append("carPlateNumber", carPlateNumber);

      images.forEach((img) => {
        const localUri = img.uri;
        const filename = localUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const type = match ? `image/${match[1]}` : "image";

        const correctedUri =
          Platform.OS === "ios" && !localUri.startsWith("file:///")
            ? localUri.replace("file://", "file:///")
            : localUri;

        formData.append("files", {
          uri: correctedUri,
          name: filename,
          type,
        });
      });

      // 1️⃣ Upload raid
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }

      await response.json();

      // 2️⃣ Send push notification
      await fetch(
        "https://lamigra-backend.onrender.com/api/send-notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "🚨 Ice Raid Alert",
            body: "An ICE raid was reported near your location.",
          }),
        }
      );

      Alert.alert(t("iceReporter.success"), t("iceReporter.raidReported"));
      setDescription("");
      setImages([]);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(t("iceReporter.error"), error.message);
    } finally {
      setReporting(false);
    }
  };

  const savePushTokenToServer = async () => {
    try {
      const pushToken = await registerForPushNotifications();
      if (!pushToken || !user) return;

      const response = await fetch(
        "https://lamigra-backend.onrender.com/api/save-push-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.uid,
            pushToken: pushToken,
          }),
        }
      );

      const data = await response.json();
      console.log("Push token saved:", data);
    } catch (err) {
      console.error("Failed to save push token", err);
    }
  };
  const getReactionColor = () => {
    if (!raidData) return "#f2f2f7";

    const likes = raidData.likes || 0;
    const dislikes = raidData.dislikes || 0;

    if (likes > dislikes) return "#e6f9ed";
    if (dislikes > likes) return "#fdecea";
    return "#f2f2f7";
  };

  const raidData = liveRaid || selectedRaid;
  const selectedRaidCategory = useMemo(() => {
    if (!raidData?.category) return null;
    return categoryOptions.find((cat) => cat.value === raidData.category);
  }, [raidData]);

  if (loading)
    return (
      <ActivityIndicator
        animating={true}
        size="large"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "position"} // 👈 FIX
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -180} // 👈 MAGIC VALUE
    >
      <View style={styles.container}>
        <View style={styles.mapWrapper}>
          <TouchableOpacity
            onPress={() => setShowForm(!showForm)}
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              backgroundColor: "#007AFF",
              padding: 12,
              borderRadius: 10,
              zIndex: 999,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {showForm
                ? t("iceReporter.hideForm")
                : t("iceReporter.reportRaid")}
            </Text>
          </TouchableOpacity>
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
                {/* Find the category object */}
                {(() => {
                  const categoryObj = categoryOptions.find(
                    (cat) => cat.value === raid.category
                  );
                  return categoryObj?.icon ? (
                    <Image
                      source={categoryObj.icon}
                      style={{ width: 32, height: 32 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={{ fontSize: 32 }}>📍</Text> // fallback
                  );
                })()}
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
        {showForm && (
          <RaidReportForm
            description={description}
            setDescription={setDescription}
            reportedAddress={reportedAddress}
            pickImage={pickImage}
            images={images}
            selectedCategory={selectedCategory}
            categoryOptions={categoryOptions}
            menuVisible={menuVisible}
            setMenuVisible={setMenuVisible}
            setSelectedCategory={setSelectedCategory}
            setCategory={setCategory}
            reportRaid={reportRaid}
            reporting={reporting}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            setIsVisible={setIsVisible}
            t={t}
            sourceLink={sourceLink}
            setSourceLink={setSourceLink}
            carPlateNumber={carPlateNumber}
            setCarPlateNumber={setCarPlateNumber}
          />
        )}

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
                  {/* 🚨 CATEGORY BADGE */}
                  {selectedRaidCategory && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        alignSelf: "flex-start",
                        backgroundColor: "#eef2ff",
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 20,
                        marginBottom: 10,
                      }}
                    >
                      <Image
                        source={selectedRaidCategory.icon}
                        style={{ width: 18, height: 18, marginRight: 6 }}
                        resizeMode="contain"
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: "#3730a3",
                        }}
                      >
                        {selectedRaidCategory.label}
                      </Text>
                    </View>
                  )}

                  <Text
                    style={{ fontSize: 20, fontWeight: "700", marginBottom: 6 }}
                  >
                    {selectedRaid.reportedAddress ||
                      t("iceReporter.unknownLocation")}
                  </Text>

                  <Text
                    style={{ fontSize: 15, color: "#444", marginBottom: 10 }}
                  >
                    {selectedRaid.description || t("iceReporter.noDescription")}
                  </Text>

                  <Text style={{ color: "#999", fontSize: 13 }}>
                    {selectedRaid.createdAt
                      ? formatDistanceToNow(selectedRaid.createdAt, {
                          addSuffix: true,
                        })
                      : t("iceReporter.timeNotAvailable")}
                  </Text>
                  {/* Reaction Bar */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 14,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      backgroundColor: getReactionColor(),
                      borderRadius: 14,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleReaction("like")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        opacity: raidData?.likedBy?.includes(user?.uid)
                          ? 1
                          : 0.6,
                      }}
                    >
                      <Ionicons
                        name="thumbs-up"
                        size={22}
                        color={
                          raidData?.likedBy?.includes(user?.uid)
                            ? "#16a34a"
                            : "#777"
                        }
                      />
                      <Text
                        style={{
                          marginLeft: 6,
                          fontWeight: "700",
                          color: raidData?.likedBy?.includes(user?.uid)
                            ? "#16a34a"
                            : "#333",
                        }}
                      >
                        {raidData?.likes || 0}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleReaction("dislike")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        opacity: raidData?.dislikedBy?.includes(user?.uid)
                          ? 1
                          : 0.6,
                      }}
                    >
                      <Ionicons
                        name="thumbs-down"
                        size={22}
                        color={
                          raidData?.dislikedBy?.includes(user?.uid)
                            ? "#dc2626"
                            : "#777"
                        }
                      />
                      <Text
                        style={{
                          marginLeft: 6,
                          fontWeight: "700",
                          color: raidData?.dislikedBy?.includes(user?.uid)
                            ? "#dc2626"
                            : "#333",
                        }}
                      >
                        {raidData?.dislikes || 0}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setShowComments(true)}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={20}
                        color="#777"
                      />
                      <Text style={{ marginLeft: 6, fontWeight: "600" }}>
                        {comments.length}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {Array.isArray(selectedRaid.imageUrls) &&
                    selectedRaid.imageUrls.length > 0 && (
                      <FlatList
                        data={selectedRaid.imageUrls}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        style={{ marginTop: 12 }}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedImage(
                                selectedRaid.imageUrls.map((url) => ({
                                  uri: url,
                                }))
                              );
                              setIsVisible(true);
                            }}
                          >
                            <Image
                              source={{ uri: item }}
                              style={{
                                width: 300,
                                height: 200,
                                borderRadius: 16,
                                marginRight: 12,
                              }}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        )}
                      />
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
                        style={{
                          color: "#fff",
                          fontWeight: "600",
                          fontSize: 15,
                        }}
                      >
                        {t("iceReporter.viewComments")} ({comments.length})
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
                          {item.displayName || t("iceReporter.anonymous")}
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


                    </View>
                  </View>
                );
              }}
              ListFooterComponent={
                showComments && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 10,
                      marginBottom: 30,
                    }}
                  >
                    <TextInput
                      placeholder={t("iceReporter.writeComment")}
                      value={commentText}
                      onChangeText={setCommentText}
                      style={{
                        flex: 1,
                        backgroundColor: "#f2f2f7",
                        borderRadius: 20,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        marginRight: 8,
                      }}
                    />

                    <TouchableOpacity
                      onPress={postComment}
                      style={{
                        backgroundColor: "#007AFF",
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )
              }
              contentContainerStyle={{ padding: 16 }}
            />
          ) : (
            <View style={{ padding: 16 }}>
              <Text style={{ color: "#666" }}>
                Select a raid to see details
              </Text>
            </View>
          )}
        </BottomSheet>
      </View>
    </KeyboardAvoidingView>
  );
};

export default IceReporter;
