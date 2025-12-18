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
  setSelectedCategory,
  setCategory,
  reportRaid,
  reporting,
  selectedImage,
  setSelectedImage,
  setIsVisible,
  t,
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

        {/* Category Dropdown */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ marginBottom: 6, fontWeight: "500" }}>Category</Text>

          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            style={{
              borderColor: "#E0E4EA",
              
            }}
            contentStyle={{
              paddingVertical: 6,
            }}
            labelStyle={{
              fontSize: 15,
              textAlign: "left",
              width: "100%",
            }}
          >
            {selectedCategory.label}
          </Button>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <View style={{ width: "100%", alignItems: "center" }}>
                <Text></Text>
              </View>
            }
            style={{
              alignSelf: "center",
              width: "90%",
            }}
          >
            {categoryOptions.map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  setSelectedCategory(option);
                  setCategory(option.value);
                  setMenuVisible(false);
                }}
                title={option.label}
                titleStyle={{
                  fontSize: 15,
                  color:
                    option.value === selectedCategory.value
                      ? "#007AFF"
                      : "#333",
                }}
                style={{
                  backgroundColor:
                    option.value === selectedCategory.value
                      ? "#EAF2FF"
                      : "#fff",
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
            backgroundColor: '#007AFF'
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
            backgroundColor: '#007AFF'
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
