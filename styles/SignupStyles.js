import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    backgroundColor: "#f0f4f8",
  },

  title: {
    marginBottom: 8,
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
  },

  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 28,
  },

  input: {
    marginBottom: 18,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    fontSize: 15,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    gap: 10,
  },

  checkboxLabel: {
    fontSize: 14,
    color: "#0f172a",
    flexShrink: 1,
  },

  buttonContent: {
    height: 56,
    justifyContent: "center",
  },

  buttonLabel: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: "#ffffff",
  },

  footerLinks: {
    marginTop: 35,
    alignItems: "center",
    gap: 14,
  },

  checkboxWrapper: {
    borderWidth: 2,
    borderColor: "#0d99b6",
    borderRadius: 6,
    padding: 2, // Optional: gives a bit of space between border and checkbox
    justifyContent: "center",
    alignItems: "center",
  },

  footerLinksModern: {
  marginTop: 25,
  alignItems: "center",
  gap: 10, // or use `flexDirection: "column"` with `marginBottom`
},

linkText: {
  color: "#0d99b6",
  fontSize: 14,
  fontWeight: "500",
  textDecorationLine: "underline",
},

  
});

export default styles;
