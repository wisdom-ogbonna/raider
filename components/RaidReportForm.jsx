import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Menu,
} from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function RaidReportForm({
  description,
  setDescription,
  reportedAddress,
  pickImage,
  image,
  selectedCategory,
  categoryOptions,
  menuVisible,
  setMenuVisible,
  categoryAnchorRef,
  setSelectedCategory,
  setCategory,
  reportRaid,
  reporting,
  selectedImage,
  setSelectedImage,
  setIsVisible,
  t,
  sourceLink,
  setSourceLink,
  carPlateNumber,
  setCarPlateNumber,
}) {
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 10 }}
      extraScrollHeight={150}
      enableOnAndroid={true}
      keyboardOpeningTime={0}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View>
        {/* Live Address */}
        {reportedAddress ? (
          <View style={{ padding: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              {t("iceReporter.selectedAddress")}
            </Text>
            <Text style={{ color: "#555" }}>{reportedAddress}</Text>
          </View>
        ) : (
          <Text style={{ padding: 10, color: "#888" }}>
            {t("iceReporter.fetchingAddress")}
          </Text>
        )}

        {/* Description Input */}
        <TextInput
          label={t("iceReporter.describeRaid")}
          value={description}
          onChangeText={setDescription}
          style={{
            marginVertical: 10,
            backgroundColor: "#fff",
          }}
          multiline
          mode="outlined"
          outlineColor="#E0E4EA"
          activeOutlineColor="#007AFF"
          placeholderTextColor="#888"
        />
        {/* Source Link Input */}
        <TextInput
          label="Source Link (optional)"
          value={sourceLink}
          onChangeText={setSourceLink}
          style={{ marginVertical: 10, backgroundColor: "#fff" }}
          mode="outlined"
          outlineColor="#E0E4EA"
          activeOutlineColor="#007AFF"
          placeholder="https://facebook.com/post..."
        />

        {/* Car Plate Number Input */}
        <TextInput
          label="Car Plate Number (optional)"
          value={carPlateNumber}
          onChangeText={setCarPlateNumber}
          style={{ marginVertical: 10, backgroundColor: "#fff" }}
          mode="outlined"
          outlineColor="#E0E4EA"
          activeOutlineColor="#007AFF"
          placeholder="ABC-123-XY"
        />

{/* Category Dropdown */}
<View style={{ marginVertical: 10 }}>
  <Menu
    visible={menuVisible}
    onDismiss={() => setMenuVisible(false)}
    anchor={
      <TouchableOpacity onPress={() => setMenuVisible(true)}>
        <View pointerEvents="none">
          <TextInput
            label="Category"
            value={selectedCategory.label}
            mode="outlined"
            outlineColor="#E0E4EA"
            activeOutlineColor="#007AFF"
            style={{ backgroundColor: "#fff" }}
            right={<TextInput.Icon icon="chevron-down" />}
          />
        </View>
      </TouchableOpacity>
    }
  >
    {categoryOptions.map((option) => (
      <Menu.Item
        key={option.value}
        title={option.label}
        onPress={() => {
          setSelectedCategory(option);
          setCategory(option.value);
          setMenuVisible(false);
        }}
      />
    ))}
  </Menu>
</View>




        {/* Pick Image */}
        <Button
          mode="contained"
          onPress={pickImage}
          style={{
            marginTop: 10,
            borderRadius: 8,
            backgroundColor: "#007AFF",
          }}
          contentStyle={{
            paddingVertical: 8,
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {image ? t("iceReporter.changeImage") : t("iceReporter.pickImage")}
        </Button>

        {/* Image Preview */}
        {image && (
          <TouchableOpacity
            onPress={() => {
              setSelectedImage([{ uri: image.uri }]);
              setIsVisible(true);
            }}
          >
            <Image
              source={{ uri: image.uri }}
              style={{
                width: "100%",
                height: 200,
                marginTop: 10,
                borderRadius: 12,
              }}
            />
          </TouchableOpacity>
        )}

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={reportRaid}
          style={{
            marginTop: 20,
            borderRadius: 8,
            backgroundColor: "#007AFF",
          }}
          contentStyle={{
            paddingVertical: 10,
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: "600",
          }}
          disabled={reporting}
        >
          {reporting ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
              <Text style={{ color: "#fff" }}>Submitting...</Text>
            </View>
          ) : (
            t("iceReporter.reportRaid")
          )}
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}
