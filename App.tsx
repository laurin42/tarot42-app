import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { authClient } from "./lib/auth-client";
import { NavigationContainer, useIsFocused } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import { RootStackParamList } from "./types/navigation";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const Stack = createNativeStackNavigator<RootStackParamList>();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export default function App() {
  const { data: session, isPending, error } = authClient.useSession();

  console.log("Verwendete Web Client ID:", GOOGLE_WEB_CLIENT_ID);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      // offlineAccess: true, // optional, falls Refresh Tokens benötigt
    });
  }, []);

  useEffect(() => {
    console.log(
      `App.tsx - Session state change: isPending=${isPending}, session=${JSON.stringify(
        session
      )}, error=${JSON.stringify(error)}, timestamp=${new Date().toISOString()}`
    );
  }, [session, isPending, error]);

  if (isPending || (session === undefined && !error)) {
    console.log(
      `App.tsx: Session is loading (isPending=${isPending}, session === undefined). timestamp=${new Date().toISOString()}`
    );
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    console.error(
      `App.tsx: Session error: ${JSON.stringify(
        error
      )}, timestamp=${new Date().toISOString()}`
    );
  }

  console.log(
    `App.tsx: Rendering based on session: ${JSON.stringify(
      session
    )}, timestamp=${new Date().toISOString()}`
  );

  return (
    <NavigationContainer key={session ? "auth" : "no-auth"}>
      <Stack.Navigator>
        {session && !error ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
