"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Animatable from "react-native-animatable"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataContext"
import { useLanguage } from "../../context/LanguageContext"
import QRScanner from "../../components/QRScanner"

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const CollectorDashboard = ({ navigation }) => {
  const { user, logout } = useAuth()
  const { bins, collectBin, collectionEvents, loadData } = useData()
  const { t } = useLanguage()
  const [refreshing, setRefreshing] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showMapView, setShowMapView] = useState(false)
  const [todayCollections, setTodayCollections] = useState(0)
  const [pendingBins, setPendingBins] = useState([])
  const [selectedBin, setSelectedBin] = useState(null)
  const [mapScale, setMapScale] = useState(1)
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    loadCollectorData()
  }, [bins, collectionEvents])

  const loadCollectorData = () => {
    const today = new Date().toDateString()
    const todayEvents = collectionEvents.filter(
      (event) => new Date(event.timestamp).toDateString() === today
    )
    setTodayCollections(todayEvents.length)

    // Get bins needing collection (>75%) and not yet notified
    const needCollection = bins.filter((bin) => {
      const avgLevel =
        Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4
      return avgLevel >= 75 && !bin.notified
    })

    // Mark bins as notified to prevent repeated notifications
    needCollection.forEach((bin) => (bin.notified = true))

    setPendingBins(needCollection)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleQRScan = async (binId) => {
    setShowScanner(false)

    const bin = bins.find((b) => b.binId === binId)
    if (!bin) {
      // Alert.alert("Error", "Bin not found")
      return
    }

    const avgLevel =
      Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4

    Alert.alert(
      "Bin Collection",
      `Bin ID: ${binId}\nLocation: ${bin.location.street}\nAverage Level: ${avgLevel.toFixed(
        1
      )}%\n\nConfirm collection?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Collect",
          onPress: () => performCollection(binId),
        },
      ]
    )
  }

  const performCollection = async (binId) => {
    const result = await collectBin(binId, user.userId)
    if (result.success) {
      const bin = bins.find((b) => b.binId === binId)
      if (bin) bin.notified = false // reset notification flag

      Alert.alert("Collection Successful", "Bin has been collected and levels reset.", [
        { text: "OK" },
      ])
      setSelectedBin(null)
    } else {
      Alert.alert("Error", result.error)
    }
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

  const getBinStatusColor = (bin) => {
    const avgLevel =
      Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4
    if (avgLevel >= 90 || bin.notified) return "#FF4444" // Red for critical or notified
    if (avgLevel >= 75) return "#FFA500" // Yellow for warning
    return "#059212" // Green for normal
  }

  const getBinStatusText = (bin) => {
    const avgLevel =
      Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4
    if (avgLevel >= 90 || bin.notified) return "Critical"
    if (avgLevel >= 75) return "Warning"
    return "Normal"
  }

  const getAvgLevel = (bin) => {
    return Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4
  }

  // Generate mock coordinates for bins based on their location
  const generateBinPosition = (bin, index) => {
    // Create a deterministic position based on bin ID and location
    const hash = bin.binId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const x = (Math.abs(hash) % 80) + 10 // 10-90% of map width
    const y = (Math.abs(hash * 7) % 70) + 15 // 15-85% of map height
    
    return { x, y }
  }

  const MapView = () => (
    <Modal visible={showMapView} animationType="slide" onRequestClose={() => setShowMapView(false)}>
      <View style={styles.mapContainer}>
        {/* Map Header */}
        <View style={styles.mapHeader}>
          <Text style={styles.mapTitle}>Waste Bins Map</Text>
          <TouchableOpacity 
            style={styles.closeMapButton} 
            onPress={() => {
              setShowMapView(false)
              setSelectedBin(null)
            }}
          >
            <Text style={styles.closeMapText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Map Legend */}
        <View style={styles.mapLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#059212' }]} />
            <Text style={styles.legendText}>Normal (&lt;75%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFA500' }]} />
            <Text style={styles.legendText}>Warning (75-90%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF4444' }]} />
            <Text style={styles.legendText}>Critical (&gt;90%)</Text>
          </View>
        </View>

        {/* Map Area */}
        <View style={styles.mapArea}>
          {/* Street Grid */}
          <View style={styles.streetGrid}>
            {/* Horizontal streets */}
            {[20, 40, 60, 80].map(y => (
              <View key={`h-${y}`} style={[styles.street, { top: `${y}%`, width: '100%', height: 2 }]} />
            ))}
            {/* Vertical streets */}
            {[20, 40, 60, 80].map(x => (
              <View key={`v-${x}`} style={[styles.street, { left: `${x}%`, height: '100%', width: 2 }]} />
            ))}
          </View>

          {/* Buildings/Blocks */}
          {[
            { x: 15, y: 25, width: 20, height: 15 },
            { x: 45, y: 15, width: 25, height: 20 },
            { x: 75, y: 30, width: 18, height: 25 },
            { x: 25, y: 55, width: 22, height: 18 },
            { x: 55, y: 65, width: 20, height: 20 },
            { x: 10, y: 75, width: 15, height: 12 },
          ].map((building, index) => (
            <View
              key={index}
              style={[
                styles.building,
                {
                  left: `${building.x}%`,
                  top: `${building.y}%`,
                  width: `${building.width}%`,
                  height: `${building.height}%`,
                }
              ]}
            />
          ))}

          {/* Bins */}
          {bins.map((bin, index) => {
            const position = generateBinPosition(bin, index)
            const color = getBinStatusColor(bin)
            const avgLevel = getAvgLevel(bin)
            
            return (
              <TouchableOpacity
                key={bin.binId}
                style={[
                  styles.binMarker,
                  {
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    backgroundColor: color,
                    transform: selectedBin?.binId === bin.binId ? [{ scale: 1.3 }] : [{ scale: 1 }],
                    zIndex: selectedBin?.binId === bin.binId ? 1000 : 1,
                  }
                ]}
                onPress={() => setSelectedBin(bin)}
              >
                <Text style={styles.binMarkerText}>🗑️</Text>
                <Text style={styles.binMarkerLevel}>{avgLevel.toFixed(0)}%</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Selected Bin Details */}
        {selectedBin && (
          <Animatable.View animation="slideInUp" duration={300} style={styles.binDetails}>
            <View style={styles.binDetailsHeader}>
              <Text style={styles.binDetailsTitle}>{selectedBin.binId}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getBinStatusColor(selectedBin) }]}>
                <Text style={styles.statusText}>{getBinStatusText(selectedBin)}</Text>
              </View>
            </View>
            
            <Text style={styles.binDetailsLocation}>{selectedBin.location.street}</Text>
            
            <View style={styles.binDetailsStats}>
              {Object.entries(selectedBin.sensors).map(([category, sensor]) => (
                <View key={category} style={styles.binDetailStatItem}>
                  <Text style={styles.binDetailStatValue}>{sensor.levelPct.toFixed(1)}%</Text>
                  <Text style={styles.binDetailStatLabel}>{category}</Text>
                </View>
              ))}
            </View>

            <View style={styles.binDetailsActions}>
              <TouchableOpacity 
                style={styles.collectFromMapButton} 
                onPress={() => {
                  setShowMapView(false)
                  handleQRScan(selectedBin.binId)
                }}
              >
                <Text style={styles.collectFromMapText}>Collect Bin</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.closeBinDetailsButton} 
                onPress={() => setSelectedBin(null)}
              >
                <Text style={styles.closeBinDetailsText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        )}
      </View>
    </Modal>
  )

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
              <Text style={styles.welcomeText}>Collector Dashboard</Text>
              <Text style={styles.userName}>{user?.name}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Stats Overview */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{todayCollections}</Text>
                <Text style={styles.statLabel}>Today's Collections</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{pendingBins.length}</Text>
                <Text style={styles.statLabel}>Pending Collections</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{bins.length}</Text>
                <Text style={styles.statLabel}>Total Bins</Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        {/* Action Buttons */}
        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.mapButton} onPress={() => setShowMapView(true)}>
              <LinearGradient colors={["#2196F3", "#21CBF3"]} style={styles.mapGradient}>
                <Text style={styles.mapIcon}>🗺️</Text>
                <Text style={styles.mapText}>View Map</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.scanButton} onPress={() => setShowScanner(true)}>
              <LinearGradient colors={["#059212", "#06D001"]} style={styles.scanGradient}>
                <Text style={styles.scanIcon}>📱</Text>
                <Text style={styles.scanText}>Scan QR Code</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Priority Collections */}
        <Animatable.View animation="fadeInUp" duration={800} delay={600}>
          <Text style={styles.sectionTitle}>Priority Collections</Text>
          {pendingBins.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No pending collections</Text>
              <Text style={styles.emptySubtext}>All bins are below 75% capacity</Text>
            </View>
          ) : (
            <View style={styles.binsContainer}>
              {pendingBins.slice(0, 5).map((bin, index) => (
                <Animatable.View key={bin.binId} animation="fadeInUp" duration={600} delay={index * 100}>
                  <View style={styles.binCard}>
                    <View style={styles.binHeader}>
                      <Text style={styles.binId}>{bin.binId}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getBinStatusColor(bin) }]}>
                        <Text style={styles.statusText}>{getBinStatusText(bin)}</Text>
                      </View>
                    </View>

                    <Text style={styles.binLocation}>{bin.location.street}</Text>

                    {/* Show each category */}
                    <View style={styles.binStats}>
                      {Object.entries(bin.sensors).map(([category, sensor]) => (
                        <View key={category} style={styles.binStatItem}>
                          <Text style={styles.binStatValue}>{sensor.levelPct.toFixed(1)}%</Text>
                          <Text style={styles.binStatLabel}>{category}</Text>
                        </View>
                      ))}

                      <View style={styles.binStatItem}>
                        <Text style={styles.binStatValue}>
                          {Object.values(bin.sensors)
                            .reduce((sum, sensor) => sum + sensor.weightKg, 0)
                            .toFixed(1)}{" "}
                          kg
                        </Text>
                        <Text style={styles.binStatLabel}>Total Weight</Text>
                      </View>

                      <View style={styles.binStatItem}>
                        <Text style={styles.binStatValue}>{bin.power.batteryPct.toFixed(0)}%</Text>
                        <Text style={styles.binStatLabel}>Battery</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.collectButton} onPress={() => handleQRScan(bin.binId)}>
                      <Text style={styles.collectButtonText}>Collect Now</Text>
                    </TouchableOpacity>
                  </View>
                </Animatable.View>
              ))}
            </View>
          )}
        </Animatable.View>

        {/* Recent Collections */}
        <Animatable.View animation="fadeInUp" duration={800} delay={800}>
          <Text style={styles.sectionTitle}>Recent Collections</Text>
          <View style={styles.recentContainer}>
            {collectionEvents
              .slice(-3)
              .reverse()
              .map((event, index) => (
                <View key={event.id} style={styles.recentItem}>
                  <View style={styles.recentIcon}>
                    <Text style={styles.recentIconText}>✅</Text>
                  </View>
                  <View style={styles.recentContent}>
                    <Text style={styles.recentBin}>{event.binId}</Text>
                    <Text style={styles.recentTime}>{new Date(event.timestamp).toLocaleString()}</Text>
                  </View>
                </View>
              ))}
          </View>
        </Animatable.View>
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      </Modal>

      {/* Map View Modal */}
      <MapView />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  header: { marginBottom: 20 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  welcomeText: { fontSize: 16, color: "#666666" },
  userName: { fontSize: 24, fontWeight: "bold", color: "#333333" },
  logoutButton: { backgroundColor: "#F5F5F5", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#E0E0E0" },
  logoutText: { color: "#FF4444", fontSize: 14, fontWeight: "500" },
  statsCard: { backgroundColor: "#F8F9FA", borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "#E0E0E0", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#333333" },
  statLabel: { fontSize: 12, color: "#666666", marginTop: 4, textAlign: "center" },
  
  // Action Buttons
  actionButtonsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  mapButton: { flex: 1, borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  mapGradient: { padding: 16, alignItems: "center", gap: 8 },
  mapIcon: { fontSize: 24 },
  mapText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  
  scanButton: { flex: 1, borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  scanGradient: { padding: 16, alignItems: "center", gap: 8 },
  scanIcon: { fontSize: 24 },
  scanText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },

  // Map Styles
  mapContainer: { flex: 1, backgroundColor: '#F0F2F5' },
  mapHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  mapTitle: { fontSize: 20, fontWeight: 'bold', color: '#333333' },
  closeMapButton: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#F5F5F5', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  closeMapText: { fontSize: 18, color: '#666666' },
  
  mapLegend: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendColor: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 10, color: '#666666' },

  mapArea: { 
    flex: 1, 
    margin: 20, 
    backgroundColor: '#E8F5E8', 
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3
  },
  
  streetGrid: { position: 'absolute', width: '100%', height: '100%' },
  street: { position: 'absolute', backgroundColor: '#CCCCCC' },
  
  building: { 
    position: 'absolute', 
    backgroundColor: '#DDDDDD', 
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC'
  },
  
  binMarker: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 2, 
    elevation: 4,
    transform: [{ translateX: -18 }, { translateY: -18 }]
  },
  binMarkerText: { fontSize: 12, marginBottom: -2 },
  binMarkerLevel: { fontSize: 8, color: '#FFFFFF', fontWeight: 'bold', position: 'absolute', bottom: -2 },

  // Bin Details
  binDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: -2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 8
  },
  binDetailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  binDetailsTitle: { fontSize: 18, fontWeight: 'bold', color: '#333333' },
  binDetailsLocation: { fontSize: 14, color: '#666666', marginBottom: 16 },
  binDetailsStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 },
  binDetailStatItem: { alignItems: 'center', minWidth: 60 },
  binDetailStatValue: { fontSize: 16, fontWeight: 'bold', color: '#333333' },
  binDetailStatLabel: { fontSize: 10, color: '#666666', marginTop: 2 },
  binDetailsActions: { flexDirection: 'row', gap: 12 },
  collectFromMapButton: { flex: 1, backgroundColor: '#059212', borderRadius: 12, padding: 16, alignItems: 'center' },
  collectFromMapText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  closeBinDetailsButton: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, paddingHorizontal: 20, borderWidth: 1, borderColor: '#E0E0E0' },
  closeBinDetailsText: { color: '#666666', fontSize: 16, fontWeight: '500' },

  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#333333", marginBottom: 16, marginTop: 20 },
  emptyState: { alignItems: "center", padding: 40, backgroundColor: "#F8F9FA", borderRadius: 16, borderWidth: 1, borderColor: "#E0E0E0" },
  emptyText: { fontSize: 18, color: "#666666", marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: "#999999" },
  binsContainer: { gap: 12 },
  binCard: { backgroundColor: "#F8F9FA", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E0E0E0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  binHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  binId: { fontSize: 16, fontWeight: "600", color: "#333333" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: "#FFFFFF", fontSize: 10, fontWeight: "600", textTransform: "uppercase" },
  binLocation: { fontSize: 14, color: "#666666", marginBottom: 12 },
  binStats: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 },
  binStatItem: { alignItems: "center", minWidth: 60 },
  binStatValue: { fontSize: 16, fontWeight: "bold", color: "#333333" },
  binStatLabel: { fontSize: 10, color: "#666666", marginTop: 2 },
  collectButton: { backgroundColor: "#059212", borderRadius: 8, padding: 12, alignItems: "center" },
  collectButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  recentContainer: { gap: 12 },
  recentItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F9FA", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#E0E0E0" },
  recentIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#059212", justifyContent: "center", alignItems: "center", marginRight: 12 },
  recentIconText: { fontSize: 16 },
  recentContent: { flex: 1 },
  recentBin: { fontSize: 16, fontWeight: "600", color: "#333333" },
  recentTime: { fontSize: 12, color: "#666666", marginTop: 2 },
})

export default CollectorDashboard