import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Sterne", // Changed from "Home"
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="star" color={color} /> // Changed icon to 'star'
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ich", // Changed from "Settings"
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} /> // Changed icon to 'user'
          ),
        }}
      />
      <Tabs.Screen
        name="karten" // This should match the filename karten.tsx
        options={{
          title: "Karten",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="map" color={color} /> // Example icon, change as needed
          ),
        }}
      />
    </Tabs>
  );
}
