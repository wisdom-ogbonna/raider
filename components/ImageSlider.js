import React, { useState } from "react";
import { View, ScrollView, Image, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const ImageSlider = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <View style={{ marginTop: 12 }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const slide = Math.round(
            e.nativeEvent.contentOffset.x / width
          );
          setActiveIndex(slide);
        }}
        scrollEventThrottle={16}
      >
        {images.map((img, index) => (
          <Image
            key={index}
            source={{ uri: img }}
            style={{
              width: width - 60,
              height: 220,
              borderRadius: 12,
              marginRight: 10,
            }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Dots Indicator */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 6,
        }}
      >
        {images.map((_, i) => (
          <View
            key={i}
            style={{
              height: 6,
              width: activeIndex === i ? 16 : 6,
              borderRadius: 3,
              marginHorizontal: 3,
              backgroundColor: activeIndex === i ? "#0d99b6" : "#ccc",
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default ImageSlider;
