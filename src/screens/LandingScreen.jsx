"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Animatable from "react-native-animatable"
import * as Speech from "expo-speech"
import { useLanguage } from "../context/LanguageContext"

const { width, height } = Dimensions.get("window")

// Using only built-in animations to avoid errors

const LandingScreen = ({ navigation }) => {
  const { t, changeLanguage, availableLanguages, currentLanguage } = useLanguage()
  const [isReady, setIsReady] = useState(false)

  // Enhanced language list including Odia
  const enhancedLanguages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "हिंदी", nativeName: "Hindi" },
    { code: "ta", name: "தமிழ்", nativeName: "Tamil" },
    { code: "od", name: "ଓଡ଼ିଆ", nativeName: "Odia" }, // Added Odia
  ]

  useEffect(() => {
    // Welcome voice message with enhanced language support
    const welcomeMessage = t("welcome")
    const languageMap = {
      ta: "ta-IN",
      hi: "hi-IN",
      od: "or-IN", // Odia language code for speech
      en: "en-US",
    }
    
    Speech.speak(welcomeMessage, {
      language: languageMap[currentLanguage] || "en-US",
      pitch: 1.0,
      rate: 0.8,
    })

    // Set ready state for staggered animations
    setTimeout(() => setIsReady(true), 300)
  }, [currentLanguage])

  const handleGetStarted = () => {
    navigation.navigate("RoleSelection")
  }

  const FloatingParticle = ({ delay, size, color }) => (
    <Animatable.View
      animation="pulse"
      iterationCount="infinite"
      duration={3000 + delay * 100}
      delay={delay * 200}
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          left: Math.random() * (width - size),
          top: Math.random() * (height - size),
        },
      ]}
    />
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Animated Background */}
      <LinearGradient
        colors={["#FFFFFF", "#F8FFFE", "#F0FFF4"]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating Particles */}
        {[...Array(6)].map((_, index) => (
          <FloatingParticle
            key={index}
            delay={index}
            size={20 + Math.random() * 30}
            color={`rgba(5, 146, 18, ${0.1 + Math.random() * 0.2})`}
          />
        ))}

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo Section with Enhanced Animations */}
          <Animatable.View
           
            
            style={styles.logoContainer}
          >
            <Animatable.View
              
             
              style={styles.logoWrapper}
            >
              <LinearGradient
                colors={["#059212", "#06D001", "#9BEC00"]}
                style={styles.logoCircle}
                
              >
                <Animatable.Text
                  animation="zoomIn"
                  duration={0}
                  delay={0}
                  style={styles.logoText}
                >
                  🌱
                </Animatable.Text>
              </LinearGradient>
            </Animatable.View>
            
            <Animatable.Text
              animation="slideInLeft"
              duration={0}
              delay={0}
              style={styles.appName}
            >
              EcoNex
            </Animatable.Text>
            
            <Animatable.Text
              animation="slideInRight"
              duration={1000}
              delay={1000}
              style={styles.tagline}
            >
              Smart Bin Management
            </Animatable.Text>
          </Animatable.View>

          {/* Welcome Section */}
          <Animatable.View
            animation="fadeInUp"
            duration={1000}
            delay={1200}
            style={styles.welcomeContainer}
          >
            <Text style={styles.welcomeText}>{t("welcome")}</Text>
            <Animatable.Text
              animation="fadeIn"
              duration={1500}
              delay={1500}
              style={styles.descriptionText}
            >
             
            </Animatable.Text>
          </Animatable.View>

          {/* Enhanced Get Started Button */}
          <Animatable.View
            animation="zoomIn"
            duration={0}
            delay={0}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#059212", "#06D001", "#9BEC00"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Animatable.Text
                  animation="pulse"
                  iterationCount="infinite"
                  duration={1500}
                  style={styles.getStartedText}
                >
                  Get Started →
                </Animatable.Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          {/* Enhanced Language Selection */}
          <Animatable.View
            animation="fadeInUp"
            duration={1000}
            delay={2000}
            style={styles.languageContainer}
          >
            <Text style={styles.languageLabel}>
              Choose Language / भाषा चुनें / மொழியைத் தேர்ந்தெடுக்கவும் / ଭାଷା ବାଛନ୍ତୁ
            </Text>
            
            <View style={styles.languageGrid}>
              {enhancedLanguages.map((lang, index) => (
                <Animatable.View
                  key={lang.code}
                  animation="bounceIn"
                  delay={2200 + index * 150}
                  duration={600}
                >
                  <TouchableOpacity
                    style={[
                      styles.languageButton,
                      currentLanguage === lang.code && styles.activeLanguageButton
                    ]}
                    onPress={() => changeLanguage(lang.code)}
                    activeOpacity={0.7}
                  >
                    {currentLanguage === lang.code && (
                      <LinearGradient
                        colors={["#059212", "#06D001"]}
                        style={styles.activeButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.activeLanguageButtonText}>
                          {lang.name}
                        </Text>
                      </LinearGradient>
                    )}
                    {currentLanguage !== lang.code && (
                      <Text style={styles.languageButtonText}>
                        {lang.name}
                      </Text>
                    )}
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </View>
          </Animatable.View>

          {/* Footer with Animation */}
          <Animatable.View
            animation="fadeIn"
            duration={1000}
            delay={2800}
            style={styles.footer}
          >
          
          </Animatable.View>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundGradient: {
    flex: 1,
    position: "relative",
  },
  particle: {
    position: "absolute",
    borderRadius: 50,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
    marginTop: 25, 
  },
  logoWrapper: {
    shadowColor: "#059212",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
  },
  logoText: {
    fontSize: 70,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  appName: {
    fontSize: 42,
    fontWeight: "800",
    color: "#059212",
    marginBottom: 12,
    textShadowColor: "rgba(5, 146, 18, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 18,
    color: "#666666",
    fontWeight: "600",
    letterSpacing: 1,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 70,
      marginBottom: 13,
    paddingHorizontal: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 17,
    color: "#666666",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 15,
    fontWeight: "400",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  getStartedButton: {
    borderRadius: 30,
    shadowColor: "#059212",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
  },
  getStartedText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  languageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  languageLabel: {
    fontSize: 13,
    color: "#888888",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
  },
  languageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    maxWidth: width * 0.9,
  },
  languageButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    minWidth: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeLanguageButton: {
    borderColor: "transparent",
    shadowColor: "#059212",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 80,
    alignItems: "center",
    marginVertical: -12,
    marginHorizontal: -20,
  },
  languageButtonText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "600",
  },
  activeLanguageButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: "#AAAAAA",
    marginBottom: 10,
    fontWeight: "400",
  },
  versionBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  versionText: {
    fontSize: 11,
    color: "#888888",
    fontWeight: "600",
  },
})

export default LandingScreen