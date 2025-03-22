import { Tabs } from 'expo-router';
import { AuthProvider, AuthContext } from "../../context/AuthContext"; // Import AuthContext
import { useContext } from 'react';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router'; // Import the router hook

export default function TabLayout() {
  const { user, loading } = useContext(AuthContext); // Access user and loading status from AuthContext
  const router = useRouter(); // Initialize router

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <AuthProvider>
      <Tabs>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen
          name="report"
          options={{ title: 'Report' }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (!user) {
                e.preventDefault(); 
                router.replace('/signin'); // Use router here for navigation
              }
            },
          })}
        />
        <Tabs.Screen name="raids" options={{ title: 'Raids' }} />
        <Tabs.Screen name="signin" options={{ title: 'Sign In' }} />
      </Tabs>
    </AuthProvider>
  );
}
