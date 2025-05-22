import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { authClient } from "../lib/auth-client";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter, useLocalSearchParams, Link } from "expo-router";

export default function SignInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    registrationSuccess?: string;
    accountDeleted?: string;
  }>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (params?.registrationSuccess) {
      Alert.alert(
        "Registrierung erfolgreich",
        "Du kannst dich jetzt anmelden."
      );
    }
    if (params?.accountDeleted) {
      Alert.alert("Kontolöschung erfolgreich", params.accountDeleted);
    }
  }, [params]);

  const handleLogin = async () => {
    setErrorText("");
    setIsProcessing(true);
    try {
      await authClient.signIn.email({
        email,
        password,
      });
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error?.status === 403) {
        setErrorText(
          "Bitte verifiziere deine E-Mail-Adresse, bevor du dich einloggst."
        );
      } else if (error?.message) {
        setErrorText(error.message);
      } else {
        setErrorText("Login fehlgeschlagen. Bitte versuche es erneut.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    setErrorText("");
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data && userInfo.data.idToken) {
        await authClient.signIn.social({
          provider: "google",
          idToken: {
            token: userInfo.data.idToken,
          },
        });
      } else {
        throw new Error(
          "Google Sign-In succeeded but no ID token was returned."
        );
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
      setIsProcessing(false);
    }
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
        editable={!isProcessing}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        editable={!isProcessing}
      />
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      <Button title="Login" onPress={handleLogin} disabled={isProcessing} />

      <View style={styles.socialLoginContainer}>
        <Button
          title="Mit Google anmelden"
          onPress={handleGoogleSignIn}
          disabled={isProcessing}
          color="#DB4437"
        />
      </View>

      <Link href="/signUp" asChild>
        <TouchableOpacity
          style={styles.signupLinkContainer}
          disabled={isProcessing}
        >
          <Text style={styles.signupLinkText}>
            Noch kein Konto?{" "}
            <Text style={styles.signupLinkTextBold}>Registrieren</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

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
