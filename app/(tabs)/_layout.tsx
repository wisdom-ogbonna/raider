import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="report" options={{ title: 'Report' }} />
      <Tabs.Screen name="raids" options={{ title: 'Raids' }} />
      <Tabs.Screen name="signin" options={{ title: 'Signin' }} />
    </Tabs>
  );
}
