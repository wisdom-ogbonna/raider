// In DonateScreenStyles.js or .ts
import { StyleSheet } from "react-native";

const brandColor = "#1e88e5";

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
  },
  amountButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  amountButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  customAmountInput: {
    marginBottom: 20,
  },
  recurringRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  recurringLabel: {
    marginLeft: 10,
  },
  divider: {
    marginVertical: 20,
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  donateButton: {
    marginTop: 20,
  },
  privacyNote: {
    fontSize: 12,
    color: "gray",
    marginTop: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginRight: 8,
  },
  logoTextContainer: {
    flexDirection: "column",
  },
  headlineText: {
    fontWeight: "bold",
  },
});

export default styles;
