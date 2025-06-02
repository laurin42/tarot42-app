import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
    // We don't need to define screens here as they will be auto-discovered
    // from files in the (auth) directory, e.g., sign-in.tsx, sign-up.tsx
  );
}
