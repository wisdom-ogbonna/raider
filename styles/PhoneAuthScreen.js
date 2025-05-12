import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f0f4f8',
  },
  card: {
    padding: 24,
    borderRadius: 20,
    elevation: 4,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  phoneInputContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  phoneInputText: {
    fontSize: 16,
  },
  codeText: {
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
});

export default styles;
