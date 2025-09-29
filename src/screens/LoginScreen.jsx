"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Animatable from "react-native-animatable"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"

const LoginScreen = ({ navigation, route }) => {
  const { login, authenticateWithBiometrics } = useAuth()
  const { t } = useLanguage()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const role = route.params?.role || "household"

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      // Alert.alert("Error", "Please enter both username and password")
      return
    }

    setIsLoading(true)
    try {
      const result = await login({ username, password, role })

      if (result.success) {
        // Navigate to appropriate dashboard
        const dashboardRoute = getDashboardRoute(role)
        navigation.reset({
          index: 0,
          routes: [{ name: dashboardRoute }],
        })
      } else {
        Alert.alert("Login Failed", result.error)
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    const success = await authenticateWithBiometrics()
    if (success) {
      // For demo purposes, use default credentials
      setUsername(getDefaultUsername(role))
      setPassword("password123")
      setTimeout(() => handleLogin(), 500)
    }
  }

  const getDashboardRoute = (role) => {
    switch (role) {
      case "household":
        return "HouseholdDashboard"
      case "collector":
        return "CollectorDashboard"
      case "municipality":
        return "MunicipalityDashboard"
      case "recycler":
        return "RecyclerDashboard"
      case "admin":
        return "AdminDashboard"
      default:
        return "HouseholdDashboard"
    }
  }

  const getDefaultUsername = (role) => {
    switch (role) {
      case "household":
        return "john_doe"
      case "collector":
        return "collector_raj"
      case "municipality":
        return "chennai_admin"
      case "recycler":
        return "green_recycling"
      case "admin":
        return "admin"
      default:
        return "john_doe"
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "household":
        return "🏠"
      case "collector":
        return "🚛"
      case "municipality":
        return "🏛️"
      case "recycler":
        return "♻️"
      case "admin":
        return "⚙️"
      default:
        return "🏠"
    }
  }

  return (
    <LinearGradient colors={["#ffffffff", "#e5fdeeff"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <Text style={styles.roleIcon}>{getRoleIcon(role)}</Text>
          <Text style={styles.title}>
            {t(role)} {t("login")}
          </Text>
          <Text style={styles.subtitle}>Enter your credentials to access your dashboard</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={800} delay={300} style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#666"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LinearGradient colors={["#059212", "#06D001"]} style={styles.buttonGradient}>
              <Text style={styles.loginButtonText}>{isLoading ? "Logging in..." : t("login")}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
            <Text style={styles.biometricButtonText}>🔒 Use Biometric Authentication</Text>
          </TouchableOpacity>

        

          <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("Register", { role })}>
            <Text style={styles.registerButtonText}>Don't have an account? {t("register")}</Text>
          </TouchableOpacity>
        </Animatable.View>

        
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#282727ff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#05680bff",
  },
  input: {
    backgroundColor: "#fffbfbff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#636463ff",
    borderWidth: 1,
    borderColor: "#444",
  },
  loginButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  biometricButton: {
    backgroundColor: "#c4f9ccff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#444",
  },
  biometricButtonText: {
    fontSize: 16,
    color: "#343232ff",
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#444",
  },
  dividerText: {
    color: "#666",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  registerButton: {
    alignItems: "center",
    padding: 16,
  },
  registerButtonText: {
    fontSize: 16,
    color: "#059212",
    fontWeight: "500",
  },
  demoCredentials: {
    marginTop: 40,
    padding: 16,
    backgroundColor: "rgba(5, 146, 18, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(5, 146, 18, 0.3)",
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059212",
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
})

export default LoginScreen
