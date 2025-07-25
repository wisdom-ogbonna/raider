import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  mapWrapper: {
    height: 420,
    marginVertical: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    backgroundColor: "#ffffff",
  },
  map: {
    flex: 1,
  },
  centerPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    zIndex: 10,
  },
  input: {
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  button: {
    marginVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0084ff',
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportedAddress: {
    textAlign: 'center',
    marginVertical: 12,
    fontStyle: 'italic',
    fontSize: 14,
    color: '#444',
  },
  previewImage: {
    width: '100%',
    height: 220,
    marginVertical: 12,
    borderRadius: 16,
    borderColor: '#ddd',
    borderWidth: 1,
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
    backgroundColor: '#d0f0fd',
    padding: 8,
    borderRadius: 8,
  },
  reactionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reactionEmoji: {
    fontSize: 22,
    marginHorizontal: 5,
  },
  mapTypeButton: {
    marginTop: 12,
    alignSelf: 'center',
    borderColor: '#0084ff',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
