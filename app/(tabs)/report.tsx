import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, Alert, StyleSheet } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { TextInput, Button, Text, ActivityIndicator } from "react-native-paper";
import * as Linking from "expo-linking";
import { AuthContext } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import {
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { styles } from "../../styles/IceReporter";
import { startBackgroundLocationUpdates } from "../../utils/backgroundLocationTask.js";

const GOOGLE_API_KEY = "AIzaSyCtVR76BLZhF4qjFRCP3yv8FkrTnzEhR20";

const IceReporter = () => {
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [reportedAddress, setReportedAddress] = useState("");
  const [searching, setSearching] = useState(false);
  const [radius, setRadius] = useState(500);
  const [region, setRegion] = useState({
    latitude: 6.5243793,
    longitude: 3.3792057,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [user, loading]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission denied",
            "Allow location access to report ICE raids."
          );
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
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
      } catch (error) {
        Alert.alert("Error", "Failed to fetch location. Please try again.");
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
      if (data.status === "OK") {
        setReportedAddress(data.results[0].formatted_address);
      } else {
        setReportedAddress("Address not found");
      }
    } catch (error) {
      setReportedAddress("Error fetching address");
    }
  };

  const searchAddress = async () => {
    if (!address.trim()) {
      Alert.alert("Error", "Please enter an address.");
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK") {
        const location = data.results[0].geometry.location;
        setLocation({ latitude: location.lat, longitude: location.lng });
        setRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        fetchAddress(location.lat, location.lng);
      } else {
        Alert.alert("Error", "Location not found.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch location.");
    } finally {
      setSearching(false);
    }
  };

  const reportRaid = async () => {
    if (!reportedAddress) {
      Alert.alert("Error", "No address found to report.");
      return;
    }

    try {
      const token = await user.getIdToken();

      const payload = {
        description,
        latitude: location.latitude,
        longitude: location.longitude,
        radius,
        reportedAddress,
        imageUri: null // No image included
      };

      const response = await fetch(
        "https://lamigra-backend.onrender.com/api/report-raid",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to report raid");
      }

      await response.json();
      Alert.alert("Success", "ICE raid reported and notifications sent!");
      setDescription("");
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to report the ICE raid. Please try again."
      );
    }
  };

  const openMaps = () => {
    if (!location) {
      Alert.alert("Error", "No location found.");
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <ActivityIndicator
        animating={true}
        size="large"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ height: 250 }}>
        <MapView style={styles.map} region={region}>
          {location && (
            <>
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="ICE Raid Location"
              />
              <Circle
                center={location}
                radius={radius}
                strokeWidth={1}
                strokeColor={"rgba(0, 0, 255, 0.5)"}
                fillColor={"rgba(0, 0, 255, 0.1)"}
              />
            </>
          )}
        </MapView>
      </View>

      <TextInput
        label="Enter location..."
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={searchAddress}
        loading={searching}
        style={styles.button}
      >
        Search Location
      </Button>

      {reportedAddress ? (
        <Text style={styles.reportedAddress}>{reportedAddress}</Text>
      ) : null}

      <TextInput
        label="Describe the ICE raid..."
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <Button mode="contained" onPress={reportRaid} style={styles.button}>
        Report ICE Raid
      </Button>

      <Button mode="contained" onPress={openMaps} style={styles.button}>
        Open in Maps
      </Button>
    </ScrollView>
  );
};

export default IceReporter;
