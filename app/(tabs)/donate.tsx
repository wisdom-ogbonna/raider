import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Keyboard,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";

const API_URL = "https://lamigra-backend.onrender.com";

export default function DonationScreen() {
  const [amount, setAmount] = useState("5.00");
  const [cardComplete, setCardComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardFocused, setCardFocused] = useState(false);
  const { confirmPayment } = useConfirmPayment();
  const navigation = useNavigation();
  const cardRef = useRef(null);

  const fetchClientSecret = async (cents) => {
    const response = await fetch(`${API_URL}/api/donations/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: cents }),
    });
    const data = await response.json();
    if (!data.clientSecret) throw new Error("Invalid client secret");
    return data.clientSecret;
  };

  const handleDonate = async () => {
    if (!cardComplete) return Alert.alert("Card details", "Please enter complete card information.");

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return Alert.alert("Invalid amount", "Enter valid amount");

    if (loading) return;

    setLoading(true);
    try {
      const clientSecret = await fetchClientSecret(Math.round(parsedAmount * 100));
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });
      if (error) Alert.alert("Payment failed", error.message);
      else if (paymentIntent) {
        Alert.alert("Success", "Donation completed successfully!");
        setAmount("5.00");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    // Only dismiss if card is not focused
    if (!cardFocused) Keyboard.dismiss();
  };

  return (
    <View
      style={styles.container}
      onStartShouldSetResponder={dismissKeyboard}
    >
      <Text style={styles.header}>Support Our Mission</Text>

      <View style={styles.cardContainer}>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor="#999"
          selectionColor="#1F6FEB"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />

        <CardField
          ref={cardRef}
          postalCodeEnabled={false}
          style={styles.cardField}
          cardStyle={{ backgroundColor: "#eef2f7", textColor: "#000" }}
          onCardChange={(card) => setCardComplete(card?.complete ?? false)}
          onFocus={() => setCardFocused(true)}
          onBlur={() => setCardFocused(false)}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, (!cardComplete || loading) && styles.buttonDisabled]}
        disabled={!cardComplete || loading}
        onPress={handleDonate}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Donate ${amount}</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f6fa", justifyContent: "center", padding: 20 },
  header: { fontSize: 26, fontWeight: "700", color: "#1F1F1F", textAlign: "center", marginBottom: 30 },
  cardContainer: { backgroundColor: "#fff", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 5, marginBottom: 30 },
  input: { borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 20, backgroundColor: "#eef2f7", color: "#000", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  cardField: { height: 50, borderRadius: 12, backgroundColor: "#eef2f7", padding: 10 },
  button: { backgroundColor: "#1F6FEB", paddingVertical: 16, borderRadius: 16, alignItems: "center", shadowColor: "#1F6FEB", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  buttonDisabled: { backgroundColor: "#a0bce6", shadowOpacity: 0 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  cancelButton: { marginTop: 20, alignItems: "center" },
  cancelText: { color: "#555", fontSize: 16, fontWeight: "500" },
});
