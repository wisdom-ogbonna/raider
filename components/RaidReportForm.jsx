import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Menu,
} from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";

export default function RaidReportForm({
  description,
  setDescription,
  reportedAddress,
  pickImage,
  images,
  selectedCategory,
  categoryOptions,
  menuVisible,
  setMenuVisible,
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
            {t("iceReporter.fetchingAddress", "Fetching address...")}
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
          placeholder={t("iceReporter.describeRaid")}
          placeholderTextColor="#888"
        />

        {/* Source Link Input */}
        <TextInput
          label={t("iceReporter.sourceLink", "Source Link (optional)")}
          value={sourceLink}
          onChangeText={setSourceLink}
          style={{ marginVertical: 10, backgroundColor: "#fff" }}
          mode="outlined"
          outlineColor="#E0E4EA"
          activeOutlineColor="#007AFF"
          placeholder={t(
            "iceReporter.sourceLinkPlaceholder",
            "https://facebook.com/post..."
          )}
        />

        {/* Car Plate Number Input */}
        <TextInput
          label={t("iceReporter.carPlateNumber", "Car Plate Number (optional)")}
          value={carPlateNumber}
          onChangeText={setCarPlateNumber}
          style={{ marginVertical: 10, backgroundColor: "#fff" }}
          mode="outlined"
          outlineColor="#E0E4EA"
          activeOutlineColor="#007AFF"
          placeholder={t("iceReporter.carPlateNumberPlaceholder", "ABC-123-XY")}
        />

        {/* Category Dropdown */}
        <View style={{ marginVertical: 10 }}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <View style={ui.categoryInput}>
                  {selectedCategory?.icon && (
                    <Image
                      source={selectedCategory.icon}
                      style={ui.categoryIcon}
                    />
                  )}
                  <Text style={ui.categoryText}>
                    {selectedCategory?.label ||
                      t("iceReporter.selectCategory", "Select Category")}
                  </Text>
                  <Ionicons name="chevron-down" size={22} color="#666" />
                </View>
              </TouchableOpacity>
            }
            contentStyle={ui.menuContainer}
          >
            {categoryOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={ui.menuItemContainer}
                onPress={() => {
                  setSelectedCategory(option);
                  setCategory(option.value);
                  setMenuVisible(false);
                }}
              >
                {option.icon && (
                  <Image source={option.icon} style={ui.menuIcon} />
                )}
                <Text style={ui.menuLabel}>{option.label}</Text>
              </TouchableOpacity>
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
          {images.length > 0
            ? t("iceReporter.addMoreImages")
            : t("iceReporter.pickImage")}
        </Button>

        {/* Image Preview */}
        {images.length > 0 && (
          <View
            style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap" }}
          >
            {images.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedImage(images.map((i) => ({ uri: i.uri })));
                  setIsVisible(true);
                }}
                style={{ marginRight: 8, marginBottom: 8 }}
              >
                <Image
                  source={{ uri: img.uri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 10,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
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
              <Text style={{ color: "#fff" }}>
                {t("iceReporter.submitting", "Submitting...")}
              </Text>
            </View>
          ) : (
            t("iceReporter.reportRaid")
          )}
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}

const ui = StyleSheet.create({
  categoryInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
    resizeMode: "contain",
  },
  categoryText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  menuContainer: {
    borderRadius: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    minWidth: 200,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: "#f9f9f9",
  },
  menuIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
    resizeMode: "contain",
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
  },
});
