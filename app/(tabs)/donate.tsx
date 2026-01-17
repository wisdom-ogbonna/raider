import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  ScrollView,
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
  // 🔵 STRIPE PAYMENT
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
    if (!name.trim()) return Alert.alert("Enter your name");
    if (!email.trim()) return Alert.alert("Enter your email");
    if (!amount || isNaN(amount)) return Alert.alert("Enter a valid amount");
    if (!cardComplete) return Alert.alert("Card info incomplete");

    setLoading(true);
    try {
      const cents = Math.round(parseFloat(amount) * 100);
      const clientSecret = await fetchClientSecret(cents, name, email);

      const { error } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });

      if (error) {
        Alert.alert("Payment failed", error.message);
      } else {
        Alert.alert("Success", "Donation completed successfully!");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    }

    setLoading(false);
  };

  // -----------------------
  // 🟠 PAYPAL PAYMENT
  // -----------------------
  const handlePayPalDonate = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return Alert.alert("Enter a valid amount");
    }

    try {
      const res = await fetch(`${API_URL}/api/donation/paypal/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount).toFixed(2),
          currency: "USD",
          description: "Donation",
        }),
      });

      const data = await res.json();

      if (data.approvalLink) {
        setPaypalUrl(data.approvalLink);
        setPaypalModal(true);
      } else {
        Alert.alert("PayPal Error", data.message || "No approval link returned");
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
      const orderID = url.split("token=")[1];

      fetch(`${API_URL}/api/donation/paypal/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID }),
      })
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Support Our Mission</Text>
      <Text style={styles.subtitle}>Choose your preferred payment method</Text>

      {/* DONATION INFO */}
      <View style={styles.infoCard}>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Full Name"
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="Email Address"
          keyboardType="email-address"
        />

        <TextInput
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
          placeholder="Donation Amount (USD)"
          keyboardType="decimal-pad"
        />
      </View>

      {/* STRIPE CARD PAYMENT */}
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <Text style={styles.paymentTitle}>Pay with Card</Text>
          <Text style={styles.badgeStripe}>Stripe</Text>
        </View>

        <CardField
          ref={cardRef}
          postalCodeEnabled={false}
          style={styles.cardField}
          cardStyle={{ backgroundColor: "#f1f5ff", textColor: "#000" }}
          onCardChange={(c) => setCardComplete(c.complete)}
        />

        <TouchableOpacity
          style={[styles.stripeButton, (!cardComplete || loading) && styles.disabled]}
          onPress={handleCardDonate}
          disabled={!cardComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Donate ${amount || "0"} with Card
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* PAYPAL PAYMENT */}
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <Text style={styles.paymentTitle}>Pay with PayPal</Text>
          <Text style={styles.badgePaypal}>PayPal</Text>
        </View>

        <Text style={styles.paypalDescription}>
          Pay securely using your PayPal balance or linked bank/card.
        </Text>

        <TouchableOpacity style={styles.paypalButton} onPress={handlePayPalDonate}>
          <Text style={styles.paypalText}>
            Donate ${amount || "0"} with PayPal
          </Text>
        </TouchableOpacity>
      </View>

      {/* PAYPAL MODAL */}
      <Modal visible={paypalModal} animationType="slide">
        <WebView
          source={{ uri: paypalUrl }}
          onNavigationStateChange={handleWebViewChange}
        />

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setPaypalModal(false)}
        >
          <Text style={styles.cancelText}>Close PayPal</Text>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8faff",
    padding: 20,
  },

  header: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 5,
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
    fontSize: 15,
  },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },

  input: {
    backgroundColor: "#eef2f7",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
  },

  paymentCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
  },

  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  paymentTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  badgeStripe: {
    backgroundColor: "#635BFF",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
  },

  badgePaypal: {
    backgroundColor: "#003087",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
  },

  cardField: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#f1f5ff",
    padding: 10,
    marginBottom: 20,
  },

  stripeButton: {
    backgroundColor: "#635BFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  paypalButton: {
    backgroundColor: "#FFC439",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  paypalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  paypalDescription: {
    color: "#666",
    marginBottom: 12,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  disabled: {
    opacity: 0.6,
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
    marginBottom: 40,
    alignItems: "center",
  },

  backText: {
    color: "#555",
    fontSize: 16,
  },
});
