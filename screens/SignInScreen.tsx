import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { authClient } from "../lib/auth-client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";

// Props-Typen korrekt definieren
type SignInScreenNavigationProp = NativeStackScreenProps<
  RootStackParamList,
  "SignIn"
>["navigation"];
type SignInScreenRouteProp = NativeStackScreenProps<
  RootStackParamList,
  "SignIn"
>["route"];

interface SignInScreenProps {
  navigation: SignInScreenNavigationProp;
  route: SignInScreenRouteProp;
}

export default function SignInScreen({ navigation, route }: SignInScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [infoText, setInfoText] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    // Prüft, ob der Parameter 'registrationSuccess' von SignUpScreen übergeben wurde
    if (route.params?.registrationSuccess) {
      setInfoText(
        "Registrierung erfolgreich! Bitte überprüfe dein E-Mail-Postfach und klicke auf den Bestätigungslink. Danach kannst du dich hier anmelden."
      );
      // Wichtig: Den Parameter zurücksetzen, damit die Nachricht nicht bei jeder Rückkehr zum Screen erneut erscheint
      navigation.setParams({ registrationSuccess: undefined });
    }
  }, [route.params?.registrationSuccess, navigation]); // Abhängigkeiten des Effekts

  const handleLogin = async () => {
    setErrorText("");
    setInfoText("");
    try {
      await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onError: (ctx) => {
            console.error("Login failed context:", ctx);
            if (ctx.error?.status === 403) {
              setErrorText(
                "Bitte verifiziere deine E-Mail-Adresse, bevor du dich einloggst."
              );
            } else if (ctx.error?.message) {
              setErrorText(ctx.error.message);
            } else {
              setErrorText("Login fehlgeschlagen. Bitte versuche es erneut.");
            }
          },
        }
      );
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
    const appScheme = "tarot42";
    setIsGoogleLoading(true);
    setErrorText("");
    setInfoText("");
    try {
      console.log("Attempting Google Sign-In...");
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "http://localhost:8081/home",
      });
      console.log("Google Sign-In result:", result);
    } catch (error: any) {
      console.error("Google Sign-In failed:", error);
      if (error.message) {
        setErrorText(`Google Login fehlgeschlagen: ${error.message}`);
      } else {
        setErrorText("Google Login fehlgeschlagen. Bitte versuche es erneut.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const navigateToSignUp = () => {
    setInfoText("");
    setErrorText("");
    navigation.navigate("SignUp");
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
      {infoText ? <Text style={styles.infoText}>{infoText}</Text> : null}
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

      <View style={styles.signupButtonContainer}>
        {/* 
        <Button
          title="Noch kein Konto? Registrieren"
          onPress={navigateToSignUp}
        /> 
        */}
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
  signupButtonContainer: {
    // marginTop: 20, // Kann angepasst werden
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
  infoText: {
    color: "#004085",
    backgroundColor: "#cce5ff",
    borderColor: "#b8daff",
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    textAlign: "center",
  },
});
