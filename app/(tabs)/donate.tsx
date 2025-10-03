import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import axios from "axios";

const DonationScreen = () => {
  const { confirmPayment } = useStripe();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState(null);

  const handleDonate = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid donation amount.");
      return;
    }

    if (!cardDetails?.complete) {
      Alert.alert("Incomplete Card", "Please enter complete card details.");
      return;
    }

    try {
      setLoading(true);

      // 1. Ask backend to create PaymentIntent
      const res = await axios.post(
        "http://192.168.1.79:5000/api/donations/create-payment-intent",
        {
          amount: Math.round(parseFloat(amount) * 100), // convert to cents
        }
      );

      const clientSecret = res.data.clientSecret;

      // 2. Confirm payment on the device using Stripe SDK
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });

      if (error) {
        Alert.alert("Payment failed", error.message);
      } else if (paymentIntent) {
        Alert.alert("Success 🎉", `Donation of $${amount} completed!`);
        setAmount("");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Donate to Support Us 💙</Text>

      <Text style={styles.label}>Donation Amount (USD)</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Enter amount"
        style={styles.input}
      />

      <Text style={styles.label}>Card Information</Text>
      <CardField
        postalCodeEnabled={false}
        placeholder={{ number: "4242 4242 4242 4242" }}
        cardStyle={styles.cardStyle}
        style={styles.cardField}
        onCardChange={(details) => setCardDetails(details)}
      />

      <TouchableOpacity
        onPress={handleDonate}
        disabled={loading}
        style={[styles.button, loading && styles.buttonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Donate Now</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default DonationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1E40AF", textAlign: "center", marginBottom: 30 },
  label: { fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 20, backgroundColor: "#fff" },
  cardStyle: { backgroundColor: "#fff", textColor: "#000", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12 },
  cardField: { height: 50, marginVertical: 10 },
  button: { marginTop: 30, backgroundColor: "#2563EB", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  buttonDisabled: { backgroundColor: "#93C5FD" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
