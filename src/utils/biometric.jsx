import * as LocalAuthentication from "expo-local-authentication"
import { Alert } from "react-native"

export const checkBiometricSupport = async () => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const isEnrolled = await LocalAuthentication.isEnrolledAsync()
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync()

    return {
      hasHardware,
      isEnrolled,
      supportedTypes,
      isSupported: hasHardware && isEnrolled,
    }
  } catch (error) {
    console.error("Error checking biometric support:", error)
    return {
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
      isSupported: false,
    }
  }
}

export const authenticateWithBiometric = async (reason = "Authenticate to access EcoNex") => {
  try {
    const biometricSupport = await checkBiometricSupport()

    if (!biometricSupport.isSupported) {
      Alert.alert(
        "Biometric Authentication Unavailable",
        "Your device does not support biometric authentication or no biometric data is enrolled.",
      )
      return { success: false, error: "Biometric not supported" }
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: "Cancel",
      fallbackLabel: "Use Password",
      disableDeviceFallback: false,
    })

    if (result.success) {
      return { success: true }
    } else {
      return {
        success: false,
        error: result.error || "Authentication failed",
      }
    }
  } catch (error) {
    console.error("Biometric authentication error:", error)
    return {
      success: false,
      error: error.message || "Authentication error",
    }
  }
}

export const getBiometricType = async () => {
  try {
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync()

    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return "Face ID"
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Fingerprint"
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris"
    } else {
      return "Biometric"
    }
  } catch (error) {
    console.error("Error getting biometric type:", error)
    return "Biometric"
  }
}
