"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Animatable from "react-native-animatable"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataContext"
import { useLanguage } from "../../context/LanguageContext"

const BinLevelIndicator = ({ category, level, weight, color }) => (
  <View style={styles.binContainer}>
    <View style={styles.binHeader}>
      <Text style={styles.categoryText}>{category}</Text>
      <Text style={styles.levelText}>{level.toFixed(1)}%</Text>
    </View>
    
    <View style={styles.binWrapper}>
      <View style={styles.binOutline}>
        <View style={styles.binBody}>
          <View 
            style={[
              styles.binFill, 
              { 
                height: `${level}%`, 
                backgroundColor: color,
              }
            ]} 
          />
        </View>
        <View style={styles.binLid} />
      </View>
    </View>
    
    <Text style={styles.weightText}>{weight.toFixed(1)} kg</Text>
  </View>
)

const HouseholdDashboard = ({ navigation }) => {
  const { user, logout } = useAuth()
  const { bins, getBinsByUser, requestCollection, getPayoutEventsByBin, loadData } = useData()
  const { t } = useLanguage()
  const [refreshing, setRefreshing] = useState(false)
  const [userBin, setUserBin] = useState(null)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    loadUserData()
  }, [bins, user])

  const loadUserData = () => {
    if (user) {
      const userBins = getBinsByUser(user.userId)
      if (userBins.length > 0) {
        setUserBin(userBins[0])
        const payouts = getPayoutEventsByBin(userBins[0].binId)
        const total = payouts.reduce((sum, payout) => sum + payout.userShare, 0)
        setTotalEarnings(total)
      }
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleRequestCollection = async (category = "all", urgent = false) => {
    if (!userBin) return
    const result = await requestCollection(userBin.binId, category, urgent)
    if (result.success) {
      Alert.alert(
        "Collection Requested",
        `${urgent ? "Urgent" : "Regular"} collection request has been sent for ${category === "all" ? "all categories" : category}.`,
      )
    } else {
      Alert.alert("Error", result.error)
    }
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout()
          navigation.reset({
            index: 0,
            routes: [{ name: "Landing" }],
          })
        },
      },
    ])
  }

  const getOverallLevel = () => {
    if (!userBin) return 0
    const levels = Object.values(userBin.sensors)
    return levels.reduce((sum, sensor) => sum + sensor.levelPct, 0) / levels.length
  }

  const getOverallStatus = () => {
    const level = getOverallLevel()
    if (level >= 90) return { text: "Critical", color: "#FF4444" }
    if (level >= 75) return { text: "Warning", color: "#FFA500" }
    return { text: "Normal", color: "#059212" }
  }

  const renderDashboard = () => {
    if (!userBin) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your bin data...</Text>
        </View>
      )
    }

    const status = getOverallStatus()

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Bin Overview Card */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.binId}>Bin ID: {userBin.binId}</Text>
              <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                <Text style={styles.statusText}>{status.text}</Text>
              </View>
            </View>

            <View style={styles.overviewStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getOverallLevel().toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Overall Level</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>₹{totalEarnings.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Total Earnings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userBin.power.batteryPct.toFixed(0)}%</Text>
                <Text style={styles.statLabel}>Battery</Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        {/* Waste Categories */}
        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <Text style={styles.sectionTitle}>Waste Categories</Text>
          <View style={styles.categoriesContainer}>
            <BinLevelIndicator
              category="Organic"
              level={userBin.sensors.organic.levelPct}
              weight={userBin.sensors.organic.weightKg}
              color="#059212"
            />
            <BinLevelIndicator
              category="Plastic"
              level={userBin.sensors.plastic.levelPct}
              weight={userBin.sensors.plastic.weightKg}
              color="#06D001"
            />
            <BinLevelIndicator
              category="Hazardous"
              level={userBin.sensors.hazardous.levelPct}
              weight={userBin.sensors.hazardous.weightKg}
              color="#FF4444"
            />
            <BinLevelIndicator
              category="Others"
              level={userBin.sensors.others.levelPct}
              weight={userBin.sensors.others.weightKg}
              color="#9BEC00"
            />
          </View>
        </Animatable.View>

        {/* Quick Actions */}
        <Animatable.View animation="fadeInUp" duration={800} delay={600}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleRequestCollection("all", false)}>
              <LinearGradient colors={["#059212", "#06D001"]} style={styles.actionGradient}>
                <Text style={styles.actionIcon}>🗑️</Text>
                <Text style={styles.actionText}>Request Collection</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => handleRequestCollection("all", true)}>
              <LinearGradient colors={["#FF4444", "#FF6666"]} style={styles.actionGradient}>
                <Text style={styles.actionIcon}>🚨</Text>
                <Text style={styles.actionText}>Urgent Collection</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => handleRequestCollection("organic", false)}>
              <LinearGradient colors={["#9BEC00", "#B8FF00"]} style={styles.actionGradient}>
                <Text style={styles.actionIcon}>🌱</Text>
                <Text style={styles.actionText}>Compost Collection</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Environmental Impact */}
        <Animatable.View animation="fadeInUp" duration={800} delay={800}>
          <Text style={styles.sectionTitle}>Environmental Impact</Text>
          <View style={styles.impactCard}>
            <View style={styles.impactItem}>
              <Text style={styles.impactIcon}>🌍</Text>
              <View style={styles.impactContent}>
                <Text style={styles.impactValue}>12.5 kg</Text>
                <Text style={styles.impactLabel}>CO₂ Saved This Month</Text>
              </View>
            </View>

            <View style={styles.impactItem}>
              <Text style={styles.impactIcon}>♻️</Text>
              <View style={styles.impactContent}>
                <Text style={styles.impactValue}>45.2 kg</Text>
                <Text style={styles.impactLabel}>Total Waste Recycled</Text>
              </View>
            </View>

            <View style={styles.impactItem}>
              <Text style={styles.impactIcon}>🏆</Text>
              <View style={styles.impactContent}>
                <Text style={styles.impactValue}>Eco Champion</Text>
                <Text style={styles.impactLabel}>Your Current Rank</Text>
              </View>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
    )
  }

  const renderCollectionManagement = () => {
    // Mock collection data for different dates
    const collectionHistory = {
      '2025-09-25': [
        { category: 'Organic', weight: 2.5, time: '09:30 AM', collector: 'John Smith' },
        { category: 'Plastic', weight: 1.2, time: '09:35 AM', collector: 'John Smith' }
      ],
      '2025-09-22': [
        { category: 'Organic', weight: 3.1, time: '10:15 AM', collector: 'Sarah Johnson' },
        { category: 'Others', weight: 0.8, time: '10:20 AM', collector: 'Sarah Johnson' }
      ],
      '2025-09-20': [
        { category: 'Hazardous', weight: 0.5, time: '02:45 PM', collector: 'Mike Wilson' },
        { category: 'Plastic', weight: 1.8, time: '02:47 PM', collector: 'Mike Wilson' }
      ],
      '2025-09-18': [
        { category: 'Organic', weight: 2.8, time: '08:20 AM', collector: 'Emma Davis' }
      ]
    }

    const formatDateKey = (date) => {
      return date.toISOString().split('T')[0]
    }

    const getSelectedDateHistory = () => {
      const dateKey = formatDateKey(selectedDate)
      return collectionHistory[dateKey] || []
    }

    const getCategoryColor = (category) => {
      switch (category) {
        case 'Organic': return '#059212'
        case 'Plastic': return '#06D001'
        case 'Hazardous': return '#FF4444'
        case 'Others': return '#9BEC00'
        default: return '#666666'
      }
    }

    const getCategoryIcon = (category) => {
      switch (category) {
        case 'Organic': return '🌱'
        case 'Plastic': return '♻️'
        case 'Hazardous': return '⚠️'
        case 'Others': return '🗑️'
        default: return '📦'
      }
    }

    const renderCalendar = () => {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const firstDay = new Date(year, month, 1).getDay()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
      
      const days = []
      
      // Empty cells for days before month starts
      for (let i = 0; i < firstDay; i++) {
        days.push(<View key={`empty-${i}`} style={styles.calendarDay} />)
      }
      
      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dateKey = formatDateKey(date)
        const hasCollection = collectionHistory[dateKey]
        const isSelected = selectedDate.toDateString() === date.toDateString()
        const isToday = new Date().toDateString() === date.toDateString()
        
        days.push(
          <TouchableOpacity
            key={day}
            style={[
              styles.calendarDay,
              hasCollection && styles.calendarDayWithCollection,
              isSelected && styles.calendarDaySelected,
              isToday && styles.calendarDayToday
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text style={[
              styles.calendarDayText,
              hasCollection && styles.calendarDayTextWithCollection,
              isSelected && styles.calendarDayTextSelected,
              isToday && styles.calendarDayTextToday
            ]}>
              {day}
            </Text>
            {hasCollection && <View style={styles.collectionIndicator} />}
          </TouchableOpacity>
        )
      }
      
      return (
        <View style={styles.calendar}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              onPress={() => setCurrentMonth(new Date(year, month - 1))}
              style={styles.calendarNavButton}
            >
              <Text style={styles.calendarNavText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calendarHeaderText}>
              {monthNames[month]} {year}
            </Text>
            <TouchableOpacity 
              onPress={() => setCurrentMonth(new Date(year, month + 1))}
              style={styles.calendarNavButton}
            >
              <Text style={styles.calendarNavText}>›</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.calendarWeekHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.calendarWeekText}>{day}</Text>
            ))}
          </View>
          
          <View style={styles.calendarGrid}>
            {days}
          </View>
        </View>
      )
    }

    const selectedHistory = getSelectedDateHistory()

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animatable.View animation="fadeInDown" duration={800}>
          <Text style={styles.pageTitle}>Collection Calendar</Text>
          <Text style={styles.pageSubtitle}>Track your waste collection history</Text>
        </Animatable.View>
        
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>📅 Collection Calendar</Text>
            <Text style={styles.featureDescription}>Select a date to view collection details</Text>
            {renderCalendar()}
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <View style={styles.featureCard}>
            <View style={styles.selectedDateHeader}>
              <Text style={styles.featureTitle}>
                📋 Collections for {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            
            {selectedHistory.length > 0 ? (
              <View style={styles.historyContainer}>
                {selectedHistory.map((item, index) => (
                  <Animatable.View 
                    key={index} 
                    animation="fadeInLeft" 
                    duration={600} 
                    delay={index * 100}
                  >
                    <View style={[styles.historyCard, { borderLeftColor: getCategoryColor(item.category) }]}>
                      <View style={styles.historyCardHeader}>
                        <View style={styles.categoryInfo}>
                          <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
                          <View>
                            <Text style={styles.historyCategory}>{item.category}</Text>
                            <Text style={styles.historyTime}>{item.time}</Text>
                          </View>
                        </View>
                        <View style={styles.weightInfo}>
                          <Text style={[styles.historyWeight, { color: getCategoryColor(item.category) }]}>
                            {item.weight} kg
                          </Text>
                        </View>
                      </View>
                      <View style={styles.collectorInfo}>
                        <Text style={styles.collectorLabel}>Collected by:</Text>
                        <Text style={styles.collectorName}>{item.collector}</Text>
                      </View>
                    </View>
                  </Animatable.View>
                ))}
                
                <View style={styles.daySummary}>
                  <LinearGradient colors={['#E8F5E8', '#F0FDF4']} style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Day Summary</Text>
                    <View style={styles.summaryStats}>
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>
                          {selectedHistory.reduce((sum, item) => sum + item.weight, 0).toFixed(1)} kg
                        </Text>
                        <Text style={styles.summaryLabel}>Total Weight</Text>
                      </View>
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{selectedHistory.length}</Text>
                        <Text style={styles.summaryLabel}>Collections</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataIcon}>📭</Text>
                <Text style={styles.noDataText}>No collections on this date</Text>
                <Text style={styles.noDataSubtext}>Select a date with a green dot to view collection history</Text>
              </View>
            )}
          </View>
        </Animatable.View>
      </ScrollView>
    )
  }

  const renderAnalytics = () => {
    // Mock data for charts
    const monthlyData = [
      { month: 'Jan', organic: 12.5, plastic: 8.2, hazardous: 2.1, others: 5.8 },
      { month: 'Feb', organic: 15.2, plastic: 9.8, hazardous: 1.9, others: 6.2 },
      { month: 'Mar', organic: 18.7, plastic: 11.3, hazardous: 2.5, others: 7.1 },
      { month: 'Apr', organic: 22.1, plastic: 13.6, hazardous: 2.8, others: 8.4 },
      { month: 'May', organic: 19.8, plastic: 12.1, hazardous: 2.3, others: 7.9 },
      { month: 'Jun', organic: 24.3, plastic: 15.2, hazardous: 3.1, others: 9.2 },
      { month: 'Jul', organic: 26.8, plastic: 16.9, hazardous: 3.4, others: 10.1 },
      { month: 'Aug', organic: 28.5, plastic: 18.2, hazardous: 3.7, others: 11.3 },
      { month: 'Sep', organic: 31.2, plastic: 19.8, hazardous: 4.1, others: 12.5 }
    ]

    const currentMonthData = monthlyData[monthlyData.length - 1]
    const totalWaste = currentMonthData.organic + currentMonthData.plastic + currentMonthData.hazardous + currentMonthData.others

    const pieData = [
      { category: 'Organic', value: currentMonthData.organic, color: '#059212', icon: '🌱' },
      { category: 'Plastic', value: currentMonthData.plastic, color: '#06D001', icon: '♻️' },
      { category: 'Hazardous', value: currentMonthData.hazardous, color: '#FF4444', icon: '⚠️' },
      { category: 'Others', value: currentMonthData.others, color: '#9BEC00', icon: '🗑️' }
    ]

    const powerData = [
      { day: 'Mon', usage: 0.8 },
      { day: 'Tue', usage: 0.7 },
      { day: 'Wed', usage: 0.9 },
      { day: 'Thu', usage: 0.6 },
      { day: 'Fri', usage: 0.8 },
      { day: 'Sat', usage: 0.5 },
      { day: 'Sun', usage: 0.4 }
    ]

    const renderBarChart = () => {
      const maxValue = Math.max(...monthlyData.map(item => 
        item.organic + item.plastic + item.hazardous + item.others
      ))

      return (
        <View style={styles.barChart}>
          <View style={styles.chartContainer}>
            {monthlyData.slice(-6).map((item, index) => {
              const totalHeight = item.organic + item.plastic + item.hazardous + item.others
              const heightPercent = (totalHeight / maxValue) * 100

              return (
                <View key={item.month} style={styles.barColumn}>
                  <View style={[styles.bar, { height: `${heightPercent}%` }]}>
                    <View style={[styles.barSegment, { 
                      backgroundColor: '#FF4444', 
                      flex: item.hazardous / totalHeight 
                    }]} />
                    <View style={[styles.barSegment, { 
                      backgroundColor: '#9BEC00', 
                      flex: item.others / totalHeight 
                    }]} />
                    <View style={[styles.barSegment, { 
                      backgroundColor: '#06D001', 
                      flex: item.plastic / totalHeight 
                    }]} />
                    <View style={[styles.barSegment, { 
                      backgroundColor: '#059212', 
                      flex: item.organic / totalHeight 
                    }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.month}</Text>
                  <Text style={styles.barValue}>{totalHeight.toFixed(1)}kg</Text>
                </View>
              )
            })}
          </View>
          
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#059212' }]} />
              <Text style={styles.legendText}>Organic</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#06D001' }]} />
              <Text style={styles.legendText}>Plastic</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#9BEC00' }]} />
              <Text style={styles.legendText}>Others</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF4444' }]} />
              <Text style={styles.legendText}>Hazardous</Text>
            </View>
          </View>
        </View>
      )
    }

    const renderPieChart = () => {
      let cumulativeAngle = 0

      return (
        <View style={styles.pieContainer}>
          <View style={styles.pieChart}>
            <View style={styles.pieBackground}>
              {pieData.map((item, index) => {
                const percentage = (item.value / totalWaste) * 100
                const angle = (item.value / totalWaste) * 360
                const rotation = cumulativeAngle
                cumulativeAngle += angle

                return (
                  <View
                    key={item.category}
                    style={[
                      styles.pieSlice,
                      {
                        backgroundColor: item.color,
                        transform: [
                          { rotate: `${rotation}deg` },
                        ]
                      }
                    ]}
                  />
                )
              })}
            </View>
            
            <View style={styles.pieCenter}>
              <Text style={styles.pieCenterText}>{totalWaste.toFixed(1)}</Text>
              <Text style={styles.pieCenterLabel}>kg Total</Text>
            </View>
          </View>

          <View style={styles.pieStats}>
            {pieData.map((item, index) => {
              const percentage = ((item.value / totalWaste) * 100).toFixed(1)
              return (
                <Animatable.View 
                  key={item.category} 
                  animation="fadeInRight" 
                  duration={600} 
                  delay={index * 150}
                  style={styles.pieStatItem}
                >
                  <View style={styles.pieStatHeader}>
                    <Text style={styles.pieStatIcon}>{item.icon}</Text>
                    <Text style={styles.pieStatCategory}>{item.category}</Text>
                  </View>
                  <View style={styles.pieStatValues}>
                    <Text style={[styles.pieStatValue, { color: item.color }]}>
                      {item.value.toFixed(1)} kg
                    </Text>
                    <Text style={styles.pieStatPercent}>{percentage}%</Text>
                  </View>
                </Animatable.View>
              )
            })}
          </View>
        </View>
      )
    }

    const renderPowerChart = () => {
      const maxPower = Math.max(...powerData.map(item => item.usage))

      return (
        <View style={styles.powerChart}>
          <View style={styles.powerBars}>
            {powerData.map((item, index) => {
              const heightPercent = (item.usage / maxPower) * 100

              return (
                <View key={item.day} style={styles.powerBarColumn}>
                  <LinearGradient
                    colors={['#059212', '#06D001']}
                    style={[styles.powerBar, { height: `${heightPercent}%` }]}
                  />
                  <Text style={styles.powerBarLabel}>{item.day}</Text>
                  <Text style={styles.powerBarValue}>{item.usage}kWh</Text>
                </View>
              )
            })}
          </View>
        </View>
      )
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animatable.View animation="fadeInDown" duration={800}>
          <Text style={styles.pageTitle}>Analytics Dashboard</Text>
          <Text style={styles.pageSubtitle}>Track your environmental impact</Text>
        </Animatable.View>
        
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>📊 Monthly Waste Contribution</Text>
            <Text style={styles.featureDescription}>6-month waste collection trends by category</Text>
            {renderBarChart()}
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🌱 Current Month Breakdown</Text>
            <Text style={styles.featureDescription}>September 2025 waste distribution</Text>
            {renderPieChart()}
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={800} delay={600}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🌍 Environmental Impact</Text>
            <View style={styles.impactGrid}>
              <View style={styles.impactStatCard}>
                <Text style={styles.impactStatIcon}>🌿</Text>
                <Text style={styles.impactStatValue}>142 kg</Text>
                <Text style={styles.impactStatLabel}>CO₂ Reduced</Text>
              </View>
              <View style={styles.impactStatCard}>
                <Text style={styles.impactStatIcon}>♻️</Text>
                <Text style={styles.impactStatValue}>89%</Text>
                <Text style={styles.impactStatLabel}>Recycling Rate</Text>
              </View>
              <View style={styles.impactStatCard}>
                <Text style={styles.impactStatIcon}>🌳</Text>
                <Text style={styles.impactStatValue}>12</Text>
                <Text style={styles.impactStatLabel}>Trees Saved</Text>
              </View>
              <View style={styles.impactStatCard}>
                <Text style={styles.impactStatIcon}>💧</Text>
                <Text style={styles.impactStatValue}>2.8k L</Text>
                <Text style={styles.impactStatLabel}>Water Saved</Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={800} delay={800}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>⚡ Weekly Power Usage</Text>
            <Text style={styles.featureDescription}>Smart bin energy consumption</Text>
            {renderPowerChart()}
            
            <View style={styles.powerSummary}>
              <View style={styles.powerSummaryItem}>
                <Text style={styles.powerSummaryValue}>4.7 kWh</Text>
                <Text style={styles.powerSummaryLabel}>This Week</Text>
              </View>
              <View style={styles.powerSummaryItem}>
                <Text style={styles.powerSummaryValue}>18.2 kWh</Text>
                <Text style={styles.powerSummaryLabel}>This Month</Text>
              </View>
              <View style={styles.powerSummaryItem}>
                <Text style={styles.powerSummaryValue}>-12%</Text>
                <Text style={styles.powerSummaryLabel}>vs Last Month</Text>
              </View>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
    )
  }

  const renderRevenue = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.pageTitle}>Revenue Tracking</Text>
      
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>💰 Earnings Overview</Text>
        <View style={styles.earningsStats}>
          <View style={styles.earningItem}>
            <Text style={styles.earningValue}>₹{totalEarnings.toFixed(2)}</Text>
            <Text style={styles.earningLabel}>Total Earnings</Text>
          </View>
          <View style={styles.earningItem}>
            <Text style={styles.earningValue}>₹125.50</Text>
            <Text style={styles.earningLabel}>This Month</Text>
          </View>
        </View>
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>📈 Payout History</Text>
        <View style={styles.payoutItem}>
          <Text style={styles.payoutDate}>20 Sep 2025</Text>
          <Text style={styles.payoutAmount}>₹45.20</Text>
        </View>
        <View style={styles.payoutItem}>
          <Text style={styles.payoutDate}>15 Sep 2025</Text>
          <Text style={styles.payoutAmount}>₹38.50</Text>
        </View>
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>🏦 Payment Settings</Text>
        <TouchableOpacity style={styles.paymentButton}>
          <Text style={styles.paymentText}>Update UPI Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.paymentButton}>
          <Text style={styles.paymentText}>Bank Account Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard()
      case 'collection': return renderCollectionManagement()
      case 'analytics': return renderAnalytics()
      case 'revenue': return renderRevenue()
      default: return renderDashboard()
    }
  }

  return (
    <View style={styles.container}>
      {renderContent()}
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'dashboard' && styles.activeNavItem]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.navIcon, activeTab === 'dashboard' && styles.activeNavIcon]}>🏠</Text>
          <Text style={[styles.navText, activeTab === 'dashboard' && styles.activeNavText]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'collection' && styles.activeNavItem]}
          onPress={() => setActiveTab('collection')}
        >
          <Text style={[styles.navIcon, activeTab === 'collection' && styles.activeNavIcon]}>🗑️</Text>
          <Text style={[styles.navText, activeTab === 'collection' && styles.activeNavText]}>Collection</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'analytics' && styles.activeNavItem]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.navIcon, activeTab === 'analytics' && styles.activeNavIcon]}>📊</Text>
          <Text style={[styles.navText, activeTab === 'analytics' && styles.activeNavText]}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'revenue' && styles.activeNavItem]}
          onPress={() => setActiveTab('revenue')}
        >
          <Text style={[styles.navIcon, activeTab === 'revenue' && styles.activeNavIcon]}>💰</Text>
          <Text style={[styles.navText, activeTab === 'revenue' && styles.activeNavText]}>Revenue</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666666",
    fontSize: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666666",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  logoutButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  logoutText: {
    color: "#FF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  overviewCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  binId: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
    marginTop: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  
  // Bin Component Styles
  binContainer: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  binHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059212',
  },
  binWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  binOutline: {
    alignItems: 'center',
  },
  binLid: {
    width: 40,
    height: 8,
    backgroundColor: '#666666',
    borderRadius: 4,
    marginBottom: 2,
  },
  binBody: {
    width: 35,
    height: 60,
    borderWidth: 2,
    borderColor: '#999999',
    borderRadius: 4,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  binFill: {
    width: '100%',
    borderRadius: 2,
    opacity: 0.8,
  },
  weightText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: "30%",
    borderRadius: 12,
    overflow: "hidden",
  },
  actionGradient: {
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  impactCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  impactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  impactIcon: {
    fontSize: 32,
  },
  impactContent: {
    flex: 1,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  impactLabel: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  
  // Bottom Navigation Styles
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  activeNavItem: {
    backgroundColor: '#E8F5E8',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeNavIcon: {
    transform: [{ scale: 1.1 }],
  },
  navText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#059212',
    fontWeight: '600',
  },
  
  // Feature Page Styles
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  
  // Calendar Styles
  calendar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  calendarNavButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavText: {
    fontSize: 18,
    color: '#059212',
    fontWeight: 'bold',
  },
  calendarHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  calendarWeekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarWeekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#333333',
  },
  calendarDayWithCollection: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  calendarDayTextWithCollection: {
    color: '#059212',
    fontWeight: '600',
  },
  calendarDaySelected: {
    backgroundColor: '#059212',
    borderRadius: 8,
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: '#06D001',
    borderRadius: 8,
  },
  calendarDayTextToday: {
    color: '#06D001',
    fontWeight: 'bold',
  },
  collectionIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#059212',
  },
  
  // Collection History Styles
  selectedDateHeader: {
    marginBottom: 16,
  },
  historyContainer: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  historyCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  historyTime: {
    fontSize: 12,
    color: '#666666',
  },
  weightInfo: {
    alignItems: 'flex-end',
  },
  historyWeight: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  collectorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  collectorLabel: {
    fontSize: 12,
    color: '#666666',
  },
  collectorName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
  },
  
  // Day Summary Styles
  daySummary: {
    marginTop: 8,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059212',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  
  // No Data Styles
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Collection Management Styles (kept for other sections)
  scheduleOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleButton: {
    backgroundColor: '#059212',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
  },
  scheduleText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  historyDate: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  historyDetails: {
    fontSize: 14,
    color: '#666666',
  },
  
  // Analytics Styles
  barChart: {
    marginTop: 35,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    paddingHorizontal: 8,
    paddingBottom: 35,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  bar: {
    width: '100%',
    maxWidth: 30,
    minHeight: 20,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barSegment: {
    width: '100%',
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: '#666666',
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#333333',
  },

  // Pie Chart Styles
  pieContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  pieChart: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  pieBackground: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  pieSlice: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    top: '50%',
    left: '50%',
    transformOrigin: '0 0',
  },
  pieCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -20 }],
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
  },
  pieCenterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  pieCenterLabel: {
    fontSize: 10,
    color: '#666666',
  },
  pieStats: {
    width: '100%',
    gap: 8,
  },
  pieStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  pieStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pieStatIcon: {
    fontSize: 20,
  },
  pieStatCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  pieStatValues: {
    alignItems: 'flex-end',
  },
  pieStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pieStatPercent: {
    fontSize: 12,
    color: '#666666',
  },

  // Environmental Impact Grid
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  impactStatCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  impactStatIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  impactStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059212',
    marginBottom: 4,
  },
  impactStatLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },

  // Power Chart Styles
  powerChart: {
    marginTop: 35,
  },
  powerBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  powerBarColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  powerBar: {
    width: '80%',
    minHeight: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  powerBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  powerBarValue: {
    fontSize: 9,
    color: '#666666',
  },
  powerSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  powerSummaryItem: {
    alignItems: 'center',
  },
  powerSummaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059212',
  },
  powerSummaryLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },

  // Remove old unused styles
  chartPlaceholder: {
    height: 120,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C8',
  },
  chartText: {
    color: '#059212',
    fontSize: 14,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactStatItem: {
    alignItems: 'center',
  },
  powerStats: {
    gap: 8,
  },
  powerText: {
    fontSize: 14,
    color: '#333333',
  },
  
  // Revenue Styles
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  earningItem: {
    alignItems: 'center',
  },
  earningValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059212',
  },
  earningLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  payoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  payoutDate: {
    fontSize: 14,
    color: '#333333',
  },
  payoutAmount: {
    fontSize: 14,
    color: '#059212',
    fontWeight: '600',
  },
  paymentButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentText: {
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
})

export default HouseholdDashboard