import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { useAuth } from "../hooks/useAuth";

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

  const handleSignIn = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      await login(email, password);
      navigation.replace("Main");
    } catch (err: any) {
      setError(err.message ?? "Invalid email or password. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        {/* Brand */}
        <Text style={styles.brandPrimary}>Neuro</Text>
        <Text style={styles.brandSecondary}>Dyne</Text>
        <Text style={styles.subtitle}>LABS</Text>

        <Text style={styles.tagline}>Sign in to your account</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
          <Text style={styles.linkText}>
            Don't have an account?{" "}
            <Text style={styles.linkHighlight}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  brandPrimary: {
    fontFamily: fonts.black,
    fontSize: 48,
    color: colors.primary,
  },
  brandSecondary: {
    fontFamily: fonts.black,
    fontSize: 48,
    color: colors.secondary,
    marginTop: -12,
  },
  subtitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textSecondary,
    letterSpacing: 8,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  error: {
    fontFamily: fonts.regular,
    color: colors.error,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    fontFamily: fonts.regular,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    width: "100%",
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    overflow: "hidden",
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 16,
  },
  linkText: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkHighlight: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
});
