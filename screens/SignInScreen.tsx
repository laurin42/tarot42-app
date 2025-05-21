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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Props-Typen korrekt definieren
// type SignInScreenNavigationProp = NativeStackScreenProps<
//   RootStackParamList,
//   "SignIn"
// >["navigation"];

// type SignInScreenRouteProp = NativeStackScreenProps<
//   RootStackParamList,
//   "SignIn"
// >["route"];

// interface SignInScreenProps {
//   navigation: SignInScreenNavigationProp;
//   route: SignInScreenRouteProp;
// }

export default function SignInScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "SignIn">>();
  const route = useRoute<RouteProp<RootStackParamList, "SignIn">>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [infoText, setInfoText] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (route.params?.registrationSuccess === "true") {
      Alert.alert(
        "Registrierung erfolgreich",
        "Du kannst dich jetzt anmelden."
      );
      navigation.setParams({ registrationSuccess: undefined });
    }
    if (route.params?.accountDeleted === "true") {
      Alert.alert("Kontolöschung erfolgreich", "Dein Konto wurde gelöscht.");
      navigation.setParams({ accountDeleted: undefined });
    }
  }, [route.params, navigation]);

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
    setIsGoogleLoading(true);
    setErrorText("");
    setInfoText("");

    try {
      console.log("Checking for Google Play Services...");
      await GoogleSignin.hasPlayServices();
      console.log("Attempting Google Sign-In with native SDK...");
      const userInfo = await GoogleSignin.signIn();
      console.log("Google Sign-In userInfo:", userInfo);

      if (userInfo.data && userInfo.data.idToken) {
        console.log("ID Token received:", userInfo.data.idToken);
        console.log("Attempting to sign in with Better Auth using ID token...");
        const result = await authClient.signIn.social({
          provider: "google",
          idToken: {
            token: userInfo.data.idToken,
          },
          callbackURL: "/dashboard", // Für In-App Navigation nach erfolgreichem Better Auth Login
        });
        console.log("Better Auth Sign-In result with ID Token:", result);
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
