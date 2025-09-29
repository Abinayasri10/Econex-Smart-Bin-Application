"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import CustomDropdown from "../../components/CustomDropdown"
import * as Animatable from "react-native-animatable"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataContext"
import { useLanguage } from "../../context/LanguageContext"

const MunicipalityDashboard = ({ navigation }) => {
  const { user, logout } = useAuth()
  const {
    bins,
    collectionEvents,
    payoutEvents,
    recyclerPartners,
    collectors,
    segregationComplaints,
    loadData,
    processWeeklyRevenue,
    blockUserRevenue,
    assignCollectorToStreet,
    updateRecyclerPartnership,
    processSegregationComplaint,
  } = useData()
  const { t } = useLanguage()
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedStreet, setSelectedStreet] = useState("Street 1")
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCollector, setSelectedCollector] = useState("")
  const [partnershipRequests, setPartnershipRequests] = useState([])
  const [streetOptions, setStreetOptions] = useState([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [stats, setStats] = useState({
    totalBins: 0,
    criticalBins: 0,
    todayCollections: 0,
    totalRevenue: 0,
    municipalityShare: 0,
    weeklyRevenue: 0,
    pendingComplaints: 0,
    activePartners: 0,
    totalWasteCollected: 0,
    recyclingRate: 0,
    carbonFootprintReduced: 0,
    pendingPartnershipRequests: 0,
  })

  const availableCollectors = collectors?.filter((collector) => !collector.assignedStreet) || []

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
      calculateStats()
      loadPartnershipRequests()
      generateStreetOptions()
    }
  }, [bins, collectionEvents, payoutEvents, segregationComplaints, recyclerPartners, collectors, loading])

  const generateStreetOptions = () => {
    const streets = Array.from({ length: 10 }, (_, i) => `Street ${i + 1}`)
    const options = streets.map(street => {
      const assigned = collectors.filter(c => c.assignedStreet === street)
      const assignedNames = assigned.length > 0 
        ? assigned.map(c => c.name).join(', ') 
        : 'Unassigned'
      return `${street} - ${assignedNames}`
    })
    setStreetOptions(options)
  }

  const calculateStats = () => {
    const totalBins = bins?.length || 0
    const streetBins = bins?.filter((bin) => bin.location.street === selectedStreet) || []

    const criticalBins = streetBins.filter((bin) => {
      const avgLevel = Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4
      return avgLevel >= 90
    }).length

    const today = new Date().toDateString()
    const todayCollections = collectionEvents?.filter(
      (event) => new Date(event.timestamp).toDateString() === today,
    ).length || 0

    const totalRevenue = payoutEvents?.reduce((sum, payout) => sum + (payout.totalRevenue || 0), 0) || 0
    const municipalityShare = payoutEvents?.reduce((sum, payout) => sum + (payout.municipalityShare || 0), 0) || 0

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weeklyRevenue = payoutEvents
      ?.filter((payout) => new Date(payout.timestamp) >= weekStart)
      .reduce((sum, payout) => sum + (payout.totalRevenue || 0), 0) || 0

    const pendingComplaints = segregationComplaints?.filter((complaint) => complaint.status === "pending").length || 0
    const activePartners = recyclerPartners?.filter((partner) => partner.status === "active").length || 0

    const totalWasteCollected = collectionEvents?.reduce((sum, event) => {
      return sum + (event.totalWeight || 0)
    }, 0) || 0

    const recyclingRate =
      totalWasteCollected > 0
        ? (collectionEvents?.reduce((sum, event) => sum + (event.plasticWeight || 0), 0) / totalWasteCollected) * 100
        : 0

    const carbonFootprintReduced = collectionEvents?.reduce((sum, event) => {
      return (
        sum +
        ((event.organicWeight || 0) * 0.5) +
        ((event.plasticWeight || 0) * 2.0) +
        ((event.hazardousWeight || 0) * 1.5) +
        ((event.othersWeight || 0) * 0.3)
      )
    }, 0) || 0

    const pendingPartnershipRequests = recyclerPartners?.filter((partner) => partner.status === "pending").length || 0

    setStats({
      totalBins,
      criticalBins,
      todayCollections,
      totalRevenue,
      municipalityShare,
      weeklyRevenue,
      pendingComplaints,
      activePartners,
      totalWasteCollected,
      recyclingRate,
      carbonFootprintReduced,
      pendingPartnershipRequests,
    })
  }

  const loadPartnershipRequests = () => {
    const requests = recyclerPartners?.filter((partner) => partner.status === "pending") || []
    setPartnershipRequests(requests)
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

  const handleProcessWeeklyRevenue = async () => {
    try {
      await processWeeklyRevenue()
      Alert.alert("Success", "Weekly revenue has been processed and distributed to users.")
      await loadData()
    } catch (error) {
      Alert.alert("Error", "Failed to process weekly revenue.")
    }
  }

  const handleAssignCollector = async () => {
    if (!selectedCollector) {
      Alert.alert("Error", "Please select a collector to assign.")
      return
    }

    try {
      await assignCollectorToStreet(selectedCollector, selectedStreet)
      Alert.alert("Success", `Collector assigned to ${selectedStreet}`)
      setSelectedCollector("")
      await loadData()
    } catch (error) {
      Alert.alert("Error", "Failed to assign collector.")
    }
  }

  const handlePartnershipRequest = async (partnerId, action) => {
    try {
      await updateRecyclerPartnership(partnerId, action)
      Alert.alert("Success", `Partnership request ${action}.`)
      await loadData()
    } catch (error) {
      Alert.alert("Error", "Failed to process partnership request.")
    }
  }

  const getBinStatusColor = (bin) => {
    const avgLevel = bin?.sensors ? Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4 : 0
    if (avgLevel >= 90) return "#FF4444"
    if (avgLevel >= 75) return "#FFA500"
    return "#059212"
  }

  const getAssignedCollectors = () => {
    return collectors?.filter((collector) => collector.assignedStreet === selectedStreet) || []
  }

  const handleStreetChange = (value) => {
    const street = value.split(' - ')[0]
    setSelectedStreet(street)
  }

  const filterCollectionEvents = () => {
    let filtered = collectionEvents || []
    if (startDate) {
      const start = new Date(startDate)
      filtered = filtered.filter(event => new Date(event.timestamp) >= start)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter(event => new Date(event.timestamp) <= end)
    }
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10)
  }

  const renderOverviewTab = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059212" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      )
    }

    const filteredEvents = filterCollectionEvents()

    return (
      <View>
        {/* Enhanced Stats Overview */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <View style={styles.statsGrid}>
            <LinearGradient colors={["#059212", "#06D001"]} style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalBins}</Text>
              <Text style={styles.statLabel}>Total Bins</Text>
            </LinearGradient>

            <LinearGradient colors={["#FF4444", "#FF6666"]} style={styles.statCard}>
              <Text style={styles.statValue}>{stats.criticalBins}</Text>
              <Text style={styles.statLabel}>Critical Bins</Text>
            </LinearGradient>

            <LinearGradient colors={["#9BEC00", "#B8FF00"]} style={styles.statCard}>
              <Text style={styles.statValue}>{stats.todayCollections}</Text>
              <Text style={styles.statLabel}>Today's Collections</Text>
            </LinearGradient>

            <LinearGradient colors={["#3B82F6", "#60A5FA"]} style={styles.statCard}>
              <Text style={styles.statValue}>{stats.activePartners}</Text>
              <Text style={styles.statLabel}>Active Partners</Text>
            </LinearGradient>

            <LinearGradient colors={["#10B981", "#34D399"]} style={styles.statCard}>
              <Text style={styles.statValue}>{(stats.totalWasteCollected || 0).toFixed(1)}kg</Text>
              <Text style={styles.statLabel}>Total Waste Collected</Text>
            </LinearGradient>

            <LinearGradient colors={["#8B5CF6", "#A78BFA"]} style={styles.statCard}>
              <Text style={styles.statValue}>{(stats.recyclingRate || 0).toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Recycling Rate</Text>
            </LinearGradient>

            <LinearGradient colors={["#F59E0B", "#FBBF24"]} style={styles.statCard}>
              <Text style={styles.statValue}>{(stats.carbonFootprintReduced || 0).toFixed(1)}kg</Text>
              <Text style={styles.statLabel}>CO₂ Reduced</Text>
            </LinearGradient>

            <LinearGradient colors={["#EF4444", "#F87171"]} style={styles.statCard}>
              <Text style={styles.statValue}>{stats.pendingPartnershipRequests}</Text>
              <Text style={styles.statLabel}>Pending Requests</Text>
            </LinearGradient>
          </View>
        </Animatable.View>

        {/* Date Filtration */}
        <View style={styles.dateFilterContainer}>
          <Text style={styles.sectionTitle}>Collection History</Text>
          <View style={styles.dateInputs}>
            <TextInput
              style={styles.dateInput}
              placeholder="Start Date (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
            />
            <TextInput
              style={styles.dateInput}
              placeholder="End Date (YYYY-MM-DD)"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </View>

        {/* Collection History Table */}
        <Animatable.View animation="fadeInUp" duration={800} delay={300}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Date</Text>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Time</Text>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Bin ID</Text>
                <Text style={[styles.tableHeaderText, { width: 150 }]}>Collector Name</Text>
                <Text style={[styles.tableHeaderText, { width: 150 }]}>Location</Text>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Organic (kg)</Text>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Plastic (kg)</Text>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Hazardous (kg)</Text>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Others (kg)</Text>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Collected</Text>
              </View>

              <ScrollView style={styles.tableBody}>
                {filteredEvents.map((event) => {
                  const date = new Date(event.timestamp).toLocaleDateString()
                  const time = new Date(event.timestamp).toLocaleTimeString()
                  const collected = event.status === "collected" || event.status === "recycled" ? "Yes" : "No"
                  return (
                    <View key={event.id} style={styles.tableRow}>
                      <Text style={[styles.tableCellText, { width: 100 }]}>{date}</Text>
                      <Text style={[styles.tableCellText, { width: 100 }]}>{time}</Text>
                      <Text style={[styles.tableCellText, { width: 100 }]}>{event.binId}</Text>
                      <Text style={[styles.tableCellText, { width: 150 }]}>{event.collectorName || "N/A"}</Text>
                      <Text style={[styles.tableCellText, { width: 150 }]}>{event.location.street || "N/A"}</Text>
                      <Text style={[styles.tableCellText, { width: 100 }]}>{(event.organicWeight || 0).toFixed(1)}</Text>
                      <Text style={[styles.tableCellText, { width: 100 }]}>{(event.plasticWeight || 0).toFixed(1)}</Text>
                      <Text style={[styles.tableCellText, { width: 100 }]}>{(event.hazardousWeight || 0).toFixed(1)}</Text>
                      <Text style={[styles.tableCellText, { width: 100 }]}>{(event.othersWeight || 0).toFixed(1)}</Text>
                      <Text style={[styles.tableCellText, { width: 100 }]}>{collected}</Text>
                    </View>
                  )
                })}
              </ScrollView>
            </View>
          </ScrollView>
        </Animatable.View>

        {/* Revenue Overview */}
        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <Text style={styles.sectionTitle}>Revenue Overview</Text>
          <View style={styles.revenueCard}>
            <View style={styles.revenueRow}>
              <View style={styles.revenueItem}>
                <Text style={styles.revenueValue}>₹{(stats.totalRevenue || 0).toFixed(2)}</Text>
                <Text style={styles.revenueLabel}>Total Revenue Generated</Text>
              </View>
            </View>

            <View style={styles.revenueBreakdown}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Municipality Share (60%)</Text>
                <Text style={styles.breakdownValue}>₹{(stats.municipalityShare || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>User Share (40%)</Text>
                <Text style={styles.breakdownValue}>₹{((stats.totalRevenue || 0) - (stats.municipalityShare || 0)).toFixed(2)}</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Weekly Revenue</Text>
                <Text style={styles.breakdownValue}>₹{(stats.weeklyRevenue || 0).toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.processButton} onPress={handleProcessWeeklyRevenue}>
              <Text style={styles.processButtonText}>Process Weekly Revenue</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {partnershipRequests.length > 0 && (
          <Animatable.View animation="fadeInUp" duration={800} delay={600}>
            <Text style={styles.sectionTitle}>Pending Partnership Requests</Text>
            <View style={styles.requestsContainer}>
              {partnershipRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestCompany}>{request.companyName}</Text>
                    <Text style={styles.requestDate}>{new Date(request.requestDate).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.requestDetails}>Contact: {request.contactPerson}</Text>
                  <Text style={styles.requestDetails}>Phone: {request.phone}</Text>
                  <Text style={styles.requestDetails}>Specialization: {request.specialization}</Text>

                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handlePartnershipRequest(request.id, "approved")}
                    >
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handlePartnershipRequest(request.id, "rejected")}
                    >
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </Animatable.View>
        )}
      </View>
    )
  }

  const renderStreetManagementTab = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059212" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      )
    }

    const assignedCollectors = getAssignedCollectors()
    const isUnassigned = assignedCollectors.length === 0

    return (
      <View>
        {/* Street Selection with Custom Dropdown */}
        <View style={styles.streetSelector}>
          <Text style={styles.sectionTitle}>Street Management</Text>
          <CustomDropdown
            selectedValue={streetOptions.find(option => option.startsWith(selectedStreet)) || streetOptions[0]}
            onValueChange={handleStreetChange}
            options={streetOptions}
            placeholder="Select a street"
          />
        </View>

        {isUnassigned && (
          <View style={styles.assignmentSection}>
            <Text style={styles.subsectionTitle}>Assign Collector to {selectedStreet}</Text>
            <View style={styles.assignmentContainer}>
              <CustomDropdown
                selectedValue={selectedCollector}
                onValueChange={setSelectedCollector}
                options={availableCollectors.map((c) => c.name)}
                placeholder="Select a collector"
                style={styles.collectorDropdown}
              />
              <TouchableOpacity style={styles.assignButton} onPress={handleAssignCollector}>
                <Text style={styles.assignButtonText}>Assign</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Assigned Collectors */}
        <View style={styles.collectorsSection}>
          <Text style={styles.subsectionTitle}>Assigned Collectors</Text>
          <View style={styles.collectorsContainer}>
            {assignedCollectors.map((collector) => (
              <View key={collector.id} style={styles.collectorCard}>
                <Text style={styles.collectorName}>{collector.name}</Text>
                <Text style={styles.collectorContact}>{collector.mobile}</Text>
                <Text style={styles.collectorStatus}>Status: {collector.status}</Text>
                <Text style={styles.collectorMetrics}>
                  Collections Today:{" "}
                  {
                    collectionEvents?.filter(
                      (e) =>
                        e.collectorId === collector.id &&
                        new Date(e.timestamp).toDateString() === new Date().toDateString(),
                    ).length || 0
                  }
                </Text>
              </View>
            ))}
            {isUnassigned && (
              <Text style={styles.emptyText}>No collectors assigned. Use the dropdown above to assign one.</Text>
            )}
          </View>
        </View>
      </View>
    )
  }

  const renderRevenueTab = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059212" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      )
    }

    const filteredEvents = filterCollectionEvents()

    return (
      <View>
        <Text style={styles.sectionTitle}>Revenue Details</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { width: 100 }]}>Bin ID</Text>
              <Text style={[styles.tableHeaderText, { width: 150 }]}>Date</Text>
              <Text style={[styles.tableHeaderText, { width: 100 }]}>Organic (kg)</Text>
              <Text style={[styles.tableHeaderText, { width: 100 }]}>Plastic (kg)</Text>
              <Text style={[styles.tableHeaderText, { width: 100 }]}>Hazardous (kg)</Text>
              <Text style={[styles.tableHeaderText, { width: 100 }]}>Others (kg)</Text>
              <Text style={[styles.tableHeaderText, { width: 100 }]}>Total Revenue (₹)</Text>
              <Text style={[styles.tableHeaderText, { width: 100 }]}>Status</Text>
            </View>

            <ScrollView style={styles.tableBody}>
              {filteredEvents.map((event) => {
                const date = new Date(event.timestamp).toLocaleDateString()
                const totalRevenue = event.recyclerBid || 0
                const hasPayout = payoutEvents.some(payout => payout.collectionEventId === event.id)
                const status = hasPayout ? "Paid" : "Unpaid"
                return (
                  <View key={event.id} style={styles.tableRow}>
                    <Text style={[styles.tableCellText, { width: 100 }]}>{event.binId}</Text>
                    <Text style={[styles.tableCellText, { width: 150 }]}>{date}</Text>
                    <Text style={[styles.tableCellText, { width: 100 }]}>{(event.organicWeight || 0).toFixed(1)}</Text>
                    <Text style={[styles.tableCellText, { width: 100 }]}>{(event.plasticWeight || 0).toFixed(1)}</Text>
                    <Text style={[styles.tableCellText, { width: 100 }]}>{(event.hazardousWeight || 0).toFixed(1)}</Text>
                    <Text style={[styles.tableCellText, { width: 100 }]}>{(event.othersWeight || 0).toFixed(1)}</Text>
                    <Text style={[styles.tableCellText, { width: 100 }]}>{totalRevenue.toFixed(2)}</Text>
                    <Text style={[styles.tableCellText, { width: 100 }]}>{status}</Text>
                  </View>
                )
              })}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    )
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
              <Text style={styles.welcomeText}>Municipality Dashboard</Text>
              <Text style={styles.userName}>{user?.name}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "overview" && styles.activeTab]}
            onPress={() => setActiveTab("overview")}
          >
            <Text style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "streets" && styles.activeTab]}
            onPress={() => setActiveTab("streets")}
          >
            <Text style={[styles.tabText, activeTab === "streets" && styles.activeTabText]}>Street Management</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "revenue" && styles.activeTab]}
            onPress={() => setActiveTab("revenue")}
          >
            <Text style={[styles.tabText, activeTab === "revenue" && styles.activeTabText]}>Revenue</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "streets" && renderStreetManagementTab()}
        {activeTab === "revenue" && renderRevenueTab()}
      </ScrollView>
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#059212",
    fontWeight: "600",
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  revenueCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  revenueRow: {
    alignItems: "center",
    marginBottom: 20,
  },
  revenueItem: {
    alignItems: "center",
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
  },
  revenueLabel: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  revenueBreakdown: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#666666",
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  processButton: {
    backgroundColor: "#059212",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  processButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  requestsContainer: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  requestCompany: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  requestDate: {
    fontSize: 12,
    color: "#666666",
  },
  requestDetails: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 4,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  approveButton: {
    backgroundColor: "#059212",
  },
  rejectButton: {
    backgroundColor: "#FF4444",
  },
  streetSelector: {
    marginBottom: 20,
  },
  assignmentSection: {
    marginBottom: 20,
  },
  assignmentContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  collectorDropdown: {
    flex: 1,
  },
  assignButton: {
    backgroundColor: "#059212",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  assignButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  collectorsSection: {
    marginBottom: 20,
  },
  collectorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  collectorCard: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minWidth: "45%",
  },
  collectorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  collectorContact: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  collectorStatus: {
    fontSize: 12,
    color: "#059212",
    marginTop: 2,
  },
  collectorMetrics: {
    fontSize: 11,
    color: "#666666",
    marginTop: 2,
    fontStyle: "italic",
  },
  table: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E8F5E8",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
  },
  tableBody: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tableCellText: {
    fontSize: 12,
    color: "#333333",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
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
  dateFilterContainer: {
    marginBottom: 16,
  },
  dateInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 14,
    color: "#333333",
  },


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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#059212",
    fontWeight: "600",
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  revenueCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  revenueRow: {
    alignItems: "center",
    marginBottom: 20,
  },
  revenueItem: {
    alignItems: "center",
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
  },
  revenueLabel: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  revenueBreakdown: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#666666",
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  processButton: {
    backgroundColor: "#059212",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  processButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  requestsContainer: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  requestCompany: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  requestDate: {
    fontSize: 12,
    color: "#666666",
  },
  requestDetails: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 4,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  approveButton: {
    backgroundColor: "#059212",
  },
  rejectButton: {
    backgroundColor: "#FF4444",
  },
  streetSelector: {
    marginBottom: 20,
  },
  assignmentSection: {
    marginBottom: 20,
  },
  assignmentContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  collectorDropdown: {
    flex: 1,
  },
  assignButton: {
    backgroundColor: "#059212",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  assignButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  collectorsSection: {
    marginBottom: 20,
  },
  collectorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  collectorCard: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minWidth: "45%",
  },
  collectorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  collectorContact: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  collectorStatus: {
    fontSize: 12,
    color: "#059212",
    marginTop: 2,
  },
  collectorMetrics: {
    fontSize: 11,
    color: "#666666",
    marginTop: 2,
    fontStyle: "italic",
  },
  binTableContainer: {
    marginTop: 20,
  },
  table: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E8F5E8",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
  },
  tableBody: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tableCellText: {
    fontSize: 12,
    color: "#333333",
    textAlign: "center",
  },
  complaintsContainer: {
    gap: 12,
  },
  complaintCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  complaintHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  complaintBin: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  complaintDate: {
    fontSize: 12,
    color: "#666666",
  },
  complaintDescription: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 8,
  },
  complaintCollector: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  complaintSeverity: {
    fontSize: 14,
    fontWeight: "500",
  },
  complaintActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  blockButton: {
    backgroundColor: "#FF4444",
  },
  warningButton: {
    backgroundColor: "#FFA500",
  },
  resolveButton: {
    backgroundColor: "#059212",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
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

export default MunicipalityDashboard