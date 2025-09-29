"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { useData } from "../context/DataContext"

const { width, height } = Dimensions.get("window")

const MapView = ({ collectorId, onBinSelect }) => {
  const { bins, getBinsByStreet } = useData()
  const [selectedStreet, setSelectedStreet] = useState("Street 1")
  const [streetBins, setStreetBins] = useState([])

  const streets = Array.from({ length: 10 }, (_, i) => `Street ${i + 1}`)

  useEffect(() => {
    const binsInStreet = getBinsByStreet(selectedStreet)
    setStreetBins(binsInStreet)
  }, [selectedStreet, bins])

  const getBinColor = (bin) => {
    const avgLevel = Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4
    if (avgLevel >= 90) return "#FF4444" // Red
    if (avgLevel >= 75) return "#FFA500" // Yellow/Orange
    return "#059212" // Green
  }

  const getBinSize = (bin) => {
    const avgLevel = Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4
    return Math.max(20, Math.min(40, 20 + (avgLevel / 100) * 20))
  }

  const renderBin = (bin, index) => {
    const avgLevel = Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4
    const binColor = getBinColor(bin)
    const binSize = getBinSize(bin)

    // Create a more realistic street layout
    const binsPerRow = 3
    const row = Math.floor(index / binsPerRow)
    const col = index % binsPerRow

    const baseX = 60 + col * ((width - 120) / binsPerRow)
    const baseY = 120 + row * 100

    // Add some randomness for realistic positioning
    const offsetX = (Math.random() - 0.5) * 30
    const offsetY = (Math.random() - 0.5) * 20

    return (
      <TouchableOpacity
        key={bin.binId}
        style={[
          styles.binMarker,
          {
            left: baseX + offsetX,
            top: baseY + offsetY,
            backgroundColor: binColor,
            width: binSize,
            height: binSize,
            borderRadius: binSize / 2,
          },
        ]}
        onPress={() => onBinSelect && onBinSelect(bin)}
      >
        <Text style={styles.binText}>{avgLevel.toFixed(0)}%</Text>
        <View style={styles.binPulse} />
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      {/* Street Selector */}
      <View style={styles.streetSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {streets.map((street) => (
            <TouchableOpacity
              key={street}
              style={[styles.streetButton, selectedStreet === street && styles.selectedStreetButton]}
              onPress={() => setSelectedStreet(street)}
            >
              <Text style={[styles.streetButtonText, selectedStreet === street && styles.selectedStreetButtonText]}>
                {street}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        {/* Street Background with Google Maps-like styling */}
        <View style={styles.streetBackground}>
          <Text style={styles.streetTitle}>{selectedStreet} - Bin Locations</Text>

          {/* Enhanced Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Bin Status</Text>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: "#FF4444" }]} />
              <Text style={styles.legendText}>Critical (≥90%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: "#FFA500" }]} />
              <Text style={styles.legendText}>Warning (≥75%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: "#059212" }]} />
              <Text style={styles.legendText}>Normal (&lt;75%)</Text>
            </View>
          </View>

          {/* Street Grid Lines */}
          <View style={styles.streetGrid}>
            <View style={styles.mainStreet} />
            <View style={styles.crossStreet1} />
            <View style={styles.crossStreet2} />
            <View style={styles.sidewalk1} />
            <View style={styles.sidewalk2} />
          </View>

          {/* Render Bins */}
          {streetBins.map((bin, index) => renderBin(bin, index))}

          {/* Street Labels */}
          <Text style={styles.streetLabel}>Main Road</Text>
          <Text style={[styles.streetLabel, styles.sideStreetLabel]}>Side Street</Text>
        </View>

        {/* Enhanced Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streetBins.length}</Text>
            <Text style={styles.statLabel}>Total Bins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#FF4444" }]}>
              {
                streetBins.filter((bin) => {
                  const avgLevel = Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4
                  return avgLevel >= 90
                }).length
              }
            </Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#FFA500" }]}>
              {
                streetBins.filter((bin) => {
                  const avgLevel = Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4
                  return avgLevel >= 75 && avgLevel < 90
                }).length
              }
            </Text>
            <Text style={styles.statLabel}>Warning</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#059212" }]}>
              {
                streetBins.filter((bin) => {
                  const avgLevel = Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4
                  return avgLevel < 75
                }).length
              }
            </Text>
            <Text style={styles.statLabel}>Normal</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  streetSelector: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  streetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DEE2E6",
  },
  selectedStreetButton: {
    backgroundColor: "#059212",
    borderColor: "#059212",
  },
  streetButtonText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  selectedStreetButtonText: {
    color: "#FFFFFF",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  streetBackground: {
    flex: 1,
    backgroundColor: "#F0F8F0",
    position: "relative",
  },
  streetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    textAlign: "center",
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  legend: {
    position: "absolute",
    top: 60,
    right: 15,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 10,
    color: "#495057",
  },
  streetGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mainStreet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#6C757D",
    top: "50%",
    marginTop: -2,
  },
  crossStreet1: {
    position: "absolute",
    left: "30%",
    width: 3,
    height: "100%",
    backgroundColor: "#6C757D",
    top: 0,
  },
  crossStreet2: {
    position: "absolute",
    left: "70%",
    width: 3,
    height: "100%",
    backgroundColor: "#6C757D",
    top: 0,
  },
  sidewalk1: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#ADB5BD",
    top: "50%",
    marginTop: -20,
  },
  sidewalk2: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#ADB5BD",
    top: "50%",
    marginTop: 18,
  },
  streetLabel: {
    position: "absolute",
    fontSize: 10,
    color: "#6C757D",
    fontWeight: "500",
    left: 10,
    top: "50%",
    marginTop: -25,
  },
  sideStreetLabel: {
    left: "32%",
    top: 10,
    transform: [{ rotate: "90deg" }],
  },
  binMarker: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  binText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
  },
  binPulse: {
    position: "absolute",
    width: "150%",
    height: "150%",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#059212",
  },
  statLabel: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 2,
  },
})

export default MapView
