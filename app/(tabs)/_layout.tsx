import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";
import { AuthGuard } from "../../components/guards/AuthGuard";
import { OnboardingGuard } from "../../components/guards/OnboardingGuard";

export default function TabLayout() {
  return (
    <AuthGuard>
      <OnboardingGuard>
        <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
          <Tabs.Screen
            name="horoscope"
            options={{
              title: "Horoskop", // Changed from "Home"
              tabBarIcon: ({ color }) => (
                <FontAwesome size={28} name="star" color={color} /> // Changed icon to 'star'
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profil",
              tabBarIcon: ({ color }) => (
                <FontAwesome size={28} name="user" color={color} /> // Changed icon to 'user'
              ),
            }}
          />
          <Tabs.Screen
            name="cards" // This should match the filename karten.tsx
            options={{
              title: "Tarot",
              tabBarIcon: ({ color }) => (
                <FontAwesome size={28} name="map" color={color} /> // Example icon, change as needed
              ),
            }}
          />
        </Tabs>
      </OnboardingGuard>
    </AuthGuard>
  );
}
