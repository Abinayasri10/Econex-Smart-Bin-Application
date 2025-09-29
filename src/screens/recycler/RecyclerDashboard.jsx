
"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Animatable from "react-native-animatable"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataContext"
import { useLanguage } from "../../context/LanguageContext"

const RecyclerDashboard = ({ navigation }) => {
  const { user, logout } = useAuth()
  const { collectionEvents, recyclerPartners, loadData, submitRecyclerBid } = useData()
  const { t } = useLanguage()
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showBidModal, setShowBidModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [bidAmount, setBidAmount] = useState("")
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    weeklyPurchases: 0,
    monthlySpent: 0,
    averageBidPrice: 0,
    successfulBids: 0,
    totalWasteProcessed: 0,
    wasteProcessed: {
      organic: 0,
      plastic: 0,
      hazardous: 0,
      others: 0,
    },
    wastePercentages: {
      organic: 0,
      plastic: 0,
      hazardous: 0,
      others: 0,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await loadData()
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!loading) {
      loadRecyclerData()
    }
  }, [collectionEvents, recyclerPartners, user, loading])

  const loadRecyclerData = () => {
    if (!user?.userId || !collectionEvents || !recyclerPartners) {
      setStats({
        totalPurchases: 0,
        totalSpent: 0,
        weeklyPurchases: 0,
        monthlySpent: 0,
        averageBidPrice: 0,
        successfulBids: 0,
        totalWasteProcessed: 0,
        wasteProcessed: {
          organic: 0,
          plastic: 0,
          hazardous: 0,
          others: 0,
        },
        wastePercentages: {
          organic: 0,
          plastic: 0,
          hazardous: 0,
          others: 0,
        },
      })
      return
    }

    // Find recycler partner record
    const recyclerPartner = recyclerPartners.find((partner) => partner.userId === user.userId)
    if (!recyclerPartner) {
      setStats({
        totalPurchases: 0,
        totalSpent: 0,
        weeklyPurchases: 0,
        monthlySpent: 0,
        averageBidPrice: 0,
        successfulBids: 0,
        totalWasteProcessed: 0,
        wasteProcessed: {
          organic: 0,
          plastic: 0,
          hazardous: 0,
          others: 0,
        },
        wastePercentages: {
          organic: 0,
          plastic: 0,
          hazardous: 0,
          others: 0,
        },
      })
      return
    }

    // Calculate purchases and spending
    const recyclerEvents = collectionEvents.filter((event) => event.recyclerId === user.userId)
    const totalPurchases = recyclerEvents.length
    const totalSpent = recyclerEvents.reduce((sum, event) => sum + (event.recyclerBid || 0), 0)

    // Weekly purchases
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weeklyPurchases = recyclerEvents.filter((event) => new Date(event.timestamp) >= weekStart).length

    // Monthly spending
    const monthStart = new Date()
    monthStart.setDate(1)
    const monthlySpent = recyclerEvents
      .filter((event) => new Date(event.timestamp) >= monthStart)
      .reduce((sum, event) => sum + (event.recyclerBid || 0), 0)

    // Average bid price
    const averageBidPrice = totalPurchases > 0 ? totalSpent / totalPurchases : 0

    // Successful bids (assuming all events with recyclerId are successful)
    const successfulBids = totalPurchases

    // Waste processed breakdown
    const wasteProcessed = recyclerEvents.reduce(
      (acc, event) => ({
        organic: acc.organic + (event.organicWeight || 0),
        plastic: acc.plastic + (event.plasticWeight || 0),
        hazardous: acc.hazardous + (event.hazardousWeight || 0),
        others: acc.others + (event.othersWeight || 0),
      }),
      { organic: 0, plastic: 0, hazardous: 0, others: 0 },
    )

    // Total waste processed
    const totalWasteProcessed =
      wasteProcessed.organic + wasteProcessed.plastic + wasteProcessed.hazardous + wasteProcessed.others

    // Waste percentages
    const wastePercentages = {
      organic: totalWasteProcessed > 0 ? (wasteProcessed.organic / totalWasteProcessed) * 100 : 0,
      plastic: totalWasteProcessed > 0 ? (wasteProcessed.plastic / totalWasteProcessed) * 100 : 0,
      hazardous: totalWasteProcessed > 0 ? (wasteProcessed.hazardous / totalWasteProcessed) * 100 : 0,
      others: totalWasteProcessed > 0 ? (wasteProcessed.others / totalWasteProcessed) * 100 : 0,
    }

    setStats({
      totalPurchases,
      totalSpent,
      weeklyPurchases,
      monthlySpent,
      averageBidPrice,
      successfulBids,
      totalWasteProcessed,
      wasteProcessed,
      wastePercentages,
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

  const handleBidSubmit = async () => {
    if (!bidAmount || !selectedEvent) {
      Alert.alert("Error", "Please enter a valid bid amount")
      return
    }

    const bid = Number.parseFloat(bidAmount)
    if (isNaN(bid) || bid <= 0) {
      Alert.alert("Error", "Bid amount must be a valid number greater than 0")
      return
    }

    try {
      await submitRecyclerBid(selectedEvent.id, user.userId, bid)
      Alert.alert("Success", "Your bid has been submitted successfully!")
      setShowBidModal(false)
      setBidAmount("")
      setSelectedEvent(null)
      await loadData() // Refresh data after bid submission
    } catch (error) {
      Alert.alert("Error", "Failed to submit bid. Please try again.")
    }
  }

  const getAvailableEvents = () => {
    // Events that haven't been assigned to a recycler yet
    return collectionEvents.filter((event) => !event.recyclerId && event.status === "collected")
  }

  const getMyPurchases = () => {
    // Events purchased by this recycler
    return collectionEvents.filter((event) => event.recyclerId === user.userId)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Recycler Dashboard</Text>
              <Text style={styles.userName}>{user?.name}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Stats Overview */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : (
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <View style={styles.statsGrid}>
              <LinearGradient colors={["#2196F3", "#64B5F6"]} style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalPurchases}</Text>
                <Text style={styles.statLabel}>Total Purchases</Text>
              </LinearGradient>

              <LinearGradient colors={["#4CAF50", "#81C784"]} style={styles.statCard}>
                <Text style={styles.statValue}>₹{stats.totalSpent.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </LinearGradient>

              <LinearGradient colors={["#FF9800", "#FFB74D"]} style={styles.statCard}>
                <Text style={styles.statValue}>{stats.weeklyPurchases}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </LinearGradient>

              <LinearGradient colors={["#9C27B0", "#BA68C8"]} style={styles.statCard}>
                <Text style={styles.statValue}>₹{stats.averageBidPrice.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Avg. Bid Price</Text>
              </LinearGradient>

              <LinearGradient colors={["#F44336", "#EF5350"]} style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalWasteProcessed.toFixed(1)}kg</Text>
                <Text style={styles.statLabel}>Total Waste Processed</Text>
              </LinearGradient>
            </View>
          </Animatable.View>
        )}

        {/* Waste Processed */}
        {loading ? null : (
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <View style={styles.wasteCard}>
              <Text style={styles.sectionTitle}>Waste Processed</Text>
              <View style={styles.wasteGrid}>
                <View style={[styles.wasteItem, { backgroundColor: "#4CAF50" }]}>
                  <Text style={styles.wasteIcon}>🥬</Text>
                  <Text style={styles.wasteWeight}>{stats.wasteProcessed.organic.toFixed(1)}kg</Text>
                  <Text style={styles.wastePercentage}>
                    {stats.wastePercentages.organic.toFixed(1)}%
                  </Text>
                  <Text style={styles.wasteLabel}>Organic</Text>
                </View>
                <View style={[styles.wasteItem, { backgroundColor: "#2196F3" }]}>
                  <Text style={styles.wasteIcon}>♻️</Text>
                  <Text style={styles.wasteWeight}>{stats.wasteProcessed.plastic.toFixed(1)}kg</Text>
                  <Text style={styles.wastePercentage}>
                    {stats.wastePercentages.plastic.toFixed(1)}%
                  </Text>
                  <Text style={styles.wasteLabel}>Plastic</Text>
                </View>
                <View style={[styles.wasteItem, { backgroundColor: "#FF5722" }]}>
                  <Text style={styles.wasteIcon}>⚠️</Text>
                  <Text style={styles.wasteWeight}>{stats.wasteProcessed.hazardous.toFixed(1)}kg</Text>
                  <Text style={styles.wastePercentage}>
                    {stats.wastePercentages.hazardous.toFixed(1)}%
                  </Text>
                  <Text style={styles.wasteLabel}>Hazardous</Text>
                </View>
                <View style={[styles.wasteItem, { backgroundColor: "#9E9E9E" }]}>
                  <Text style={styles.wasteIcon}>🗑️</Text>
                  <Text style={styles.wasteWeight}>{stats.wasteProcessed.others.toFixed(1)}kg</Text>
                  <Text style={styles.wastePercentage}>
                    {stats.wastePercentages.others.toFixed(1)}%
                  </Text>
                  <Text style={styles.wasteLabel}>Others</Text>
                </View>
              </View>
            </View>
          </Animatable.View>
        )}

        {/* Available Waste for Bidding */}
        {loading ? null : (
          <Animatable.View animation="fadeInUp" duration={800} delay={600}>
            <Text style={styles.sectionTitle}>Available Waste for Bidding</Text>
            {getAvailableEvents().length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No waste available for bidding</Text>
                <Text style={styles.emptySubtext}>Check back later for new collections</Text>
              </View>
            ) : (
              <View style={styles.eventsContainer}>
                {getAvailableEvents()
                  .slice(0, 5)
                  .map((event, index) => (
                    <Animatable.View key={event.id} animation="fadeInUp" duration={600} delay={index * 100}>
                      <View style={styles.eventCard}>
                        <View style={styles.eventHeader}>
                          <Text style={styles.eventBin}>Location: {event.location?.street || "Unknown"}</Text>
                          <Text style={styles.eventDate}>{new Date(event.timestamp).toLocaleDateString()}</Text>
                        </View>

                        <View style={styles.eventWeights}>
                          <View style={styles.weightItem}>
                            <Text style={styles.weightLabel}>Organic</Text>
                            <Text style={styles.weightValue}>{(event.organicWeight || 0).toFixed(1)}kg</Text>
                          </View>
                          <View style={styles.weightItem}>
                            <Text style={styles.weightLabel}>Plastic</Text>
                            <Text style={styles.weightValue}>{(event.plasticWeight || 0).toFixed(1)}kg</Text>
                          </View>
                          <View style={styles.weightItem}>
                            <Text style={styles.weightLabel}>Hazardous</Text>
                            <Text style={styles.weightValue}>{(event.hazardousWeight || 0).toFixed(1)}kg</Text>
                          </View>
                          <View style={styles.weightItem}>
                            <Text style={styles.weightLabel}>Others</Text>
                            <Text style={styles.weightValue}>{(event.othersWeight || 0).toFixed(1)}kg</Text>
                          </View>
                        </View>

                        <View style={styles.eventFooter}>
                          <Text style={styles.totalWeight}>
                            Total:{" "}
                            {(
                              (event.organicWeight || 0) +
                              (event.plasticWeight || 0) +
                              (event.hazardousWeight || 0) +
                              (event.othersWeight || 0)
                            ).toFixed(1)}
                            kg
                          </Text>
                          <TouchableOpacity
                            style={styles.bidButton}
                            onPress={() => {
                              setSelectedEvent(event)
                              setShowBidModal(true)
                            }}
                          >
                            <Text style={styles.bidButtonText}>Place Bid</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Animatable.View>
                  ))}
              </View>
            )}
          </Animatable.View>
        )}

        {/* My Recent Purchases */}
        {loading ? null : (
          <Animatable.View animation="fadeInUp" duration={800} delay={800}>
            <Text style={styles.sectionTitle}>Recent Purchases</Text>
            <View style={styles.purchasesContainer}>
              {getMyPurchases()
                .slice(-3)
                .reverse()
                .map((purchase, index) => (
                  <View key={purchase.id} style={styles.purchaseCard}>
                    <View style={styles.purchaseHeader}>
                      <Text style={styles.purchaseBin}>Bin: {purchase.binId}</Text>
                      <Text style={styles.purchaseAmount}>₹{(purchase.recyclerBid || 0).toFixed(2)}</Text>
                    </View>
                    <Text style={styles.purchaseDate}>{new Date(purchase.timestamp).toLocaleDateString()}</Text>
                    <Text style={styles.purchaseWeight}>
                      Total Weight:{" "}
                      {(
                        (purchase.organicWeight || 0) +
                        (purchase.plasticWeight || 0) +
                        (purchase.hazardousWeight || 0) +
                        (purchase.othersWeight || 0)
                      ).toFixed(1)}
                      kg
                    </Text>
                  </View>
                ))}
            </View>
          </Animatable.View>
        )}
      </ScrollView>

      {/* Bid Modal */}
      <Modal visible={showBidModal} animationType="slide" transparent onRequestClose={() => setShowBidModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Place Your Bid</Text>
            {selectedEvent && (
              <View style={styles.modalEventInfo}>
                <Text style={styles.modalEventText}>Location: {selectedEvent.location?.street || "Unknown"}</Text>
                <Text style={styles.modalEventText}>
                  Total Weight:{" "}
                  {(
                    (selectedEvent.organicWeight || 0) +
                    (selectedEvent.plasticWeight || 0) +
                    (selectedEvent.hazardousWeight || 0) +
                    (selectedEvent.othersWeight || 0)
                  ).toFixed(1)}
                  kg
                </Text>
              </View>
            )}

            <View style={styles.bidInputContainer}>
              <Text style={styles.bidInputLabel}>Bid Amount (₹)</Text>
              <TextInput
                style={styles.bidInput}
                value={bidAmount}
                onChangeText={setBidAmount}
                placeholder="Enter your bid amount"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowBidModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleBidSubmit}>
                <Text style={styles.submitButtonText}>Submit Bid</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    color: "#666666",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  logoutButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  logoutText: {
    color: "#FF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
    marginTop: 20,
  },
  wasteCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  wasteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  wasteItem: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  wasteIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  wasteWeight: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  wastePercentage: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginBottom: 4,
  },
  wasteLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  emptyText: {
    fontSize: 18,
    color: "#666666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999999",
  },
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  eventBin: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  eventDate: {
    fontSize: 12,
    color: "#666666",
  },
  eventWeights: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  weightItem: {
    alignItems: "center",
  },
  weightLabel: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 2,
  },
  weightValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333333",
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalWeight: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  bidButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bidButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  purchasesContainer: {
    gap: 12,
  },
  purchaseCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  purchaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  purchaseBin: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  purchaseAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  purchaseDate: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  purchaseWeight: {
    fontSize: 12,
    color: "#333333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
    textAlign: "center",
  },
  modalEventInfo: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalEventText: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 4,
  },
  bidInputContainer: {
    marginBottom: 24,
  },
  bidInputLabel: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 8,
    fontWeight: "500",
  },
  bidInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "500",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 10,
  },
})

export default RecyclerDashboard
