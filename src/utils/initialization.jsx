import AsyncStorage from "@react-native-async-storage/async-storage"

export const initializeApp = async () => {
  try {
    // Check if app is already initialized
    const isInitialized = await AsyncStorage.getItem("app:initialized")
    if (isInitialized) {
      return
    }

    // Create sample data
    await createSampleUsers()
    await createSampleBins()
    await createSampleCollectors()
    await createSampleMunicipalities()
    await createSampleRecyclers()

    // Mark as initialized
    await AsyncStorage.setItem("app:initialized", "true")
    console.log("App initialized successfully")
  } catch (error) {
    console.error("App initialization error:", error)
  }
}

const createSampleUsers = async () => {
  const sampleUsers = [
    {
      id: "user_1",
      username: "john_doe",
      password: "password123",
      role: "household",
      name: "John Doe",
      email: "john@example.com",
      phone: "+91 9876543210",
      address: "123 Green Street",
      city: "Chennai",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user_2",
      username: "jane_smith",
      password: "password123",
      role: "household",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+91 9876543211",
      address: "456 Eco Avenue",
      city: "Chennai",
      createdAt: new Date().toISOString(),
    },
  ]

  for (const user of sampleUsers) {
    await AsyncStorage.setItem(`users:${user.username}`, JSON.stringify(user))
  }
}

const createSampleBins = async () => {
  const sampleBins = [
    {
      binId: "BIN-001",
      userBinOwner: "user_1",
      location: {
        latitude: 13.0827,
        longitude: 80.2707,
        street: "123 Green Street",
        city: "Chennai",
      },
      binCapacityKg: 30,
      sensors: {
        organic: { levelPct: 45, weightKg: 3.375 },
        plastic: { levelPct: 30, weightKg: 2.25 },
        hazardous: { levelPct: 10, weightKg: 0.75 },
        others: { levelPct: 25, weightKg: 1.875 },
      },
      power: {
        lastReadWattHour: 12.5,
        batteryPct: 85,
      },
      lastUpdated: new Date().toISOString(),
      isSegregationError: false,
    },
    {
      binId: "BIN-002",
      userBinOwner: "user_2",
      location: {
        latitude: 13.0847,
        longitude: 80.2727,
        street: "456 Eco Avenue",
        city: "Chennai",
      },
      binCapacityKg: 30,
      sensors: {
        organic: { levelPct: 60, weightKg: 4.5 },
        plastic: { levelPct: 40, weightKg: 3.0 },
        hazardous: { levelPct: 5, weightKg: 0.375 },
        others: { levelPct: 35, weightKg: 2.625 },
      },
      power: {
        lastReadWattHour: 15.2,
        batteryPct: 92,
      },
      lastUpdated: new Date().toISOString(),
      isSegregationError: false,
    },
  ]

  for (const bin of sampleBins) {
    await AsyncStorage.setItem(`bin:${bin.binId}`, JSON.stringify(bin))
  }
}

const createSampleCollectors = async () => {
  const sampleCollectors = [
    {
      id: "collector_1",
      username: "collector_raj",
      password: "password123",
      role: "collector",
      name: "Raj Kumar",
      email: "raj@collector.com",
      phone: "+91 9876543220",
      employeeId: "EMP001",
      assignedStreets: ["Green Street", "Eco Avenue"],
      vehicleNumber: "TN01AB1234",
      createdAt: new Date().toISOString(),
    },
  ]

  for (const collector of sampleCollectors) {
    await AsyncStorage.setItem(`collectors:${collector.username}`, JSON.stringify(collector))
  }
}

const createSampleMunicipalities = async () => {
  const sampleMunicipalities = [
    {
      id: "municipality_1",
      username: "chennai_admin",
      password: "password123",
      role: "municipality",
      name: "Chennai Municipality",
      email: "admin@chennai.gov.in",
      phone: "+91 9876543230",
      area: "Chennai Central",
      managedStreets: ["Green Street", "Eco Avenue", "Clean Road"],
      createdAt: new Date().toISOString(),
    },
  ]

  for (const municipality of sampleMunicipalities) {
    await AsyncStorage.setItem(`municipalities:${municipality.username}`, JSON.stringify(municipality))
  }
}

const createSampleRecyclers = async () => {
  const sampleRecyclers = [
    {
      id: "recycler_1",
      username: "green_recycling",
      password: "password123",
      role: "recycler",
      name: "Green Recycling Co.",
      email: "contact@greenrecycling.com",
      phone: "+91 9876543240",
      companyRegistration: "GRC2023001",
      specialization: ["plastic", "organic"],
      ratePerKg: {
        organic: 5,
        plastic: 15,
        hazardous: 25,
        others: 8,
      },
      createdAt: new Date().toISOString(),
    },
  ]

  for (const recycler of sampleRecyclers) {
    await AsyncStorage.setItem(`recyclers:${recycler.username}`, JSON.stringify(recycler))
  }
}
