import React from 'react';
import { View, Image } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Appbar } from 'react-native-paper';

const Index = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content 
          title={
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {/* Logo aligned to the left */}
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={{ width: 120, height: 120, marginLeft: 15 }} 
              />
              {/* Title with flex to push it to the right */}
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                <Text variant="headlineMedium" style={{ color: 'white' }}>
                  IceRaider
                </Text>
              </View>
            </View>
          } 
        />
        <Appbar.Action icon="home" onPress={() => router.push('/')} />
        <Appbar.Action icon="flag" onPress={() => router.push('/report')} />
        <Appbar.Action icon="alert" onPress={() => router.push('/raids')} />
      </Appbar.Header>
      
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Card style={{ width: '100%', padding: 20, alignItems: 'center' }}>
          <Text variant="titleLarge">Welcome to IceRaider</Text>
          <Text variant="bodyMedium" style={{ marginVertical: 10, textAlign: 'center' }}>
            Stay informed and report ICE raids in your area. Join our community today.
          </Text>
          <Button
            mode="contained"
            buttonColor="#0d99b6"
            textColor="#ffffff"
            onPress={() => router.push('/signup')}
            style={{ paddingVertical: 15, paddingHorizontal: 30, fontSize: 18 }}  // Increased button size
          >
            Sign Up
          </Button>
        </Card>
        
        <Card style={{ width: '100%', padding: 20, alignItems: 'center', marginTop: 20 }}>
          <Text variant="titleMedium">Know Your Rights</Text>
          <Text variant="bodyMedium" style={{ marginVertical: 10, textAlign: 'center' }}>
            Learn about your legal rights and what to do in case of an ICE raid.
          </Text>
          <Button
            mode="outlined"
            buttonColor="#0d99b6"
            textColor="#ffffff"
            onPress={() => router.push('/learn-rights')}
            style={{ paddingVertical: 15, paddingHorizontal: 30, fontSize: 18 }}  // Increased button size
          >
            Learn More
          </Button>
        </Card>
      </View>
    </View>
  );
};

export default Index;
