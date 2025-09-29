"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"

// Screens
import LandingScreen from "./src/screens/LandingScreen"
import RoleSelectionScreen from "./src/screens/RoleSelectionScreen"
import LoginScreen from "./src/screens/LoginScreen"
import RegisterScreen from "./src/screens/RegisterScreen"
import HouseholdDashboard from "./src/screens/household/HouseholdDashboard"
import CollectorDashboard from "./src/screens/collector/CollectorDashboard"
import MunicipalityDashboard from "./src/screens/municipality/MunicipalityDashboard"
import RecyclerDashboard from "./src/screens/recycler/RecyclerDashboard"
import AdminDashboard from "./src/screens/admin/AdminDashboard"

// Context
import { AuthProvider } from "./src/context/AuthContext"
import { DataProvider } from "./src/context/DataContext"
import { LanguageProvider } from "./src/context/LanguageContext"

// Utils
import { initializeApp } from "./src/utils/initialization"
import { LogBox } from "react-native";

// Ignore specific Expo notifications error
LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed"
]);

const Stack = createStackNavigator()

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [initialRoute, setInitialRoute] = useState("Landing")

  useEffect(() => {
    initializeApplication()
  }, [])

  const initializeApplication = async () => {
    try {
      // Initialize app data
      await initializeApp()

      // Check if user is already logged in
      const currentSession = await AsyncStorage.getItem("sessions:current")
      if (currentSession) {
        const session = JSON.parse(currentSession)
        setInitialRoute(getDashboardRoute(session.role))
      }

      setIsInitialized(true)
    } catch (error) {
      console.error("App initialization error:", error)
      setIsInitialized(true)
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
        return "Landing"
    }
  }

  if (!isInitialized) {
    return null // You could add a loading screen here
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <AuthProvider>
          <DataProvider>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor="#059212" />
              <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{
                  headerStyle: {
                    backgroundColor: "#059212",
                  },
                  headerTintColor: "#FFFFFF",
                  headerTitleStyle: {
                    fontWeight: "bold",
                  },
                }}
              >
                <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
                <Stack.Screen
                  name="RoleSelection"
                  component={RoleSelectionScreen}
                  options={{ title: "Select Your Role" }}
                />
                <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
                <Stack.Screen
                  name="HouseholdDashboard"
                  component={HouseholdDashboard}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="CollectorDashboard"
                  component={CollectorDashboard}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="MunicipalityDashboard"
                  component={MunicipalityDashboard}
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="RecyclerDashboard" component={RecyclerDashboard} options={{ headerShown: false }} />
                <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
              </Stack.Navigator>
            </NavigationContainer>
          </DataProvider>
        </AuthProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  )
}
