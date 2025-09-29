import { View, Text, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Animatable from "react-native-animatable"

const BinLevelIndicator = ({ category, level, weight, color, animated = true }) => {
  const getStatusColor = () => {
    if (level >= 90) return "#FF4444"
    if (level >= 75) return "#FFA500"
    return color
  }

  const getStatusText = () => {
    if (level >= 90) return "Critical"
    if (level >= 75) return "Warning"
    return "Normal"
  }

  const Component = animated ? Animatable.View : View

  return (
    <Component animation={animated ? "fadeInUp" : undefined} duration={50} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.categoryText}>{category}</Text>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
      </View>

      <View style={styles.levelContainer}>
        <View style={styles.levelBar}>
          <LinearGradient
            colors={[getStatusColor(), `${getStatusColor()}80`]}
            style={[styles.levelFill, { width: `${level}%` }]}
          />
        </View>
        <Text style={styles.percentageText}>{level}%</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.weightText}>{weight.toFixed(2)} kg</Text>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
      </View>
    </Component>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  levelBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    marginRight: 12,
    overflow: "hidden",
  },
  levelFill: {
    height: "100%",
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    minWidth: 40,
    textAlign: "right",
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weightText: {
    fontSize: 12,
    color: "#999",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})

export default BinLevelIndicator
