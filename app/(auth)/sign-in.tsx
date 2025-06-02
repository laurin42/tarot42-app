import React from "react";
import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {
  authClient,
  SECURE_STORE_BEARER_TOKEN_KEY,
} from "../../lib/auth-client"; // Adjusted path and imported key
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter, useLocalSearchParams, Href } from "expo-router";
import * as SecureStore from "expo-secure-store";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  socialLoginContainer: {
    marginTop: 20,
    marginBottom: 15,
  },
  signupLinkContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  signupLinkText: {
    color: "blue",
  },
  signupLinkTextBold: {
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default function SignInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    registrationSuccess?: string;
    accountDeleted?: string;
  }>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (params.registrationSuccess === "true") {
      Alert.alert(
        "Registrierung erfolgreich",
        "Du kannst dich jetzt anmelden."
      );
      // No need to clear params with router.replace, new navigation won't have them
    }
    if (params.accountDeleted === "true") {
      Alert.alert("Kontolöschung erfolgreich", "Dein Konto wurde gelöscht.");
    }
  }, [params]);

  const handleLogin = async () => {
    setErrorText("");
    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });
      if (response.error) {
        console.error("Login failed context:", response.error);
        if ((response.error as any).status === 403) {
          // Type assertion for status
          setErrorText(
            "Bitte verifiziere deine E-Mail-Adresse, bevor du dich einloggst."
          );
        } else if (response.error.message) {
          setErrorText(response.error.message);
        } else {
          setErrorText("Login fehlgeschlagen. Bitte versuche es erneut.");
        }
      } else {
        // Successful login, attempt to extract and store token from response body
        console.log(
          "[sign-in.tsx] Email/Pass login successful. Response data:",
          response.data
        );
        let tokenToStore: string | null = null;

        if (response.data && typeof response.data === "object") {
          if (
            "token" in response.data &&
            typeof (response.data as any).token === "string"
          ) {
            tokenToStore = (response.data as any).token;
            console.log("[sign-in.tsx] Found token in response.data.token");
          } else if (
            "session" in response.data &&
            typeof (response.data as any).session === "object" &&
            (response.data as any).session !== null &&
            "token" in (response.data as any).session &&
            typeof (response.data as any).session.token === "string"
          ) {
            tokenToStore = (response.data as any).session.token;
            console.log(
              "[sign-in.tsx] Found token in response.data.session.token"
            );
          } else if (
            "bearerToken" in response.data &&
            typeof (response.data as any).bearerToken === "string"
          ) {
            tokenToStore = (response.data as any).bearerToken;
            console.log(
              "[sign-in.tsx] Found token in response.data.bearerToken"
            );
          } else if (
            "fullSessionTokenFromBackend" in response.data &&
            typeof (response.data as any).fullSessionTokenFromBackend ===
              "string"
          ) {
            // Fallback for consistency with Google Sign-In if backend uses this for all
            tokenToStore = (response.data as any).fullSessionTokenFromBackend;
            console.log(
              "[sign-in.tsx] Found token in response.data.fullSessionTokenFromBackend"
            );
          }
        }

        if (tokenToStore) {
          console.log(
            `[sign-in.tsx] Attempting to set token from email/pass login with key: ${SECURE_STORE_BEARER_TOKEN_KEY}`
          );
          await SecureStore.setItemAsync(
            SECURE_STORE_BEARER_TOKEN_KEY,
            tokenToStore
          );
          console.log(
            `[sign-in.tsx] Email/Pass login token stored in SecureStore under key: ${SECURE_STORE_BEARER_TOKEN_KEY}`,
            tokenToStore.substring(0, 30) + "..."
          );
        } else {
          console.warn(
            "[sign-in.tsx] Email/Pass login successful, but no token found in response body. Relying on header/global onSuccess if any."
          );
        }
        // Successful login will be handled by RootLayout redirection
        console.log(
          "[sign-in.tsx] Email/Pass login successful, awaiting redirection by RootLayout."
        );
      }
    } catch (error: any) {
      console.error("Login failed (catch block):", error);
      if (error.message) {
        setErrorText(error.message);
      } else {
        setErrorText("Ein unerwarteter Fehler ist aufgetreten.");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorText("");
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log("Google Sign-In userInfo:", JSON.stringify(userInfo)); // Log the full object

      // Check if sign-in was successful and idToken exists
      if (
        userInfo.type === "success" &&
        userInfo.data &&
        userInfo.data.idToken
      ) {
        console.log("ID Token received:", userInfo.data.idToken);
        console.log(
          "[sign-in.tsx] Attempting authClient.signIn.social with provider: google"
        );
        try {
          const signInResponse = await authClient.signIn.social({
            provider: "google",
            idToken: {
              token: userInfo.data.idToken,
            },
            // callbackURL will be handled by RootLayout redirection after session update
          });
          console.log(
            "[sign-in.tsx] authClient.signIn.social response:",
            signInResponse
          );
          // Check if the full token is now in the response body from the backend
          let tokenFromSocialSignIn: string | null = null;
          if (signInResponse.data && typeof signInResponse.data === "object") {
            if (
              "token" in signInResponse.data &&
              typeof (signInResponse.data as any).token === "string"
            ) {
              tokenFromSocialSignIn = (signInResponse.data as any).token;
              console.log(
                "[sign-in.tsx] Found token for social sign-in in signInResponse.data.token"
              );
            } else if (
              "fullSessionTokenFromBackend" in signInResponse.data &&
              typeof (signInResponse.data as any)
                .fullSessionTokenFromBackend === "string"
            ) {
              tokenFromSocialSignIn = (signInResponse.data as any)
                .fullSessionTokenFromBackend;
              console.log(
                "[sign-in.tsx] Found token for social sign-in in signInResponse.data.fullSessionTokenFromBackend"
              );
            }
          }

          if (tokenFromSocialSignIn) {
            console.log(
              "[sign-in.tsx] Full session token received from backend (social sign-in):",
              tokenFromSocialSignIn.substring(0, 30) + "..."
            );
            // Store this full token in SecureStore
            console.log(
              `[sign-in.tsx] Attempting to set token from social sign-in with key: ${SECURE_STORE_BEARER_TOKEN_KEY}`
            );
            await SecureStore.setItemAsync(
              SECURE_STORE_BEARER_TOKEN_KEY,
              tokenFromSocialSignIn
            );
            console.log(
              `[sign-in.tsx] Full session token stored in SecureStore under key: ${SECURE_STORE_BEARER_TOKEN_KEY}`
            );
          } else {
            console.warn(
              "[sign-in.tsx] Token (neither 'token' nor 'fullSessionTokenFromBackend') not found in signInResponse.data after social sign-in. SecureStore not updated."
            );
          }

          // Navigation to app content is typically handled by RootLayout based on session state change
          console.log(
            "[sign-in.tsx] Social sign-in successful, awaiting redirection by RootLayout."
          );
        } catch (socialError: any) {
          console.error(
            "[sign-in.tsx] Error during authClient.signIn.social call:",
            socialError
          );
          setErrorText(`Social sign-in failed: ${socialError.message}`);
          setIsGoogleLoading(false); // Ensure loading state is reset on error here
          return; // Stop execution if social sign-in fails
        }
        // Successful login will be handled by RootLayout redirection
      } else if (
        userInfo.type === "success" &&
        (!userInfo.data || !userInfo.data.idToken)
      ) {
        console.error(
          "Google Sign-In succeeded but no ID token was returned. UserInfo.data:",
          userInfo.data
        );
        throw new Error(
          "Google Sign-In succeeded but no ID token was returned."
        );
      } else {
        // Handle other cases like cancellation if necessary, though often caught by statusCodes
        console.error(
          "Google Sign-In was not successful or idToken missing, userInfo:",
          userInfo
        );
        throw new Error("Google Sign-In failed or idToken missing.");
      }
    } catch (error: any) {
      console.error("Google Sign-In failed:", error);
      let errorMessage =
        "Google Login fehlgeschlagen. Bitte versuche es erneut.";
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = "Google Login abgebrochen.";
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = "Google Login läuft bereits.";
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = "Google Play Services nicht verfügbar oder veraltet.";
      } else if (error.message) {
        errorMessage = `Google Login fehlgeschlagen: ${error.message}`;
      }
      setErrorText(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const navigateToSignUp = () => {
    setErrorText("");
    router.push("/(auth)/sign-up" as Href);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!isGoogleLoading}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        editable={!isGoogleLoading}
      />
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      <Button title="Login" onPress={handleLogin} disabled={isGoogleLoading} />

      <View style={styles.socialLoginContainer}>
        <Button
          title="Mit Google anmelden"
          onPress={handleGoogleSignIn}
          disabled={isGoogleLoading}
          color="#DB4437"
        />
      </View>

      <TouchableOpacity
        onPress={navigateToSignUp}
        style={styles.signupLinkContainer}
        disabled={isGoogleLoading}
      >
        <Text style={styles.signupLinkText}>
          Noch kein Konto?{" "}
          <Text style={styles.signupLinkTextBold}>Registrieren</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
