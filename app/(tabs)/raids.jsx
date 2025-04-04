import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, StyleSheet, Alert, TextInput, Button } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

const RaidPage = () => {
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
      collection(db, "ice_raids"),
      orderBy("createdAt", "desc") // Orders the raids by createdAt in descending order
    );

    const unsubscribe = onSnapshot(
      raidQuery,
      (snapshot) => {
        const raidList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRaids(raidList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching raids:", error);
        Alert.alert('Error', 'Failed to load raids. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const reportRaid = async (description, reportedAddress) => {
    if (!reportedAddress || !description) {
      Alert.alert('Error', 'Please provide all details.');
      return;
    }

    try {
      const raidRef = await addDoc(collection(db, "ice_raids"), {
        description,
        reportedAddress,
        reportedBy: user ? user.uid : 'Anonymous',
        createdAt: serverTimestamp(),
      });

      console.log("Raid reported with ID:", raidRef.id);
      Alert.alert('Success', 'ICE raid reported successfully!');
    } catch (error) {
      console.error("Error reporting raid:", error);
      Alert.alert('Error', 'Failed to report the ICE raid. Please try again.');
    }
  };

  const handleCommentSubmit = async (raidId, commentText) => {
    if (commentText.trim() === '') return;

    try {
      await addDoc(collection(db, `ice_raids/${raidId}/comments`), {
        text: commentText,
        createdAt: serverTimestamp(),
        commentedBy: user ? user.uid : 'Anonymous',
      });
      Alert.alert('Success', 'Comment added!');
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert('Error', 'Failed to add comment.');
    }
  };

  if (loading || authLoading) {
    return <ActivityIndicator animating={true} size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.listContainer}>
        <Text style={styles.title}>Latest Reports</Text>
        {raids.length > 0 ? (
          raids.map((raid) => (
            <View key={raid.id} style={styles.raidItem}>
              <Text style={styles.raidText}><Text style={{ fontWeight: 'bold' }}>Address: </Text>{raid.reportedAddress}</Text>
              <Text style={styles.raidText}><Text style={{ fontWeight: 'bold' }}>Description: </Text>{raid.description}</Text>
              <Text style={styles.raidText}><Text style={{ fontWeight: 'bold' }}>Reported By: </Text>{raid.reportedBy || 'Anonymous'}</Text>
              
              <View style={styles.commentSection}>
                <Text style={styles.commentTitle}>Leave a Comment</Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  onSubmitEditing={(event) => handleCommentSubmit(raid.id, event.nativeEvent.text)}
                />
                <Button title="Submit" color="#0d99b6" onPress={() => handleCommentSubmit(raid.id, 'Sample Comment')} />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noRaidsText}>No reports yet.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  listContainer: { marginTop: 20 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  raidItem: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginVertical: 5, backgroundColor: '#f9f9f9' },
  raidText: { fontSize: 14, marginVertical: 3 },
  noRaidsText: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#777' },
  commentSection: { marginTop: 10, padding: 10, borderTopWidth: 1, borderColor: '#ddd' },
  commentTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  commentInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, fontSize: 14, marginBottom: 10 },
});

export default RaidPage;
