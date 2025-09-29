"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Animatable from "react-native-animatable"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"

const RegisterScreen = ({ navigation, route }) => {
  const { register } = useAuth()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const role = route.params?.role || "household"

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const { username, password, confirmPassword, name, email, phone } = formData

    if (!username.trim() || !password.trim() || !name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert("Error", "Please fill in all required fields")
      return false
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return false
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address")
      return false
    }

    return true
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const { confirmPassword, ...userData } = formData
      const result = await register({ ...userData, role })

      if (result.success) {
        Alert.alert("Registration Successful", "Your account has been created successfully. You can now login.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login", { role }),
          },
        ])
      } else {
        Alert.alert("Registration Failed", result.error)
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred")
    } finally {
      setIsLoading(false)
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
    <LinearGradient colors={["#ffffffff", "#f2fbf2ff"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
            <Text style={styles.roleIcon}>{getRoleIcon(role)}</Text>
            <Text style={styles.title}>Create {t(role)} Account</Text>
            <Text style={styles.subtitle}>Fill in your details to get started</Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={800} delay={300} style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username *</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(value) => handleInputChange("username", value)}
                placeholder="Enter username"
                placeholderTextColor="#666"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                placeholder="Enter your full name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                placeholder="Enter email address"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                placeholder="Enter phone number"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />
            </View>

            {role === "household" && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.address}
                    onChangeText={(value) => handleInputChange("address", value)}
                    placeholder="Enter your address"
                    placeholderTextColor="#666"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.city}
                    onChangeText={(value) => handleInputChange("city", value)}
                    placeholder="Enter your city"
                    placeholderTextColor="#666"
                  />
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password *</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                placeholder="Enter password"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange("confirmPassword", value)}
                placeholder="Confirm password"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient colors={["#059212", "#06D001"]} style={styles.buttonGradient}>
                <Text style={styles.registerButtonText}>{isLoading ? "Creating Account..." : t("register")}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login", { role })}>
              <Text style={styles.loginButtonText}>Already have an account? {t("login")}</Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d2c2cff",
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
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#05791aff",
  },
  input: {
    backgroundColor: "#ffffffff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#373535ff",
    borderWidth: 1,
    borderColor: "#444",
  },
  registerButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loginButton: {
    alignItems: "center",
    padding: 16,
  },
  loginButtonText: {
    fontSize: 16,
    color: "#059212",
    fontWeight: "500",
  },
})

export default RegisterScreen
