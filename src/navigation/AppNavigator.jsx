"use client"

import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { useAuth } from "../context/AuthContext"

// Import screens
import LandingScreen from "../screens/LandingScreen"
import LoginScreen from "../screens/LoginScreen"
import RegisterScreen from "../screens/RegisterScreen"
import RoleSelectionScreen from "../screens/RoleSelectionScreen"
import HouseholdDashboard from "../screens/household/HouseholdDashboard"
import CollectorDashboard from "../screens/collector/CollectorDashboard"
import MunicipalityDashboard from "../screens/municipality/MunicipalityDashboard"
import RecyclerDashboard from "../screens/recycler/RecyclerDashboard"
import AdminDashboard from "../screens/admin/AdminDashboard"

const Stack = createStackNavigator()

const AppNavigator = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null // You can add a loading screen here
  }

  const getDashboardComponent = (role) => {
    switch (role) {
      case "household":
        return HouseholdDashboard
      case "collector":
        return CollectorDashboard
      case "municipality":
        return MunicipalityDashboard
      case "recycler":
        return RecyclerDashboard
      case "admin":
        return AdminDashboard
      default:
        return HouseholdDashboard
    }
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#1a1a1a" },
        }}
      >
        {!user ? (
          // Auth screens
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          </>
        ) : (
          // Dashboard screens
          <>
            <Stack.Screen name="Dashboard" component={getDashboardComponent(user.role)} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
