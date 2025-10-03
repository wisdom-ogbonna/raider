import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },

  // Map covers the full background
  mapWrapper: {
    flex: 1,
  },
  map: {
    flex: 1,
  },

  // Floating form container
  formContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  button: {
    marginVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0084ff',
    elevation: 2,
    alignItems: 'center',
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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

  // Category dropdown styles
  categoryContainer: {
    marginHorizontal: 10,
    marginTop: 10,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  categoryButton: {
    borderColor: '#2196F3',
    borderWidth: 1.5,
    borderRadius: 12,
    justifyContent: 'flex-start',
  },
  categoryButtonContent: {
    justifyContent: 'flex-start',
    height: 50,
  },
  categoryButtonLabel: {
    color: '#2196F3',
    fontSize: 16,
  },
  categoryMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 10,
    marginHorizontal: 10,
    elevation: 3,
  },
  menuItem: {
    backgroundColor: 'transparent',
  },
  menuItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  menuItemTitle: {
    color: '#333',
    fontWeight: 'normal',
  },
  menuItemTitleSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
