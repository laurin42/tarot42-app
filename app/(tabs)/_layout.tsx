import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Example icon library

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={
        {
          // tabBarActiveTintColor: 'blue', // Customize as needed
        }
      }
    >
      <Tabs.Screen
        name="tarot" // This will refer to tarot.tsx
        options={{
          title: "Tarot",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size} color={color} /> // Example icon
          ),
        }}
      />
      <Tabs.Screen
        name="profile" // This will refer to profile.tsx
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} /> // Example icon
          ),
        }}
      />
      <Tabs.Screen
        name="horoscope" // This will refer to horoscope.tsx
        options={{
          title: "Horoskop",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} /> // Example icon
          ),
        }}
      />
    </Tabs>
  );
}
