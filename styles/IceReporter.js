// IceReporter.styles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  input: {
    marginVertical: 10,
  },
  button: {
    marginBottom: 10,
    backgroundColor: '#0d99b6',
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 18,
  },
  reportedAddress: {
    textAlign: 'center',
    marginVertical: 10,
  },
  logoutButton: {
    marginTop: 20,
  },
    interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  likeButton: {
    backgroundColor: '#e0f7fa',
    padding: 6,
    borderRadius: 5,
  },
  reactionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reactionEmoji: {
    fontSize: 20,
    marginHorizontal: 4,
  },

});
