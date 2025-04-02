import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, StyleSheet, Alert, TextInput, Button } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { collection, getDocs, addDoc } from "firebase/firestore"; // Firestore functions
import { db } from '../../config/firebase'; // Firestore configuration
import { AuthContext } from '../../context/AuthContext'; // Firebase Auth Context
import { useRouter } from 'expo-router'; // Navigation

const RaidPage = () => {
  const [raids, setRaids] = useState([]);
  const [loading, setLoading] = useState(true);
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
        const raidList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), comments: [] }));
        setRaids(raidList);
      } catch (error) {
        Alert.alert('Error', 'Failed to load raids. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRaids();
  }, []);

  const handleCommentSubmit = (raidId, commentText) => {
    if (commentText.trim() === '') return;
    setRaids(prevRaids => prevRaids.map(raid => 
      raid.id === raidId ? { ...raid, comments: [...raid.comments, { text: commentText, id: Date.now() }] } : raid
    ));
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
                <View style={styles.commentList}>
                  {raid.comments.map((com) => (
                    <Text key={com.id} style={styles.commentText}>{com.text}</Text>
                  ))}
                </View>
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
  container: {
    padding: 10,
  },
  listContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
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
    fontSize: 14,
    marginVertical: 3,
  },
  noRaidsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#777',
  },
  commentSection: {
    marginTop: 10,
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    fontSize: 14,
    marginBottom: 10,
  },
  commentList: {
    marginTop: 10,
  },
  commentText: {
    fontSize: 14,
    marginVertical: 3,
    backgroundColor: '#f1f1f1',
    padding: 8,
    borderRadius: 5,
  },
});

export default RaidPage;
