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
  Modal
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
import { WebView } from "react-native-webview";

const API_URL = "https://lamigra-backend.onrender.com";

export default function DonationScreen() {
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paypalModal, setPaypalModal] = useState(false);
  const [paypalUrl, setPaypalUrl] = useState("");

  const { confirmPayment } = useConfirmPayment();
  const navigation = useNavigation();
  const cardRef = useRef(null);

  // -----------------------
  // 🔵 STRIPE DONATION
  // -----------------------
  const fetchClientSecret = async (cents, name, email) => {
    const response = await fetch(`${API_URL}/api/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: cents, name, email }),
    });
    const data = await response.json();
    return data.clientSecret;
  };

  const handleCardDonate = async () => {
    if (!name.trim()) return Alert.alert("Enter Name");
    if (!email.trim()) return Alert.alert("Enter Email");
    if (!cardComplete) return Alert.alert("Card info incomplete");

    setLoading(true);
    try {
      const cents = Math.round(parseFloat(amount) * 100);
      const clientSecret = await fetchClientSecret(cents, name, email);

      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });

      if (error) Alert.alert("Payment failed", error.message);
      else Alert.alert("Success", "Donation completed successfully!");

    } catch (err) {
      Alert.alert("Error", err.message);
    }
    setLoading(false);
  };

  // -----------------------
  // 🟠 PAYPAL DONATION
  // -----------------------
const handlePayPalDonate = async () => {
  try {
    const res = await fetch(`${API_URL}/api/donation/paypal/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: "USD",
        description: "Donation",
      }),
    });

    const data = await res.json();

    if (data.approvalLink) {
      setPaypalUrl(data.approvalLink);
      setPaypalModal(true);
    } else {
      Alert.alert("PayPal Error", "No approval link returned");
    }

  } catch (e) {
    Alert.alert("PayPal Error", e.message);
  }
};


  // --------------------------
  // PAYPAL WEBVIEW HANDLING
  // --------------------------
const handleWebViewChange = (navState) => {
  const url = navState.url;

  if (url.includes("paypal/success")) {
    const orderID = url.split("token=")[1]; // Extract PayPal orderID

    fetch(`${API_URL}/api/donation/paypal/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID }),
    })
    .then(res => res.json())
    .then(() => {
      setPaypalModal(false);
      Alert.alert("Success", "PayPal Donation Completed!");
    })
    .catch(() => Alert.alert("Error", "Could not capture payment"));
  }

  if (url.includes("paypal/cancel")) {
    setPaypalModal(false);
    Alert.alert("Cancelled", "Donation cancelled");
  }
};


  // -----------------------

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Support Our Mission</Text>

      <View style={styles.cardContainer}>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#999"
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
        />

        <TextInput
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
          placeholder="Amount (USD)"
          keyboardType="decimal-pad"
        />

        <Text style={styles.section}>Pay With Card</Text>
        <CardField
          ref={cardRef}
          postalCodeEnabled={false}
          style={styles.cardField}
          cardStyle={{ backgroundColor: "#eef2f7", textColor: "#000" }}
          onCardChange={(c) => setCardComplete(c.complete)}
        />

        <TouchableOpacity
          style={[styles.button, (!cardComplete || loading) && styles.buttonDisabled]}
          onPress={handleCardDonate}
          disabled={!cardComplete || loading}
        >
          {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>Donate ${amount} (Card)</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.or}>— OR —</Text>

      <TouchableOpacity
        style={styles.paypalButton}
        onPress={handlePayPalDonate}
      >
        <Text style={styles.paypalText}>Donate with PayPal</Text>
      </TouchableOpacity>

      {/* PayPal WebView */}
      <Modal visible={paypalModal} animationType="slide">
        <WebView
          source={{ uri: paypalUrl }}
          onNavigationStateChange={handleWebViewChange}
        />
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setPaypalModal(false)}
        >
          <Text style={styles.cancelText}>Close</Text>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity
        style={styles.back}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

// -----------------------
// STYLES
// -----------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8faff",
    padding: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#1F1F1F",
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
  },
  section: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
    color: "#333",
  },
  input: {
    backgroundColor: "#eef2f7",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  cardField: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#eef2f7",
    padding: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#1F6FEB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#9bb8e2",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 17,
  },
  or: {
    textAlign: "center",
    marginVertical: 15,
    color: "#777",
    fontSize: 14,
  },
  paypalButton: {
    backgroundColor: "#FFC439",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  paypalText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
  },
  cancelButton: {
    padding: 15,
    backgroundColor: "#eee",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    color: "#444",
  },
  back: {
    marginTop: 20,
    alignItems: "center",
  },
  backText: {
    color: "#555",
    fontSize: 16,
  },
});