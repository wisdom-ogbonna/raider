import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  mapContainer: {
    height: '100%',
    maxHeight: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  input: {
    marginVertical: 6,
  },
  button: {
    marginVertical: 4,
    borderRadius: 6,
     backgroundColor: '#0d99b6'
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 12,
  },
  reportedAddress: {
    textAlign: 'center',
    marginVertical: 8,
    fontStyle: 'italic',
    color: '#333',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginVertical: 10,
    borderRadius: 12,
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

  mapTypeButton: {
  marginTop: 10,
  alignSelf: 'center',
  borderColor: '#0d99b6',
  borderWidth: 1,
  borderRadius: 6,
},

mapWrapper: {
  height: 400,
  marginVertical: 16,
  borderRadius: 16,
  overflow: "hidden",
  elevation: 4,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  backgroundColor: "#fff",
},

map: {
  flex: 1,
},


});
