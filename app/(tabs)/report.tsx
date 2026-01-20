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
import { addDoc, serverTimestamp } from "firebase/firestore";
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
    {
      label: t("iceReporter.sosGettingDetained"),
      value: "sos",
      icon: require("../../assets/icons/abandoned_vehicle.png"),
    },
    {
      label: t("iceReporter.suspiciousVehicle"),
      value: "suspicious",
      icon: require("../../assets/icons/law_enforcement.png"),
    },
    {
      label: t("iceReporter.checkpointRoadblock"),
      value: "checkpoint",
      icon: require("../../assets/icons/sos_emergency.png"),
    },
    {
      label: t("iceReporter.iceAgentsOnSight"),
      value: "ice_agents",
      icon: require("../../assets/icons/traffic_checkpoint.png"),
    },
    {
      label: t("iceReporter.secondHandReport"),
      value: "second_hand",
      icon: require("../../assets/icons/unusual_vehicle.png"),
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
    startBackgroundLocationUpdates();
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
      Alert.alert(t("iceReporter.error"), t("iceReporter.failedToPostComment"));
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

      if (image) {
        const localUri = image.uri;
        const filename = localUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const type = match ? `image/${match[1]}` : `image`;
        const correctedUri =
          Platform.OS === "android"
            ? localUri
            : localUri.replace("file://", "file:///");
        formData.append("file", { uri: correctedUri, name: filename, type });
      }

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
      setImage(null);
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
            image={image}
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

                      <View
                        style={{ flexDirection: "row", marginTop: 8, gap: 24 }}
                      >
                        <TouchableOpacity>
                          <Text style={{ fontSize: 13, color: "#007AFF" }}>
                            👍 {t("iceReporter.like")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <Text style={{ fontSize: 13, color: "#007AFF" }}>
                            💬 {t("iceReporter.reply")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }}
              ListFooterComponent={
                showComments && (
                  <View style={{ paddingVertical: 12 }}>
                    <TextInput
                      placeholder={t("iceReporter.writeComment")}
                      value={commentText}
                      onChangeText={setCommentText}
                    />
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
