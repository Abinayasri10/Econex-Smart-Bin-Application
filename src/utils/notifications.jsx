import * as Notifications from "expo-notifications"
import { Platform } from "react-native"

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      return { success: false, error: "Permission not granted" }
    }

    // Get push token for remote notifications
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error requesting notification permissions:", error)
    return { success: false, error: error.message }
  }
}

export const scheduleLocalNotification = async (title, body, data = {}, trigger = null) => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
      },
      trigger: trigger || null, // null means immediate
    })

    return { success: true, notificationId }
  } catch (error) {
    console.error("Error scheduling notification:", error)
    return { success: false, error: error.message }
  }
}

export const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
    return { success: true }
  } catch (error) {
    console.error("Error canceling notification:", error)
    return { success: false, error: error.message }
  }
}

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync()
    return { success: true }
  } catch (error) {
    console.error("Error canceling all notifications:", error)
    return { success: false, error: error.message }
  }
}

// Notification types for the app
export const NOTIFICATION_TYPES = {
  BIN_FULL: "bin_full",
  COLLECTION_REMINDER: "collection_reminder",
  REVENUE_UPDATE: "revenue_update",
  SYSTEM_ALERT: "system_alert",
}

// Helper functions for specific notifications
export const notifyBinFull = (binId, location) => {
  return scheduleLocalNotification("Bin Full Alert", `Bin ${binId} at ${location} is full and needs collection`, {
    type: NOTIFICATION_TYPES.BIN_FULL,
    binId,
    location,
  })
}

export const notifyCollectionReminder = (binId, location) => {
  return scheduleLocalNotification("Collection Reminder", `Don't forget to collect from bin ${binId} at ${location}`, {
    type: NOTIFICATION_TYPES.COLLECTION_REMINDER,
    binId,
    location,
  })
}

export const notifyRevenueUpdate = (amount, type) => {
  return scheduleLocalNotification("Revenue Update", `You've earned ₹${amount.toFixed(2)} from ${type}`, {
    type: NOTIFICATION_TYPES.REVENUE_UPDATE,
    amount,
    revenueType: type,
  })
}

export const notifySystemAlert = (message) => {
  return scheduleLocalNotification("System Alert", message, { type: NOTIFICATION_TYPES.SYSTEM_ALERT })
}
