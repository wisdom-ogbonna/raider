import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Map wrapper
  mapWrapper: {
    flex: 1,
    width: '100%',
  },
  map: {
    flex: 1,
  },

  // Center pin
  centerPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    zIndex: 10,
  },

  // Button to show the form
  showFormButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#0084ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },

  // Form overlay
  formOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0., // form occupies 70% of screen height
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  // Form-specific styles
  input: {
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
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
    color: '#fff',
    textAlign: 'center',
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
    paddingHorizontal: 10,
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
