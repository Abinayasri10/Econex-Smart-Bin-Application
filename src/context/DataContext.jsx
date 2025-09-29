"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [bins, setBins] = useState([])
  const [collectionEvents, setCollectionEvents] = useState([])
  const [collectionRequests, setCollectionRequests] = useState([])
  const [payoutEvents, setPayoutEvents] = useState([])
  const [recyclerPartners, setRecyclerPartners] = useState([])
  const [municipalityPartners, setMunicipalityPartners] = useState([])
  const [collectors, setCollectors] = useState([])
  const [segregationComplaints, setSegregationComplaints] = useState([])
  const [environmentalMetrics, setEnvironmentalMetrics] = useState([])
  const [blockedUsers, setBlockedUsers] = useState([])

  useEffect(() => {
    loadData()
    initializeDefaultData()
    startDataSimulation()
  }, [])

  const initializeDefaultData = async () => {
    try {
      // Initialize default collectors if none exist
      const existingCollectors = await AsyncStorage.getItem("collectors")
      if (!existingCollectors) {
        const defaultCollectors = [
          {
            id: "collector_1",
            name: "Sudhakar",
            mobile: "+91 9876543210",
            email: "Sudhakar@waste.com",
            status: "active",
            assignedStreet: null,
            totalCollections: 0,
            rating: 4.8,
          },
          {
            id: "collector_2",
            name: "Gomathi",
            mobile: "+91 9876543211",
            email: "gomathi@waste.com",
            status: "active",
            assignedStreet: null,
            totalCollections: 0,
            rating: 4.6,
          },
          {
            id: "collector_3",
            name: "Rajesh",
            mobile: "+91 9876543212",
            email: "Rajesh@waste.com",
            status: "active",
            assignedStreet: null,
            totalCollections: 0,
            rating: 4.9,
          },
          {
            id: "collector_4",
            name: "Kavitha",
            mobile: "+91 9876543213",
            email: "kavitha@waste.com",
            status: "active",
            assignedStreet: null,
            totalCollections: 0,
            rating: 4.7,
          },
        ]
        await AsyncStorage.setItem("collectors", JSON.stringify(defaultCollectors))
        setCollectors(defaultCollectors)
      }

      // Initialize recycler partners if none exist
      const existingPartners = await AsyncStorage.getItem("recyclerPartners")
      if (!existingPartners) {
        const defaultPartners = [
          {
            id: "recycler_1",
            companyName: "GreenCycle Industries",
            contactPerson: "Raj Kumar",
            phone: "+91 9876543220",
            email: "raj@greencycle.com",
            specialization: "Plastic & Electronic Waste",
            status: "active",
            requestDate: new Date().toISOString(),
            approvedDate: new Date().toISOString(),
          },
          {
            id: "recycler_2",
            companyName: "EcoWaste Solutions",
            contactPerson: "Priya Sharma",
            phone: "+91 9876543221",
            email: "priya@ecowaste.com",
            specialization: "Organic & Compost",
            status: "pending",
            requestDate: new Date().toISOString(),
          },
        ]
        await AsyncStorage.setItem("recyclerPartners", JSON.stringify(defaultPartners))
        setRecyclerPartners(defaultPartners)
      }
    } catch (error) {
      console.error("Default data initialization error:", error)
    }
  }

  const loadData = async () => {
    try {
      // Load bins
      const binKeys = await AsyncStorage.getAllKeys()
      const binDataKeys = binKeys.filter((key) => key.startsWith("bin:"))
      const binData = await AsyncStorage.multiGet(binDataKeys)
      const loadedBins = binData.map(([key, value]) => JSON.parse(value))
      setBins(loadedBins)

      // Load collection events
      const events = await AsyncStorage.getItem("collectionEvents")
      if (events) {
        setCollectionEvents(JSON.parse(events))
      }

      // Load collection requests
      const requests = await AsyncStorage.getItem("collectionRequests")
      if (requests) {
        setCollectionRequests(JSON.parse(requests))
      }

      // Load payout events
      const payouts = await AsyncStorage.getItem("payoutEvents")
      if (payouts) {
        setPayoutEvents(JSON.parse(payouts))
      }

      const partners = await AsyncStorage.getItem("recyclerPartners")
      if (partners) {
        setRecyclerPartners(JSON.parse(partners))
      }

      const municipalityPartnersData = await AsyncStorage.getItem("municipalityPartners")
      if (municipalityPartnersData) {
        setMunicipalityPartners(JSON.parse(municipalityPartnersData))
      }

      const collectorsData = await AsyncStorage.getItem("collectors")
      if (collectorsData) {
        setCollectors(JSON.parse(collectorsData))
      }

      const complaintsData = await AsyncStorage.getItem("segregationComplaints")
      if (complaintsData) {
        setSegregationComplaints(JSON.parse(complaintsData))
      }

      const metricsData = await AsyncStorage.getItem("environmentalMetrics")
      if (metricsData) {
        setEnvironmentalMetrics(JSON.parse(metricsData))
      }

      const blockedUsersData = await AsyncStorage.getItem("blockedUsers")
      if (blockedUsersData) {
        setBlockedUsers(JSON.parse(blockedUsersData))
      }
    } catch (error) {
      console.error("Data loading error:", error)
    }
  }

  const startDataSimulation = () => {
    // Simulate bin level updates every 15 seconds
    const interval = setInterval(async () => {
      await simulateBinUpdates()
    }, 15000)

    return () => clearInterval(interval)
  }

  const simulateBinUpdates = async () => {
    try {
       await fetchWasteWeight() 
      const binKeys = await AsyncStorage.getAllKeys()
      const binDataKeys = binKeys.filter((key) => key.startsWith("bin:"))

      for (const key of binDataKeys) {
        const binData = await AsyncStorage.getItem(key)
        if (binData) {
          const bin = JSON.parse(binData)

          // Simulate waste addition with probabilities
          const categories = ["organic", "plastic", "hazardous", "others"]
          const probabilities = [0.5, 0.2, 0.3, 0.15]

          categories.forEach((category, index) => {
            if (Math.random() < probabilities[index] && bin.sensors[category].levelPct < 100) {
              const increment = Math.floor(Math.random() * 6) + 1 // 1-6%
              bin.sensors[category].levelPct = Math.min(100, bin.sensors[category].levelPct + increment)
              bin.sensors[category].weightKg = (bin.sensors[category].levelPct / 100) * (bin.binCapacityKg / 4)
            }
          })

          // Update power consumption
          bin.power.lastReadWattHour += Math.random() * 0.1
          bin.power.batteryPct = Math.max(0, bin.power.batteryPct - Math.random() * 0.1)

          bin.lastUpdated = new Date().toISOString()

          // Check for alerts
          const totalLevel = Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.levelPct, 0) / 4
          if (totalLevel >= 90) {
            await sendNotification("Critical Bin Level", `Bin ${bin.binId} is 90% full and needs immediate collection!`)
          } else if (totalLevel >= 75) {
            await sendNotification("Bin Level Warning", `Bin ${bin.binId} is 75% full and should be collected soon.`)
          }

          await AsyncStorage.setItem(key, JSON.stringify(bin))
        }
      }

      // Reload bins data
      await loadData()
    } catch (error) {
      console.error("Bin simulation error:", error)
    }
  }

  const sendNotification = async (title, body) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null,
      })
    } catch (error) {
      //console.error("Notification error:", error)
    }
  }

  const collectBin = async (binId, collectorId) => {
    try {
      const binData = await AsyncStorage.getItem(`bin:${binId}`)
      if (!binData) {
        throw new Error("Bin not found")
      }

      const bin = JSON.parse(binData)

      const collectionEvent = {
        id: `collection_${Date.now()}`,
        binId,
        collectorId,
        timestamp: new Date().toISOString(),
        wasteCollected: { ...bin.sensors },
        location: bin.location,
        organicWeight: bin.sensors.organic.weightKg,
        plasticWeight: bin.sensors.plastic.weightKg,
        hazardousWeight: bin.sensors.hazardous.weightKg,
        othersWeight: bin.sensors.others.weightKg,
        totalWeight: Object.values(bin.sensors).reduce((sum, sensor) => sum + sensor.weightKg, 0),
        collectorName: collectors.find((c) => c.id === collectorId)?.name || "Unknown Collector",
        status: "collected", // Initial status
      }

      // Reset bin levels
      Object.keys(bin.sensors).forEach((category) => {
        bin.sensors[category].levelPct = 0
        bin.sensors[category].weightKg = 0
      })

      bin.lastUpdated = new Date().toISOString()

      // Save updated bin
      await AsyncStorage.setItem(`bin:${binId}`, JSON.stringify(bin))

      // Save collection event
      const events = [...collectionEvents, collectionEvent]
      setCollectionEvents(events)
      await AsyncStorage.setItem("collectionEvents", JSON.stringify(events))

      const updatedCollectors = collectors.map((collector) => {
        if (collector.id === collectorId) {
          return {
            ...collector,
            totalCollections: collector.totalCollections + 1,
            lastCollection: new Date().toISOString(),
          }
        }
        return collector
      })
      setCollectors(updatedCollectors)
      await AsyncStorage.setItem("collectors", JSON.stringify(updatedCollectors))

      // Note: Removed immediate processRevenue call to delay until recycler collects

      return { success: true, event: collectionEvent }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const submitRecyclerBid = async (eventId, recyclerId, bidAmount, compostWeight, othersWeight) => {
    try {
      const updatedEvents = collectionEvents.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            recyclerId,
            recyclerBid: bidAmount,
            compostWeight,
            othersWeight,
            recyclerCollectionTimestamp: new Date().toISOString(),
            status: "recycled",
          }
        }
        return event;
      });

      setCollectionEvents(updatedEvents);
      await AsyncStorage.setItem("collectionEvents", JSON.stringify(updatedEvents));

      // Process revenue now that recycler has "collected"
      const event = updatedEvents.find(e => e.id === eventId);
      const totalRevenue = bidAmount;
      const userShare = totalRevenue * 0.4;
      const municipalityShare = totalRevenue * 0.6;

      const payoutEvent = {
        id: `payout_${Date.now()}`,
        collectionEventId: eventId,
        binId: event.binId,
        totalRevenue,
        userShare,
        municipalityShare,
        timestamp: new Date().toISOString(),
      };

      const updatedPayouts = [...payoutEvents, payoutEvent];
      setPayoutEvents(updatedPayouts);
      await AsyncStorage.setItem("payoutEvents", JSON.stringify(updatedPayouts));

      await sendNotification("Revenue Processed", `User earned ₹${userShare.toFixed(2)} from waste collection.`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  const assignCollectorToStreet = async (collectorName, street) => {
    try {
      const updatedCollectors = collectors.map((collector) => {
        if (collector.name === collectorName) {
          return {
            ...collector,
            assignedStreet: street,
            assignedDate: new Date().toISOString(),
          }
        }
        return collector
      })

      setCollectors(updatedCollectors)
      await AsyncStorage.setItem("collectors", JSON.stringify(updatedCollectors))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateRecyclerPartnership = async (partnerId, action) => {
    try {
      const updatedPartners = recyclerPartners.map((partner) => {
        if (partner.id === partnerId) {
          return {
            ...partner,
            status: action,
            processedDate: new Date().toISOString(),
          }
        }
        return partner
      })

      setRecyclerPartners(updatedPartners)
      await AsyncStorage.setItem("recyclerPartners", JSON.stringify(updatedPartners))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const processSegregationComplaint = async (complaintId, action) => {
    try {
      const updatedComplaints = segregationComplaints.map((complaint) => {
        if (complaint.id === complaintId) {
          return {
            ...complaint,
            status: action === "warning" ? "warned" : "resolved",
            action: action,
            processedDate: new Date().toISOString(),
          }
        }
        return complaint
      })

      setSegregationComplaints(updatedComplaints)
      await AsyncStorage.setItem("segregationComplaints", JSON.stringify(updatedComplaints))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
   const fetchWasteWeight = async () => {
  try {
    const response = await fetch("http://192.168.43.82:8000/waste_send/") // change to your API base URL
    const data = await response.json()

    if (data?.waste && data?.weight) {
      const { waste, weight } = data

      // pick first bin for demo (you can choose differently)
      const binId = bins.length > 0 ? bins[0].binId : null
      if (!binId) return

      const binKey = `bin:${binId}`
      const binData = await AsyncStorage.getItem(binKey)
      if (!binData) return

      const bin = JSON.parse(binData)

      // update matching waste type
      const category = waste.toLowerCase()
      if (bin.sensors[category]) {
        const sensor = bin.sensors[category]
        const weightKg = weight / 1000  // convert g → kg
        sensor.weightKg += weightKg
        sensor.levelPct = Math.min(
          100,
          (sensor.weightKg / (bin.binCapacityKg / 4)) * 100
        )
       

      }

      bin.lastUpdated = new Date().toISOString()
      await AsyncStorage.setItem(binKey, JSON.stringify(bin))
      await loadData()

      await sendNotification("Waste Collected", `${weight} g ${waste} collected!`)
    }
  } catch (error) {
     //console.error("Error fetching waste weight:", error)
  }
}

  const recordPayment = async (paymentData) => {
    try {
      const payment = {
        id: `recycler_payment_${Date.now()}`,
        ...paymentData,
        timestamp: new Date().toISOString(),
      }

      const recentCollections = collectionEvents.filter((event) => {
        const eventDate = new Date(event.timestamp)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return eventDate >= weekAgo
      })
     

      // Process revenue distribution to users
      const userPayouts = []
      recentCollections.forEach((event) => {
        const userPayout = {
          id: `user_payout_${Date.now()}_${event.binId}`,
          binId: event.binId,
          collectionEventId: event.id,
          amount: (event.totalWeight || 0) * paymentData.categoryRates.organic * 0.4, // 40% to user
          source: "recycler_payment",
          timestamp: new Date().toISOString(),
        }
        userPayouts.push(userPayout)
      })

      // Save payment and user payouts
      await AsyncStorage.setItem(`recyclerPayment:${payment.id}`, JSON.stringify(payment))

      for (const payout of userPayouts) {
        await AsyncStorage.setItem(`userPayout:${payout.id}`, JSON.stringify(payout))
      }

      await sendNotification("Payment Recorded", "Payment has been recorded and user shares have been distributed.")

      return { success: true, payment, userPayouts }
    } catch (error) {
      console.error("Payment recording error:", error)
      return { success: false, error: error.message }
    }
  }

  const calculateEnvironmentalImpact = async () => {
    try {
      const impactFactors = {
        plastic: 2.0, // kg CO₂ saved per kg
        organic: 0.5,
        hazardous: 3.0,
        others: 1.5,
      }

      let totalCO2Saved = 0
      const categoryImpacts = {}

      collectionEvents.forEach((event) => {
        Object.entries(event.wasteCollected).forEach(([category, sensor]) => {
          const co2Saved = sensor.weightKg * impactFactors[category]
          totalCO2Saved += co2Saved

          if (!categoryImpacts[category]) {
            categoryImpacts[category] = 0
          }
          categoryImpacts[category] += co2Saved
        })
      })

      const metrics = {
        id: `metrics_${Date.now()}`,
        totalCO2Saved,
        categoryImpacts,
        timestamp: new Date().toISOString(),
      }

      const updatedMetrics = [...environmentalMetrics, metrics]
      setEnvironmentalMetrics(updatedMetrics)
      await AsyncStorage.setItem("environmentalMetrics", JSON.stringify(updatedMetrics))
    } catch (error) {
      console.error("Environmental impact calculation error:", error)
    }
  }

  const sendConnectionRequest = async (targetId, requestType = "recycler_to_municipality") => {
    try {
      const request = {
        id: `connection_${Date.now()}`,
        requestType,
        targetId,
        status: "pending",
        timestamp: new Date().toISOString(),
      }

      await AsyncStorage.setItem(`connectionRequest:${request.id}`, JSON.stringify(request))
      await sendNotification("Connection Request Sent", "Your partnership request has been sent.")
    } catch (error) {
      console.error("Connection request error:", error)
    }
  }

  const getBinsByUser = (userId) => {
    return bins.filter((bin) => bin.userBinOwner === userId)
  }

  const getCollectionEventsByBin = (binId) => {
    return collectionEvents.filter((event) => event.binId === binId)
  }

  const getPayoutEventsByBin = (binId) => {
    return payoutEvents.filter((event) => event.binId === binId)
  }

  const requestCollection = async (binId, userId) => {
    try {
      const request = {
        id: `request_${Date.now()}`,
        binId,
        userId,
        status: "pending",
        timestamp: new Date().toISOString(),
      }

      const updatedRequests = [...collectionRequests, request]
      setCollectionRequests(updatedRequests)
      await AsyncStorage.setItem("collectionRequests", JSON.stringify(updatedRequests))

      await sendNotification("Collection Requested", "Your collection request has been sent.")
    } catch (error) {
      console.error("Collection request error:", error)
    }
  }

  const processWeeklyRevenue = () => {
    // Implementation for processWeeklyRevenue if needed, but since immediate, optional
  }

  const blockUserRevenue = () => {
    // Implementation for blockUserRevenue
  }

  const value = {
    bins,
    collectionEvents,
    collectionRequests,
    payoutEvents,
    recyclerPartners,
    municipalityPartners,
    collectors,
    segregationComplaints,
    environmentalMetrics,
    blockedUsers,
    fetchWasteWeight,
    collectBin,
    requestCollection,
    getBinsByUser,
    getCollectionEventsByBin,
    getPayoutEventsByBin,
    processWeeklyRevenue,
    blockUserRevenue,
    recordPayment,
    calculateEnvironmentalImpact,
    sendConnectionRequest,
    assignCollectorToStreet,
    updateRecyclerPartnership,
    processSegregationComplaint,
    submitRecyclerBid,
    loadData,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}