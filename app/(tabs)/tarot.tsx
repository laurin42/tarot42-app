import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TarotScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarot Screen</Text>
      <Text>Welcome to the Tarot section!</Text>
      {/* Add your Tarot related components and logic here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
