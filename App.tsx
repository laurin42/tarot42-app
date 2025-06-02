import React, { useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Slot } from "expo-router"; // Expo Router's way to render the current route

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export default function App() {
  useEffect(() => {
    if (GOOGLE_WEB_CLIENT_ID) {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
      });
      console.log(
        "Google Sign-In Configured with Web Client ID:",
        GOOGLE_WEB_CLIENT_ID
      );
    } else {
      console.warn(
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set. Google Sign-In might not work correctly."
      );
    }
  }, []);

  return <Slot />;
}
