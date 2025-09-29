"use client"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Animatable from "react-native-animatable"
import { useLanguage } from "../context/LanguageContext"

const { width, height } = Dimensions.get("window")

const RoleSelectionScreen = ({ navigation }) => {
  const { t } = useLanguage()

  const roles = [
    {
      key: "household",
      title: t("household") || "Household",
      description: "Manage your smart bins and track waste contribution",
      icon: "🏠",
      gradient: ["#059212", "#06D001", "#9BEC00"],
      bgIcon: "🌱",
      shadowColor: "#059212",
    },
    {
      key: "collector",
      title: t("collector") || "Collector",
      description: "Collect waste and manage collection routes efficiently",
      icon: "🚛",
      gradient: ["#06D001", "#9BEC00", "#B8FF3C"],
      bgIcon: "🛣️",
      shadowColor: "#06D001",
    },
    {
      key: "municipality",
      title: t("municipality") || "Municipality",
      description: "Oversee waste management operations citywide",
      icon: "🏛️",
      gradient: ["#3B82F6", "#60A5FA", "#93C5FD"],
      bgIcon: "🏢",
      shadowColor: "#3B82F6",
    },
    {
      key: "recycler",
      title: t("recycler") || "Recycler",
      description: "Process collected materials and manage payments",
      icon: "♻️",
      gradient: ["#10B981", "#34D399", "#6EE7B7"],
      bgIcon: "🔄",
      shadowColor: "#10B981",
    },
    {
      key: "admin",
      title: t("admin") || "Admin",
      description: "System administration and comprehensive oversight",
      icon: "⚙️",
      gradient: ["#8B5CF6", "#A78BFA", "#C4B5FD"],
      bgIcon: "🛡️",
      shadowColor: "#8B5CF6",
    },
  ]

  const handleRoleSelect = (role) => {
    navigation.navigate("Login", { role: role.key })
  }

  const FloatingParticle = ({ delay, size, color, top, left }) => (
    <Animatable.View
      animation="pulse"
      iterationCount="infinite"
      duration={3000 + delay * 200}
      delay={delay * 300}
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          top: top,
          left: left,
        },
      ]}
    />
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Background with particles */}
      <LinearGradient
        colors={["#FFFFFF", "#F8FFFE", "#F0FFF4"]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating Background Particles */}
        <FloatingParticle delay={0} size={25} color="rgba(5, 146, 18, 0.08)" top={80} left={30} />
        <FloatingParticle delay={1} size={35} color="rgba(6, 208, 1, 0.06)" top={150} left={width - 60} />
        <FloatingParticle delay={2} size={20} color="rgba(155, 236, 0, 0.1)" top={300} left={50} />
        <FloatingParticle delay={3} size={30} color="rgba(16, 185, 129, 0.07)" top={450} left={width - 80} />
        <FloatingParticle delay={4} size={28} color="rgba(139, 92, 246, 0.08)" top={600} left={40} />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animatable.View animation="fadeInDown" duration={1200} style={styles.headerContainer}>
            <Animatable.View
              animation="bounceIn"
              duration={1500}
              style={styles.logoContainer}
            >
              <LinearGradient
                colors={["#059212", "#06D001", "#9BEC00"]}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animatable.Text 
                  animation="pulse" 
                  iterationCount="infinite" 
                  duration={2000}
                  style={styles.logoIcon}
                >
                  🌍
                </Animatable.Text>
              </LinearGradient>
            </Animatable.View>
            
            <Animatable.Text 
              animation="slideInLeft"
              duration={1000}
              delay={600}
              style={styles.title}
            >
              Choose Your Role
            </Animatable.Text>
            
            <Animatable.Text 
              animation="slideInRight"
              duration={1000}
              delay={800}
              style={styles.subtitle}
            >
              Select your role to access your personalized EcoNex dashboard
            </Animatable.Text>
            
            {/* Decorative floating icons */}
            <Animatable.View 
              animation="fadeIn"
              duration={1000}
              delay={1000}
              style={styles.decorativeContainer}
            >
              <Animatable.View 
                animation="bounce" 
                iterationCount="infinite" 
                duration={3000}
                style={[styles.floatingIcon, { left: 20 }]}
              >
                <Text style={styles.floatingIconText}>♻️</Text>
              </Animatable.View>
              <Animatable.View 
                animation="bounce" 
                iterationCount="infinite" 
                duration={3000}
                delay={1500}
                style={[styles.floatingIcon, { right: 20 }]}
              >
                <Text style={styles.floatingIconText}>🌱</Text>
              </Animatable.View>
            </Animatable.View>
          </Animatable.View>

          {/* Roles Grid */}
          <View style={styles.rolesGrid}>
            {roles.map((role, index) => (
              <Animatable.View 
                key={role.key} 
                animation="fadeInUp" 
                duration={800} 
                delay={1200 + index * 150}
                style={styles.roleCardContainer}
              >
                <TouchableOpacity 
                  style={styles.roleCard} 
                  onPress={() => handleRoleSelect(role)}
                  activeOpacity={0.85}
                >
                  {/* Card Shadow Effect */}
                  <View style={[styles.cardShadow, { shadowColor: role.shadowColor }]} />
                  
                  <LinearGradient 
                    colors={role.gradient} 
                    style={styles.roleGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {/* Background Decoration */}
                    <View style={styles.backgroundDecoration}>
                      <Text style={styles.backgroundIcon}>{role.bgIcon}</Text>
                    </View>
                    
                    {/* Animated Background Circles */}
                    <Animatable.View 
                      animation="pulse"
                      iterationCount="infinite"
                      duration={4000}
                      delay={index * 500}
                      style={styles.backgroundCircle1}
                    />
                    <Animatable.View 
                      animation="pulse"
                      iterationCount="infinite"
                      duration={3000}
                      delay={index * 300}
                      style={styles.backgroundCircle2}
                    />
                    
                    {/* Card Content */}
                    <View style={styles.roleContent}>
                      <View style={styles.roleHeader}>
                        <Animatable.View 
                          animation="zoomIn"
                          duration={800}
                          delay={1200 + index * 150 + 300}
                          style={styles.iconContainer}
                        >
                          <Text style={styles.roleIcon}>{role.icon}</Text>
                        </Animatable.View>
                        
                        <Animatable.View 
                          animation="slideInRight" 
                          duration={600}
                          delay={1200 + index * 150 + 500}
                          style={styles.arrowContainer}
                        >
                          <Text style={styles.arrow}>→</Text>
                        </Animatable.View>
                      </View>
                      
                      <View style={styles.roleTextContainer}>
                        <Animatable.Text 
                          animation="fadeIn"
                          duration={800}
                          delay={1200 + index * 150 + 400}
                          style={styles.roleTitle}
                        >
                          {role.title}
                        </Animatable.Text>
                        <Animatable.Text 
                          animation="fadeIn"
                          duration={800}
                          delay={1200 + index * 150 + 600}
                          style={styles.roleDescription}
                        >
                          {role.description}
                        </Animatable.Text>
                      </View>
                      
                      {/* Shine Effect */}
                      <Animatable.View 
                        animation="flash"
                        iterationCount="infinite"
                        duration={5000}
                        delay={index * 1000}
                        style={styles.shineEffect} 
                      />
                    </View>
                  </LinearGradient>
                  
                  {/* Card Border */}
                  <View style={styles.cardBorder} />
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>

          {/* Footer */}
          <Animatable.View 
            animation="fadeIn" 
            duration={1000} 
            delay={2500}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              Powered by EcoNex Technology
            </Text>
            <View style={styles.footerIcons}>
              <Animatable.Text 
                animation="bounce"
                iterationCount="infinite"
                duration={2000}
                delay={3000}
                style={styles.footerIcon}
              >
                🌍
              </Animatable.Text>
              <Animatable.Text 
                animation="bounce"
                iterationCount="infinite"
                duration={2000}
                delay={3200}
                style={styles.footerIcon}
              >
                ♻️
              </Animatable.Text>
              <Animatable.Text 
                animation="bounce"
                iterationCount="infinite"
                duration={2000}
                delay={3400}
                style={styles.footerIcon}
              >
                🌱
              </Animatable.Text>
            </View>
            
          </Animatable.View>
        </ScrollView>
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
    opacity: 0.8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 50,
    position: "relative",
  },
  logoContainer: {
    marginBottom: 30,
    shadowColor: "#059212",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  logoIcon: {
    fontSize: 50,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: "rgba(31, 41, 55, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 17,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 20,
    fontWeight: "400",
    letterSpacing: 0.3,
  },
  decorativeContainer: {
    position: "absolute",
    top: -20,
    left: 0,
    right: 0,
    height: 200,
  },
  floatingIcon: {
    position: "absolute",
    top: 60,
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingIconText: {
    fontSize: 28,
    opacity: 0.6,
  },
  rolesGrid: {
    gap: 20,
  },
  roleCardContainer: {
    marginHorizontal: 4,
  },
  roleCard: {
    borderRadius: 25,
    overflow: "hidden",
    position: "relative",
  },
  cardShadow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  roleGradient: {
    minHeight: 140,
    position: "relative",
    overflow: "hidden",
  },
  backgroundDecoration: {
    position: "absolute",
    right: -15,
    top: -15,
    opacity: 0.08,
    zIndex: 1,
  },
  backgroundIcon: {
    fontSize: 100,
    color: "#FFFFFF",
  },
  backgroundCircle1: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -20,
    right: 20,
    zIndex: 1,
  },
  backgroundCircle2: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: -10,
    left: 10,
    zIndex: 1,
  },
  roleContent: {
    padding: 24,
    position: "relative",
    zIndex: 3,
  },
  roleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "rgba(0,0,0,0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  roleIcon: {
    fontSize: 28,
  },
  arrowContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  arrow: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "800",
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  roleDescription: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.95)",
    lineHeight: 22,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontWeight: "400",
  },
  shineEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  cardBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    pointerEvents: "none",
  },
  footer: {
    alignItems: "center",
    marginTop: 50,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: "rgba(107, 114, 128, 0.15)",
  },
  footerText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  footerIcons: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  footerIcon: {
    fontSize: 22,
    opacity: 0.7,
  },
  versionBadge: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  versionText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
})

export default RoleSelectionScreen