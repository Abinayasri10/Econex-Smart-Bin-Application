"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

const translations = {
  en: {
    // Common
    welcome: "Welcome to EcoNex",
    login: "Login",
    register: "Register",
    logout: "Logout",
    dashboard: "Dashboard",
    profile: "Profile",
    settings: "Settings",

    // Roles
    household: "Household User",
    collector: "Waste Collector",
    municipality: "Municipality Manager",
    recycler: "Recycling Company",
    admin: "System Administrator",

    // Waste Categories
    organic: "Organic",
    plastic: "Plastic",
    hazardous: "Hazardous",
    others: "Others",

    // Actions
    collect: "Collect",
    request: "Request Collection",
    scan: "Scan QR Code",
    analytics: "Analytics",
    revenue: "Revenue",

    // Status
    pending: "Pending",
    completed: "Completed",
    critical: "Critical",
    warning: "Warning",
    normal: "Normal",
  },
  ta: {
    // Common
    welcome: "EcoNex-க்கு வரவேற்கிறோம்",
    login: "உள்நுழைய",
    register: "பதிவு செய்ய",
    logout: "வெளியேறு",
    dashboard: "டாஷ்போர்டு",
    profile: "சுயவிவரம்",
    settings: "அமைப்புகள்",

    // Roles
    household: "வீட்டு பயனர்",
    collector: "கழிவு சேகரிப்பாளர்",
    municipality: "நகராட்சி மேலாளர்",
    recycler: "மறுசுழற்சி நிறுவனம்",
    admin: "கணினி நிர்வாகி",

    // Waste Categories
    organic: "கரிம",
    plastic: "பிளாஸ்டிக்",
    hazardous: "ஆபத்தான",
    others: "மற்றவை",

    // Actions
    collect: "சேகரி",
    request: "சேகரிப்பு கோரிக்கை",
    scan: "QR குறியீட்டை ஸ்கேன் செய்",
    analytics: "பகுப்பாய்வு",
    revenue: "வருமானம்",

    // Status
    pending: "நிலுவையில்",
    completed: "முடிந்தது",
    critical: "முக்கியமான",
    warning: "எச்சரிக்கை",
    normal: "சாதாரண",
  },
  hi: {
    // Common
    welcome: "EcoNex में आपका स्वागत है",
    login: "लॉगिन",
    register: "रजिस्टर",
    logout: "लॉगआउट",
    dashboard: "डैशबोर्ड",
    profile: "प्रोफाइल",
    settings: "सेटिंग्स",

    // Roles
    household: "घरेलू उपयोगकर्ता",
    collector: "कचरा संग्रहकर्ता",
    municipality: "नगरपालिका प्रबंधक",
    recycler: "रीसाइक्लिंग कंपनी",
    admin: "सिस्टम एडमिनिस्ट्रेटर",

    // Waste Categories
    organic: "जैविक",
    plastic: "प्लास्टिक",
    hazardous: "खतरनाक",
    others: "अन्य",

    // Actions
    collect: "संग्रह",
    request: "संग्रह अनुरोध",
    scan: "QR कोड स्कैन करें",
    analytics: "विश्लेषण",
    revenue: "राजस्व",

    // Status
    pending: "लंबित",
    completed: "पूर्ण",
    critical: "महत्वपूर्ण",
    warning: "चेतावनी",
    normal: "सामान्य",
  },
  od: {
    // Common - Odia translations
    welcome: "EcoNex କୁ ସ୍ୱାଗତମ",
    login: "ଲଗଇନ୍",
    register: "ରେଜିଷ୍ଟର",
    logout: "ଲଗଆଉଟ୍",
    dashboard: "ଡ୍ୟାସବୋର୍ଡ",
    profile: "ପ୍ରୋଫାଇଲ୍",
    settings: "ସେଟିଂସ୍",

    // Roles
    household: "ଘର ଉପଭୋଗକାରୀ",
    collector: "ଆବର୍ଜନା ସଂଗ୍ରହକାରୀ",
    municipality: "ପୌରସଭା ପରିଚାଳକ",
    recycler: "ପୁନର୍ବାବହାର କମ୍ପାନୀ",
    admin: "ସିଷ୍ଟମ୍ ପ୍ରଶାସକ",

    // Waste Categories
    organic: "ଜୈବିକ",
    plastic: "ପ୍ଲାଷ୍ଟିକ୍",
    hazardous: "ବିପଜ୍ଜନକ",
    others: "ଅନ୍ୟାନ୍ୟ",

    // Actions
    collect: "ସଂଗ୍ରହ",
    request: "ସଂଗ୍ରହ ଅନୁରୋଧ",
    scan: "QR କୋଡ୍ ସ୍କ୍ୟାନ୍ କରନ୍ତୁ",
    analytics: "ବିଶ୍ଳେଷଣ",
    revenue: "ରାଜସ୍ୱ",

    // Status
    pending: "ବିଚାରାଧୀନ",
    completed: "ସମ୍ପୂର୍ଣ୍ଣ",
    critical: "ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ",
    warning: "ସତର୍କତା",
    normal: "ସାଧାରଣ",
  },
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en")

  useEffect(() => {
    loadLanguage()
  }, [])

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("app:language")
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
      }
    } catch (error) {
      console.error("Language loading error:", error)
    }
  }

  const changeLanguage = async (language) => {
    try {
      setCurrentLanguage(language)
      await AsyncStorage.setItem("app:language", language)
    } catch (error) {
      console.error("Language saving error:", error)
    }
  }

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key
  }

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: [
      { code: "en", name: "English", nativeName: "English" },
      { code: "hi", name: "हिंदी", nativeName: "Hindi" },
      { code: "ta", name: "தமிழ்", nativeName: "Tamil" },
      { code: "od", name: "ଓଡ଼ିଆ", nativeName: "Odia" },
    ],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}