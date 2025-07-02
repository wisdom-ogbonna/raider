import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
  },
  input: {
    marginBottom: 10,
  },
  forgotText: {
    color: "#0d99b6",
    textAlign: "right",
    marginBottom: 10,
  },
  privacyNote: {
    fontSize: 12,
    color: "#777",
    marginBottom: 15,
    textAlign: "left",
  },
  buttonContent: {
    height: 55,
  },
  buttonLabel: {
    fontSize: 18,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButton: {
    marginTop: 15,
  },
  signupLink: {
    marginTop: 20,
  },
});

export default styles;
