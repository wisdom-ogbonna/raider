import React from 'react';
import { View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Appbar } from 'react-native-paper';

const Index = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="IceRaider" />
        <Appbar.Action icon="home" onPress={() => router.push('/')} />
        <Appbar.Action icon="flag" onPress={() => router.push('/report')} />
        <Appbar.Action icon="alert" onPress={() => router.push('/raids')} />
        <Appbar.Action icon="account" onPress={() => router.push('/profile')} />
      </Appbar.Header>
      
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Card style={{ width: '100%', padding: 20, alignItems: 'center' }}>
          <Text variant="titleLarge">Welcome to IceRaider</Text>
          <Text variant="bodyMedium" style={{ marginVertical: 10, textAlign: 'center' }}>
            Stay informed and report ICE raids in your area. Join our community today.
          </Text>
          <Button mode="contained" onPress={() => router.push('/signup')}>
            Sign Up
          </Button>
        </Card>
        
        <Card style={{ width: '100%', padding: 20, alignItems: 'center', marginTop: 20 }}>
          <Text variant="titleMedium">Know Your Rights sir</Text>
          <Text variant="bodyMedium" style={{ marginVertical: 10, textAlign: 'center' }}>
            Learn about your legal rights and what to do in case of an ICE raid.
          </Text>
          <Button mode="outlined" onPress={() => router.push('/learn-rights')}>
            Learn More
          </Button>
        </Card>
      </View>
    </View>
  );
};

export default Index;
