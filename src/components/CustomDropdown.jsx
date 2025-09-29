"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native"

const CustomDropdown = ({ selectedValue, onValueChange, options, placeholder = "Select an option", style }) => {
  const [isVisible, setIsVisible] = useState(false)

  const handleSelect = (value) => {
    onValueChange(value)
    setIsVisible(false)
  }

  const renderOption = ({ item }) => (
    <TouchableOpacity
      style={[styles.option, selectedValue === item && styles.selectedOption]}
      onPress={() => handleSelect(item)}
    >
      <Text style={[styles.optionText, selectedValue === item && styles.selectedOptionText]}>{item}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.selector} onPress={() => setIsVisible(true)}>
        <Text style={styles.selectorText}>{selectedValue || placeholder}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={() => setIsVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setIsVisible(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  selector: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 50,
  },
  selectorText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    maxHeight: 300,
    minWidth: 200,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedOption: {
    backgroundColor: "#E8F5E8",
  },
  optionText: {
    fontSize: 16,
    color: "#333333",
  },
  selectedOptionText: {
    color: "#059212",
    fontWeight: "600",
  },
})

export default CustomDropdown
