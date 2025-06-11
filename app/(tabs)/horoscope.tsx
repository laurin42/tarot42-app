import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HoroscopeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horoskop</Text>
      {/* Content for the Horoscope tab will go here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // A light background color
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333", // Darker text color for the title
  },
});
