import React, { useState, useEffect, useContext, useRef } from "react";
import { View, ScrollView, Alert, StyleSheet, Image } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
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

  const categoryOptions = [
    { label: "SOS - Getting Detained", value: "sos" },
    { label: "Suspicious Vehicle", value: "suspicious" },
    { label: "Checkpoint / Roadblock", value: "checkpoint" },
    { label: "ICE Agents on sight", value: "ice_agents" },
    { label: "Reports from others (second hand info)", value: "second_hand" },
  ];

  // const getCategoryIcon = (category) => {
  //   switch (category) {
  //     case "sos":
  //       return require("../../assets/icons/sos.png");
  //     case "suspicious":
  //       return require("../../assets/icons/suspicious.png");
  //     // case 'checkpoint':
  //     //   return require('../../assets/icons/checkpoint.png');
  //     // case 'ice_agents':
  //     //   return require('../../assets/icons/ice_agents.png');
  //     // case 'second_hand':
  //     //   return require('../../assets/icons/second_hand.png');
  //     // default:
  //     //   return require('../../assets/icons/default.png');
  //   }
  // };

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);

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
    <ScrollView contentContainerStyle={styles.container}>
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
              title={t("iceReporter.raidMarkerTitle")}
              description={raid.description}
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

              <Callout tooltip>
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 12,
                    width: 240,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  {/* Location */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#007AFF"
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{ fontWeight: "600", fontSize: 14, color: "#222" }}
                    >
                      ICE location is:
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 14, color: "#444", marginBottom: 8 }}
                  >
                    {raid.reportedAddress || "Unknown Location"}
                  </Text>

                  {/* Description */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={16}
                      color="#FF9500"
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{ fontWeight: "600", fontSize: 14, color: "#222" }}
                    >
                      Description is:
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 14, color: "#444", marginBottom: 8 }}
                  >
                    {raid.description || "No description available."}
                  </Text>

                  {/* Time */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color="#8E8E93"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={{ fontSize: 12, color: "#888" }}>
                      {raid.createdAt
                        ? `${formatDistanceToNow(raid.createdAt, {
                            addSuffix: true,
                          })}`
                        : "Time not available"}
                    </Text>
                  </View>

                  {/* Image */}
                  {raid.imageUrl && (
                    <>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <Ionicons
                          name="image-outline"
                          size={16}
                          color="#34C759"
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={{
                            fontWeight: "600",
                            fontSize: 14,
                            color: "#222",
                          }}
                        >
                          Image is:
                        </Text>
                      </View>
                      <Image
                        source={{ uri: raid.imageUrl }}
                        style={{
                          width: "100%",
                          height: 120,
                          borderRadius: 8,
                        }}
                        resizeMode="cover"
                      />
                    </>
                  )}
                </View>
              </Callout>
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
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Text></Text>
    </View>
  }
  style={[styles.categoryMenu, { alignSelf: 'center' }]}
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
        <Image source={{ uri: image.uri }} style={styles.previewImage} />
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
    </ScrollView>
  );
};

export default IceReporter;
