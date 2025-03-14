import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import * as Linking from 'expo-linking';

const GOOGLE_API_KEY = 'AIzaSyCtVR76BLZhF4qjFRCP3yv8FkrTnzEhR20';

const IceReporter = () => {
    const [location, setLocation] = useState(null);
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [reportedAddress, setReportedAddress] = useState('');
    const [searching, setSearching] = useState(false);
    const [radius, setRadius] = useState(500);
    const [region, setRegion] = useState({
        latitude: 6.5243793,
        longitude: 3.3792057,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Allow location access to report ICE raids.');
                return;
            }
            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);
            fetchAddress(currentLocation.coords.latitude, currentLocation.coords.longitude);
            setRegion({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            });
        })();
    }, []);

    const searchAddress = async () => {
        if (!address.trim()) return alert('Please enter an address.');
        setSearching(true);
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
            );
            const data = await response.json();
            if (data.status === 'OK') {
                const location = data.results[0].geometry.location;
                setLocation({ latitude: location.lat, longitude: location.lng });
                setRegion({
                    latitude: location.lat,
                    longitude: location.lng,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                });
                fetchAddress(location.lat, location.lng);
            } else {
                alert('Location not found.');
            }
        } catch (error) {
            alert('Failed to fetch location.');
        } finally {
            setSearching(false);
        }
    };

    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
            );
            const data = await response.json();
            if (data.status === 'OK') {
                setReportedAddress(data.results[0].formatted_address);
            } else {
                setReportedAddress('Address not found');
            }
        } catch (error) {
            setReportedAddress('Error fetching address');
        }
    };

    const reportRaid = () => {
        if (!reportedAddress) {
            alert('No address found to report.');
            return;
        }
        alert(`ICE Raid Location:\n${reportedAddress}`);
    };

    const openMaps = () => {
        if (!location) {
            alert('No location found.');
            return;
        }
        const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
        Linking.openURL(url);
    };

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <MapView style={{ width: '100%', height: 300 }} region={region}>
                {location && (
                    <>
                        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title='ICE Raid Location' />
                        <Circle 
                            center={location}
                            radius={radius}
                            strokeWidth={1}
                            strokeColor={'rgba(0, 0, 255, 0.5)'}
                            fillColor={'rgba(0, 0, 255, 0.1)'}
                        />
                    </>
                )}
            </MapView>

            <TextInput label='Enter location...' value={address} onChangeText={setAddress} style={{ marginVertical: 10 }} />
            <Button mode='contained' onPress={searchAddress} loading={searching} style={{ marginBottom: 10 }}>
                Search Location
            </Button>
            {reportedAddress ? <Text style={{ textAlign: 'center', marginVertical: 10 }}>{reportedAddress}</Text> : null}

            <TextInput label='Describe the ICE raid...' value={description} onChangeText={setDescription} style={{ marginVertical: 10 }} />
            <Button mode='contained' onPress={reportRaid} style={{ marginBottom: 10 }}>
                Report ICE Raid
            </Button>
            <Button mode='contained' onPress={openMaps} style={{ marginBottom: 10 }}>
                Open in Maps
            </Button>
        </View>
    );
};

export default IceReporter;