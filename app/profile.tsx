import React, { useContext, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import {
  Avatar,
  Text,
  Card,
  Divider,
  ActivityIndicator,
  Button,
  Appbar,
} from 'react-native-paper';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const [userRaids, setUserRaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const router = useRouter();
  const { t, i18n } = useTranslation();

  // Redirect anonymous users to /signup
  useEffect(() => {
    if (!authLoading && user?.isAnonymous) {
      router.replace('/signup');
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user || authLoading || user.isAnonymous) return;

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
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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

  const getInitial = () =>
    (profile?.name || user.displayName || 'U')[0].toUpperCase();

  const avatarUri = profile?.photoURL || user.photoURL;

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  if (loading || authLoading) {
    return (
      <ActivityIndicator animating={true} size="large" style={styles.loader} />
    );
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.Content
          title={
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Image
                source={require('../assets/images/logo.png')}
                style={{ width: 120, height: 120, marginLeft: 15 }}
              />
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                <Text variant="headlineMedium" style={{ color: 'white' }}>
                  LAMIGRA
                </Text>
              </View>
            </View>
          }
        />
        <Appbar.Action icon="home" onPress={() => router.push('/')} />
        <Appbar.Action icon="hand-heart" onPress={() => router.push('/donate')} />
        <Appbar.Action icon="account" onPress={() => router.push('/profile')} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {avatarUri ? (
              <Avatar.Image size={100} source={{ uri: avatarUri }} />
            ) : (
              <Avatar.Text size={100} label={getInitial()} />
            )}
          </View>

          <Text variant="titleLarge" style={styles.displayName}>
            {profile?.name || user.displayName || 'User'}
          </Text>

          <Text variant="bodyMedium" style={styles.points}>
            {t('profile.points')}: {userRaids.length * 10}
          </Text>

          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            {t('profile.logout')}
          </Button>

          {/* Language Switch */}
          <View style={styles.langSwitch}>
            <Button mode="outlined" onPress={() => changeLanguage('en')} style={{ marginRight: 10 }}>
              English
            </Button>
            <Button mode="outlined" onPress={() => changeLanguage('es')}>
              Español
            </Button>
          </View>
        </View>

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('profile.yourReports')}
        </Text>

        {userRaids.length === 0 ? (
          <Text variant="bodyMedium" style={styles.emptyText}>
            {t('profile.noReports')}
          </Text>
        ) : (
          userRaids.map((raid) => (
            <Card key={raid.id} style={styles.card}>
              <Card.Title
                title={`${t('profile.reportedOn')} ${new Date(
                  raid.createdAt?.toDate()
                ).toLocaleDateString()}`}
                subtitle={`${t('profile.address')}: ${raid.reportedAddress}`}
              />
              <Card.Content>
                <Text variant="bodyMedium">{raid.description}</Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </>
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
  avatarWrapper: {
    borderRadius: 50,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 10,
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
  langSwitch: {
    flexDirection: 'row',
    marginTop: 15,
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
