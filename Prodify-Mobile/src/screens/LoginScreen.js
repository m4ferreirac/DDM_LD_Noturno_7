import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";

const LoginScreen = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localErrors, setLocalErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef(null);

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email inválido";
    }

    if (!password) {
      errors.password = "Password é obrigatória";
    } else if (password.length < 6) {
      errors.password = "Password deve ter pelo menos 6 caracteres";
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    Keyboard.dismiss();
    clearError();
    setLocalErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert(
        "Erro de Autenticação",
        err.message ||
          "Não foi possível iniciar sessão. Verifique as suas credenciais.",
        [{ text: "OK" }],
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLoading = isLoading || isSubmitting;

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>📋</Text>
            </View>
            <Text style={styles.appName}>Prodify</Text>
            <Text style={styles.tagline}>Gestão de Tarefas Kanban</Text>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Email */}
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, localErrors.email && styles.inputError]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (localErrors.email) {
                    setLocalErrors((prev) => ({ ...prev, email: null }));
                  }
                }}
                placeholder="exemplo@email.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!showLoading}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
              {localErrors.email && (
                <Text style={styles.errorText}>{localErrors.email}</Text>
              )}

              {/* Password */}
              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordRef}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    localErrors.password && styles.inputError,
                  ]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (localErrors.password) {
                      setLocalErrors((prev) => ({ ...prev, password: null }));
                    }
                  }}
                  placeholder="Introduza a sua password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!showLoading}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>
              {localErrors.password && (
                <Text style={styles.errorText}>{localErrors.password}</Text>
              )}

              {/* Error from Auth */}
              {error && (
                <View style={styles.authErrorContainer}>
                  <Text style={styles.authErrorText}>⚠️ {error}</Text>
                </View>
              )}

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  showLoading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={showLoading}
                activeOpacity={0.8}
              >
                {showLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Entrar</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Versão 1.0.0</Text>
              <Text style={styles.footerText}>© 2025 Prodify - DDM ISTEC</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#3498db",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 32,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#dcdcdc",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    fontSize: 12,
    color: "#e74c3c",
    marginTop: 4,
  },
  authErrorContainer: {
    backgroundColor: "#fde8e8",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  authErrorText: {
    fontSize: 14,
    color: "#e74c3c",
  },
  loginButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    minHeight: 52,
  },
  loginButtonDisabled: {
    backgroundColor: "#a9cce3",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    color: "#95a5a6",
    marginBottom: 2,
  },
});

export default LoginScreen;
