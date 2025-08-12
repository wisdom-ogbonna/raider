import React, { useState } from "react";
import {
  View,
  ScrollView,
  Linking,
  Alert,
  Image as RNImage,
} from "react-native";
import {
  Text,
  Button,
  TextInput,
  Card,
  Switch,
  RadioButton,
  Divider,
  Appbar,
  ActivityIndicator,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import axios from "axios";

const DonateScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const brandColor = "#0d99b6";

  const [selectedAmount, setSelectedAmount] = useState("10");
  const [customAmount, setCustomAmount] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    const amount = customAmount || selectedAmount;
    if (!amount) {
      Alert.alert("Error", "Please enter or select a donation amount.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://lamigra-backend.onrender.com/api/donate",
        {
          amount,
          currency: "USD",
        }
      );

      const approveLink = response.data.approveLink;
      if (approveLink) {
        Linking.openURL(approveLink);
      } else {
        Alert.alert("Error", "Unable to retrieve PayPal approval link.");
      }
    } catch (error) {
      console.error("Donation Error:", error.message);
      Alert.alert("Error", "Donation failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderAmountButton = (amount) => (
    <Button
      key={amount}
      mode={selectedAmount === amount ? "contained" : "outlined"}
      onPress={() => {
        setSelectedAmount(amount);
        setCustomAmount("");
      }}
      style={{ marginRight: 10, marginBottom: 10 }}
      buttonColor={selectedAmount === amount ? brandColor : undefined}
      textColor={selectedAmount === amount ? "white" : brandColor}
    >
      ${amount}
    </Button>
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.Content
          title={
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <RNImage
                source={require("../../assets/images/logo.png")}
                style={{ width: 120, height: 120, marginLeft: 15 }}
              />
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                <Text variant="headlineMedium" style={{ color: "white" }}>
                  LAMIGRA
                </Text>
              </View>
            </View>
          }
        />
        <Appbar.Action
          icon="home"
          onPress={() => navigation.navigate("(tabs)")}
        />
        <Appbar.Action
          icon="hand-heart"
          onPress={() => navigation.navigate("donate")}
        />
        <Appbar.Action
          icon="account"
          onPress={() => navigation.navigate("profile")}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card style={{ padding: 20 }}>
          <Text variant="titleLarge" style={{ marginBottom: 10 }}>
            {t("donate.supportTitle")}
          </Text>

          <Text variant="bodyMedium" style={{ marginBottom: 20 }}>
            {t("donate.supportMessage")}
          </Text>

          <Text variant="titleMedium" style={{ marginBottom: 10 }}>
            {t("donate.selectAmount")}
          </Text>

          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}
          >
            {["5", "10", "25", "50"].map(renderAmountButton)}
          </View>

          <TextInput
            label={t("donate.customAmountLabel")}
            value={customAmount}
            onChangeText={setCustomAmount}
            keyboardType="numeric"
            mode="outlined"
            outlineColor={brandColor}
            activeOutlineColor={brandColor}
            style={{ marginBottom: 20 }}
            onFocus={() => setSelectedAmount("")}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              color={brandColor}
            />
            <Text style={{ marginLeft: 10 }}>{t("donate.monthlyToggle")}</Text>
          </View>

          <Divider style={{ marginBottom: 20 }} />

          <Text variant="titleMedium" style={{ marginBottom: 10 }}>
            {t("donate.paymentMethod")}
          </Text>

          <RadioButton.Group
            onValueChange={(value) => setPaymentMethod(value)}
            value={paymentMethod}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <RadioButton value="card" color={brandColor} />
              <Text>{t("donate.card")}</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <RadioButton value="paypal" color={brandColor} />
              <Text>{t("donate.paypal")}</Text>
            </View>
          </RadioButton.Group>

          <Text
            style={{
              fontSize: 12,
              color: "#777",
              marginTop: 30,
              marginBottom: 15,
            }}
          >
            {t("donate.privacyNote")}
          </Text>

          <Button
            mode="contained"
            onPress={handleDonate}
            style={{ marginTop: 10 }}
            buttonColor={brandColor}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              t("donate.donateButton")
            )}
          </Button>
        </Card>
      </ScrollView>
    </>
  );
};

export default DonateScreen;
