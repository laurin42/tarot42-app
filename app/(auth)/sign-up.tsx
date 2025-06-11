import { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import { authClient } from "../../lib/auth-client";
import { useRouter, Href, Link } from "expo-router";
import { styles } from "../../styles/signUpScreen";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Fehler", "Bitte fülle alle Felder aus.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        console.error("Sign up failed:", error);
        Alert.alert(
          "Registrierung fehlgeschlagen",
          error.message || "Bitte versuche es erneut."
        );
      } else if (data) {
        console.log("Sign up successful, data:", data);
        router.replace({
          pathname: "/(auth)/sign-in",
          params: { registrationSuccess: "true" },
        });
      }
    } catch (err: any) {
      console.error("An unexpected error occurred during sign up:", err);
      Alert.alert(
        "Registrierung fehlgeschlagen",
        err.message ||
          "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignIn = () => {
    router.push("/(auth)/sign-in" as Href);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCapitalize="words"
        editable={!isLoading}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!isLoading}
      />
      <TextInput
        placeholder="Password (mind. 8 Zeichen)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        editable={!isLoading}
      />
      <Button
        title="Registrieren"
        onPress={handleSignUp}
        disabled={isLoading}
      />

      <Link href="/(auth)/sign-in" asChild>
        <TouchableOpacity
          style={styles.signInLinkContainer}
          disabled={isLoading}
        >
          <Text style={styles.signInLinkText}>
            Bereits ein Konto?{" "}
            <Text style={styles.signInLinkTextBold}>Einloggen</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
