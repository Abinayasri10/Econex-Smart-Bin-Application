"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as LocalAuthentication from "expo-local-authentication"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const currentSession = await AsyncStorage.getItem("sessions:current")
      if (currentSession) {
        const session = JSON.parse(currentSession)
        setUser(session)
      }
    } catch (error) {
      console.error("Auth state check error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const { username, password, role } = credentials

      // Get user data based on role
      const userKey = role === "household" ? `users:${username}` : `${role}s:${username}`
      const userData = await AsyncStorage.getItem(userKey)

      if (!userData) {
        throw new Error("User not found")
      }

      const user = JSON.parse(userData)

      // Verify password (in real app, use proper hashing)
      if (user.password !== password) {
        throw new Error("Invalid credentials")
      }

      // Create session
      const session = {
        userId: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        loginTime: new Date().toISOString(),
      }

      await AsyncStorage.setItem("sessions:current", JSON.stringify(session))
      setUser(session)

      return { success: true, user: session }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const { username, password, role, ...otherData } = userData

      // Check if user already exists
      const userKey = role === "household" ? `users:${username}` : `${role}s:${username}`
      const existingUser = await AsyncStorage.getItem(userKey)

      if (existingUser) {
        throw new Error("User already exists")
      }

      // Create user
      const newUser = {
        id: `${role}_${Date.now()}`,
        username,
        password, // In real app, hash this
        role,
        ...otherData,
        createdAt: new Date().toISOString(),
      }

      await AsyncStorage.setItem(userKey, JSON.stringify(newUser))

      // If household user, create bin
      if (role === "household") {
        await createBinForUser(newUser)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const createBinForUser = async (user) => {
    const binId = `BIN-${Date.now()}`
    const bin = {
      binId,
      userBinOwner: user.id,
      location: {
        latitude: 13.0827 + (Math.random() - 0.5) * 0.1,
        longitude: 80.2707 + (Math.random() - 0.5) * 0.1,
        street: user.address || "Unknown Street",
        city: user.city || "Chennai",
      },
      binCapacityKg: 30,
      sensors: {
        organic: { levelPct: 0, weightKg: 0 },
        plastic: { levelPct: 0, weightKg: 0 },
        hazardous: { levelPct: 0, weightKg: 0 },
        others: { levelPct: 0, weightKg: 0 },
      },
      power: {
        lastReadWattHour: 0,
        batteryPct: 100,
      },
      lastUpdated: new Date().toISOString(),
      isSegregationError: false,
    }

    await AsyncStorage.setItem(`bin:${binId}`, JSON.stringify(bin))

    // Update user with bin reference
    user.binId = binId
    const userKey = `users:${user.username}`
    await AsyncStorage.setItem(userKey, JSON.stringify(user))
  }

  const authenticateWithBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      if (!hasHardware) {
        throw new Error("Biometric hardware not available")
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync()
      if (!isEnrolled) {
        throw new Error("No biometric data enrolled")
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access EcoNex",
        cancelLabel: "Cancel",
        fallbackLabel: "Use Password",
      })

      return result.success
    } catch (error) {
      console.error("Biometric authentication error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("sessions:current")
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    authenticateWithBiometrics,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
