import React, { useState, useEffect, useContext } from 'react';
import { View, Alert, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import {
  collection,
  query,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native-paper';

const RaidMapPage = () => {
  const [raids, setRaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/signin');
    }
  }, [user, authLoading]);

  useEffect(() => {
    const raidQuery = query(
      collection(db, 'ice_raids'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      raidQuery,
      (snapshot) => {
        const raidList = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(raid => raid.latitude && raid.longitude); // Only include raids with valid location

        setRaids(raidList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching raids:', error);
        Alert.alert('Error', 'Failed to load raids.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading || authLoading) {
    return <ActivityIndicator animating={true} size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  // Default to center of Lagos if no data yet
  const initialRegion = {
    latitude: raids[0]?.latitude || 6.5244,
    longitude: raids[0]?.longitude || 3.3792,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
        initialRegion={initialRegion}
      >
        {raids.map((raid) => (
          <Marker
            key={raid.id}
            coordinate={{
              latitude: raid.latitude,
              longitude: raid.longitude,
            }}
            title={raid.reportedAddress}
            description={raid.description}
          >
            <Callout>
              <View style={{ width: 200 }}>
                <Text style={{ fontWeight: 'bold' }}>{raid.reportedAddress}</Text>
                <Text>{raid.description}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

export default RaidMapPage;
