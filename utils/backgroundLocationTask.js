// backgroundLocationTask.js
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from '../config/firebase.js'; // import your Firebase config

const LOCATION_TASK_NAME = 'background-location-task';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location Task Error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const user = auth.currentUser;

    if (user && locations.length > 0) {
      const { latitude, longitude } = locations[0].coords;
      console.log('Sending location:', latitude, longitude);

      try {
        const idToken = await user.getIdToken();
        await fetch('https://lamigra-backend.onrender.com/api/update-location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ latitude, longitude }),
        });
        console.log('Location update sent');
      } catch (err) {
        console.error('Error sending location:', err);
      }
    } else {
      console.warn('No user or empty location data');
    }
  }
});

export const startBackgroundLocationUpdates = async () => {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== 'granted') return;

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    distanceInterval: 100,
    timeInterval: 10000,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "IceRaider is running",
      notificationBody: "Tracking your location to alert you of nearby ICE raids.",
    },
  });
};
