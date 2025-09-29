"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Animatable from "react-native-animatable"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataContext"
import { useLanguage } from "../../context/LanguageContext"

const AdminDashboard = ({ navigation }) => {
  const { user, logout } = useAuth()
  const { bins, users, collectionEvents, payoutEvents, loadData } = useData()
  const { t } = useLanguage()
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBins: 0,
    totalCollections: 0,
    totalRevenue: 0,
    activeUsers: 0,
    criticalBins: 0,
  })

  useEffect(() => {
    calculateStats()
  }, [bins, users, collectionEvents, payoutEvents])

  const calculateStats = () => {
    const totalUsers = users.length
    const totalBins = bins.length
    const totalCollections = collectionEvents.length
    const totalRevenue = payoutEvents.reduce((sum, payout) => sum + payout.totalRevenue, 0)

    // Active users (users who have collections in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const activeUserIds = new Set(
      collectionEvents.filter((event) => new Date(event.timestamp) > thirtyDaysAgo).map((event) => event.userId),
    )
    const activeUsers = activeUserIds.size

    // Critical bins (>90% full)
    const criticalBins = bins.filter((bin) => {
      const avgLevel = Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4
      return avgLevel >= 90
    }).length

    setStats({
      totalUsers,
      totalBins,
      totalCollections,
      totalRevenue,
      activeUsers,
      criticalBins,
    })
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout()
          navigation.reset({
            index: 0,
            routes: [{ name: "Landing" }],
          })
        },
      },
    ])
  }

  const getUsersByRole = () => {
    const roleCount = {}
    users.forEach((user) => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1
    })
    return roleCount
  }

  const getRecentActivity = () => {
    return collectionEvents
      .slice(-10)
      .reverse()
      .map((event) => ({
        ...event,
        user: users.find((u) => u.id === event.userId),
      }))
  }

  return (
    <LinearGradient colors={["#1a1a1a", "#2d2d2d"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>System Administrator</Text>
              <Text style={styles.userName}>{user?.name}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* System Overview */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.statsGrid}>
            <LinearGradient colors={["#059212", "#06D001"]} style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </LinearGradient>

            <LinearGradient colors={["#3B82F6", "#60A5FA"]} style={styles.statCard}>
              <Text style={styles.statValue}>{stats.activeUsers}</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </LinearGradient>

            <LinearGradient colors={["#8B5CF6", "#A78BFA"]} style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalBins}</Text>
              <Text style={styles.statLabel}>Total Bins</Text>
            </LinearGradient>

            <LinearGradient colors={["#EF4444", "#F87171"]} style={styles.statCard}>
              <Text style={styles.statValue}>{stats.criticalBins}</Text>
              <Text style={styles.statLabel}>Critical Bins</Text>
            </LinearGradient>

            <LinearGradient colors={["#F59E0B", "#FBBF24"]} style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalCollections}</Text>
              <Text style={styles.statLabel}>Total Collections</Text>
            </LinearGradient>

            <LinearGradient colors={["#F6FF99", "#FFFF80"]} style={styles.statCard}>
              <Text style={[styles.statValue, { color: "#333" }]}>₹{stats.totalRevenue.toFixed(0)}</Text>
              <Text style={[styles.statLabel, { color: "#666" }]}>Total Revenue</Text>
            </LinearGradient>
          </View>
        </Animatable.View>

        {/* User Distribution */}
        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <Text style={styles.sectionTitle}>User Distribution</Text>
          <View style={styles.userDistribution}>
            {Object.entries(getUsersByRole()).map(([role, count]) => (
              <View key={role} style={styles.roleItem}>
                <View style={styles.roleHeader}>
                  <Text style={styles.roleName}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
                  <Text style={styles.roleCount}>{count}</Text>
                </View>
                <View style={styles.roleBar}>
                  <View
                    style={[
                      styles.roleProgress,
                      {
                        width: `${(count / stats.totalUsers) * 100}%`,
                        backgroundColor: getRoleColor(role),
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Animatable.View>

        {/* Recent Activity */}
        <Animatable.View animation="fadeInUp" duration={800} delay={600}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {getRecentActivity().map((activity, index) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityIconText}>🗑️</Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Collection by {activity.user?.name || "Unknown User"}</Text>
                  <Text style={styles.activitySubtitle}>
                    Bin: {activity.binId} • {activity.location.street}
                  </Text>
                  <Text style={styles.activityTime}>{new Date(activity.timestamp).toLocaleString()}</Text>
                </View>
                <View style={styles.activityWeight}>
                  <Text style={styles.weightText}>
                    {Object.values(activity.wasteCollected)
                      .reduce((sum, sensor) => sum + sensor.weightKg, 0)
                      .toFixed(1)}{" "}
                    kg
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animatable.View>

        {/* System Health */}
        <Animatable.View animation="fadeInUp" duration={800} delay={800}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <LinearGradient colors={["#333", "#444"]} style={styles.healthCard}>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Bin Network Status</Text>
              <Text style={[styles.healthValue, { color: "#059212" }]}>Operational</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Data Sync Status</Text>
              <Text style={[styles.healthValue, { color: "#059212" }]}>Synchronized</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Revenue Processing</Text>
              <Text style={[styles.healthValue, { color: "#059212" }]}>Active</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Critical Alerts</Text>
              <Text style={[styles.healthValue, { color: stats.criticalBins > 0 ? "#EF4444" : "#059212" }]}>
                {stats.criticalBins > 0 ? `${stats.criticalBins} Bins Need Attention` : "None"}
              </Text>
            </View>
          </LinearGradient>
        </Animatable.View>
      </ScrollView>
    </LinearGradient>
  )
}

const getRoleColor = (role) => {
  switch (role) {
    case "household":
      return "#059212"
    case "collector":
      return "#3B82F6"
    case "municipality":
      return "#8B5CF6"
    case "recycler":
      return "#F59E0B"
    case "admin":
      return "#EF4444"
    default:
      return "#6B7280"
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#999",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  logoutButton: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: "#FF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    marginTop: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "30%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
    textAlign: "center",
  },
  userDistribution: {
    backgroundColor: "#333",
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  roleItem: {
    gap: 8,
  },
  roleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  roleCount: {
    fontSize: 14,
    color: "#999",
  },
  roleBar: {
    height: 6,
    backgroundColor: "#555",
    borderRadius: 3,
    overflow: "hidden",
  },
  roleProgress: {
    height: "100%",
    borderRadius: 3,
  },
  activityContainer: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#059212",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  activitySubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  activityWeight: {
    alignItems: "flex-end",
  },
  weightText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#9BEC00",
  },
  healthCard: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  healthItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#555",
  },
  healthLabel: {
    fontSize: 14,
    color: "#999",
  },
  healthValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
})

export default AdminDashboard
