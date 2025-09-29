import AsyncStorage from "@react-native-async-storage/async-storage"

// Storage keys
const STORAGE_KEYS = {
  USER: "@econex_user",
  BINS: "@econex_bins",
  USERS: "@econex_users",
  COLLECTION_EVENTS: "@econex_collection_events",
  PAYOUT_EVENTS: "@econex_payout_events",
  LANGUAGE: "@econex_language",
  BIOMETRIC_ENABLED: "@econex_biometric_enabled",
}

// Generic storage functions
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(key, jsonValue)
    return true
  } catch (error) {
    console.error("Error storing data:", error)
    return false
  }
}

export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue != null ? JSON.parse(jsonValue) : null
  } catch (error) {
    console.error("Error getting data:", error)
    return null
  }
}

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key)
    return true
  } catch (error) {
    console.error("Error removing data:", error)
    return false
  }
}

export const clearAllData = async () => {
  try {
    await AsyncStorage.clear()
    return true
  } catch (error) {
    console.error("Error clearing all data:", error)
    return false
  }
}

// Specific storage functions
export const storeUser = (user) => storeData(STORAGE_KEYS.USER, user)
export const getUser = () => getData(STORAGE_KEYS.USER)
export const removeUser = () => removeData(STORAGE_KEYS.USER)

export const storeBins = (bins) => storeData(STORAGE_KEYS.BINS, bins)
export const getBins = () => getData(STORAGE_KEYS.BINS)

export const storeUsers = (users) => storeData(STORAGE_KEYS.USERS, users)
export const getUsers = () => getData(STORAGE_KEYS.USERS)

export const storeCollectionEvents = (events) => storeData(STORAGE_KEYS.COLLECTION_EVENTS, events)
export const getCollectionEvents = () => getData(STORAGE_KEYS.COLLECTION_EVENTS)

export const storePayoutEvents = (events) => storeData(STORAGE_KEYS.PAYOUT_EVENTS, events)
export const getPayoutEvents = () => getData(STORAGE_KEYS.PAYOUT_EVENTS)

export const storeLanguage = (language) => storeData(STORAGE_KEYS.LANGUAGE, language)
export const getLanguage = () => getData(STORAGE_KEYS.LANGUAGE)

export const storeBiometricEnabled = (enabled) => storeData(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled)
export const getBiometricEnabled = () => getData(STORAGE_KEYS.BIOMETRIC_ENABLED)

export { STORAGE_KEYS }
