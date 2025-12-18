import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,

    // Reduce space at the top
    paddingTop: Platform.OS === "ios" ? 40 : 30,

    backgroundColor: "#f0f4f8",
    alignItems: "center",
  },

  // Wrap your logo + title + subtitle + inputs inside a main content wrapper
  contentWrapper: {
    width: "100%",
    alignItems: "center",

    // This controls overall spacing between items
    gap: 10,  
  },

  title: {
    marginBottom: 2,
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 10, // reduced from 28 → closer
    textAlign: "center",
  },

  input: {
    marginBottom: 12,   // reduced from 18
    backgroundColor: "#ffffff",
    borderRadius: 10,
    fontSize: 15,
    width: "100%",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15, // reduced from 30
    gap: 6,
  },

  checkboxLabel: {
    fontSize: 14,
    color: "#0f172a",
    flexShrink: 1,
  },

  buttonContent: {
    height: 50,   // reduced from 56 → closer and tighter button
    justifyContent: "center",
    width: "100%",
  },

  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: "#ffffff",
    textAlign: "center",
  },

  footerLinks: {
    marginTop: 20, // reduced from 35
    alignItems: "center",
    gap: 10,
  },

  checkboxWrapper: {
    borderWidth: 2,
    borderColor: "#0d99b6",
    borderRadius: 6,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },

  footerLinksModern: {
    marginTop: 20,
    alignItems: "center",
    gap: 8,
  },

  linkText: {
    color: "#0d99b6",
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
    textAlign: "center",
  },
});

export default styles;
