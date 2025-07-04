import React, { useContext, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Avatar, Text, Card, Divider, ActivityIndicator, Button } from 'react-native-paper';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'expo-router'; // Navigation

const ProfilePage = () => {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const [userRaids, setUserRaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();

    const q = query(
      collection(db, 'ice_raids'),
      where('reportedBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserRaids(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/signin');
    } catch (error) {
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  if (loading || authLoading) {
    return <ActivityIndicator animating={true} size="large" style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileSection}>
        <Avatar.Image 
          size={100} 
          source={{ uri: user.photoURL || 'https://i.pravatar.cc/300' }} 
        />
        <Text variant="titleLarge" style={styles.displayName}>
          {profile?.name || user.displayName || 'User'}
        </Text>
        <Text variant="bodyMedium" style={styles.points}>
          Points: {userRaids.length * 10}
        </Text>

        {/* Logout Button */}
        <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton}>
          Logout
        </Button>
      </View>

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Your Reports
      </Text>

      {userRaids.length === 0 ? (
        <Text variant="bodyMedium" style={styles.emptyText}>
          You haven't reported any raids yet.
        </Text>
      ) : (
        userRaids.map((raid) => (
          <Card key={raid.id} style={styles.card}>
            <Card.Title 
              title={`Reported at ${new Date(raid.createdAt?.toDate()).toLocaleDateString()}`}
              subtitle={`Address: ${raid.reportedAddress}`} 
            />
            <Card.Content>
              <Text variant="bodyMedium">{raid.description}</Text>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  loader: {
    marginTop: 100,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  displayName: {
    marginTop: 10,
    fontWeight: '600',
  },
  points: {
    color: '#777',
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 15,
    borderColor: '#ff4444',
    borderWidth: 1,
    width: '50%',
  },
  divider: {
    marginBottom: 20,
    backgroundColor: '#ccc',
  },
  sectionTitle: {
    marginBottom: 10,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
  card: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
});

export default ProfilePage;
