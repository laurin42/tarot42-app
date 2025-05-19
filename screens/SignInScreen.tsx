import { useState } from "react";
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

type SignInScreenProps = NativeStackScreenProps<RootStackParamList, "SignIn">;

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await authClient.signIn.email({
        email,
        password,
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const navigateToSignUp = () => {
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
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />

      <View style={styles.signupButtonContainer}>
        <Button
          title="Noch kein Konto? Registrieren"
          onPress={navigateToSignUp}
        />
      </View>

      <TouchableOpacity
        onPress={navigateToSignUp}
        style={styles.signupLinkContainer}
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
  signupButtonContainer: {
    marginTop: 20,
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
});
