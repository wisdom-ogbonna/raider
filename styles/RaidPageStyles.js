import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    padding: 10,
  },
  listContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2596be',
  },
  raidItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
  },
  raidText: {
    fontSize: 14,
    marginVertical: 3,
    color: '#333',
  },
  noRaidsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#777',
  },

  // Comment Section
  commentIcon: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  commentSection: {
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2596be',
  },
  commentInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    fontSize: 14,
  },

  // Floating Action Button
  supportFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2596be',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  supportFabText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 28,
  },
});
