import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Text, ActivityIndicator } from 'react-native-paper';
import { collection, getDocs } from "firebase/firestore"; // Firestore functions
import { db } from '../../config/firebase'; // Firestore configuration
import { AuthContext } from '../../context/AuthContext'; // Firebase Auth Context
import { useRouter } from 'expo-router'; // Navigation

const RaidPage = () => {
  const [raids, setRaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 6.5243793,
    longitude: 3.3792057,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/signin');
    }
  }, [user, authLoading]);

  useEffect(() => {
    const fetchRaids = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ice_raids"));
        const raidList = [];
        querySnapshot.forEach((doc) => {
          raidList.push({ id: doc.id, ...doc.data() });
        });
        setRaids(raidList);
      } catch (error) {
        Alert.alert('Error', 'Failed to load raids. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRaids();
  }, []);

  if (loading || authLoading) {
    return <ActivityIndicator animating={true} size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ height: 300 }}>
        <MapView style={styles.map} region={region}>
          {raids.map((raid) => (
            <Marker
              key={raid.id}
              coordinate={{ latitude: raid.latitude, longitude: raid.longitude }}
              title="ICE Raid"
              description={raid.description}
            />
          ))}
        </MapView>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.title}>Reported Raids</Text>
        {raids.length > 0 ? (
          raids.map((raid) => (
            <View key={raid.id} style={styles.raidItem}>
              <Text style={styles.raidText}>
                <Text style={{ fontWeight: 'bold' }}>Address: </Text>{raid.reportedAddress}
              </Text>
              <Text style={styles.raidText}>
                <Text style={{ fontWeight: 'bold' }}>Description: </Text>{raid.description}
              </Text>
              <Text style={styles.raidText}>
                <Text style={{ fontWeight: 'bold' }}>Reported By: </Text>{raid.reportedBy || 'Anonymous'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noRaidsText}>No raids reported yet.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  listContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  raidItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
  },
  raidText: {
    marginVertical: 3,
  },
  noRaidsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
});

export default RaidPage;
