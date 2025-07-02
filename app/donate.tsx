import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Card,
  Switch,
  RadioButton,
  Divider
} from 'react-native-paper';

const DonateScreen = () => {
  const [selectedAmount, setSelectedAmount] = useState('10');
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const brandColor = '#0d99b6';

  const handleDonate = () => {
    const amount = customAmount || selectedAmount;
    alert(`Thank you for donating $${amount}${isRecurring ? ' monthly' : ''}!`);
  };

  const renderAmountButton = (amount: string) => (
    <Button
      key={amount}
      mode={selectedAmount === amount ? 'contained' : 'outlined'}
      onPress={() => {
        setSelectedAmount(amount);
        setCustomAmount('');
      }}
      style={{ marginRight: 10, marginBottom: 10 }}
      buttonColor={selectedAmount === amount ? brandColor : undefined}
      textColor={selectedAmount === amount ? 'white' : brandColor}
    >
      ${amount}
    </Button>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Card style={{ padding: 20 }}>
        <Text variant="titleLarge" style={{ marginBottom: 10 }}>
          Support This App
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: 20 }}>
          Your donation helps keep our app running, alerts flowing, and families safe.{"\n"}
          100% user-funded. Private. Secure. For the people.
        </Text>

        <Text variant="titleMedium" style={{ marginBottom: 10 }}>
          Select Amount
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
          {['5', '10', '25', '50'].map(renderAmountButton)}
        </View>

        <TextInput
          label="Or enter custom amount"
          value={customAmount}
          onChangeText={setCustomAmount}
          keyboardType="numeric"
          mode="outlined"
          outlineColor={brandColor}
          activeOutlineColor={brandColor}
          style={{ marginBottom: 20 }}
          onFocus={() => setSelectedAmount('')}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Switch
            value={isRecurring}
            onValueChange={setIsRecurring}
            color={brandColor}
          />
          <Text style={{ marginLeft: 10 }}>Make this a monthly donation</Text>
        </View>

        <Divider style={{ marginBottom: 20 }} />

        <Text variant="titleMedium" style={{ marginBottom: 10 }}>
          Payment Method
        </Text>
        <RadioButton.Group
          onValueChange={value => setPaymentMethod(value)}
          value={paymentMethod}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RadioButton value="card" color={brandColor} />
            <Text>Credit / Debit Card</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RadioButton value="paypal" color={brandColor} />
            <Text>PayPal</Text>
          </View>
        </RadioButton.Group>

        {/* 🔒 Privacy Note */}
        <Text style={{ fontSize: 12, color: '#777', marginTop: 30, marginBottom: 15 }}>
          🛡️ We don’t store your data or share any of your info.
        </Text>

        <Button
          mode="contained"
          onPress={handleDonate}
          style={{ marginTop: 10 }}
          buttonColor={brandColor}
        >
          Protect Lives - Donate Now
        </Button>
      </Card>
    </ScrollView>
  );
};

export default DonateScreen;
