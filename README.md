# EcoNex Smart Bin Management App

A comprehensive React Native Expo application for smart waste management with multi-role support, real-time bin monitoring, QR code-based collection system, and revenue distribution.

## Features

### Multi-Role Authentication System
- **Household Users**: Monitor personal waste disposal and earnings
- **Waste Collectors**: Scan QR codes, collect waste, track routes
- **Municipality Managers**: Oversee bin network, monitor collections, manage revenue
- **Recycling Companies**: Track processed waste, monitor revenue share
- **System Administrators**: Full system oversight and user management

### Core Functionality
- Real-time bin level monitoring (4 waste categories: Organic, Plastic, Hazardous, Others)
- QR code generation and scanning for collection verification
- Biometric authentication support (Face ID, Fingerprint, Iris)
- Multi-language support (English, Tamil, Hindi)
- Local storage-based data management
- Revenue distribution system with automatic calculations
- Push notifications for bin status and collection reminders
- Environmental impact tracking and analytics

### Technical Features
- Built with React Native Expo SDK 53
- Professional dark-themed UI with green accent colors
- Responsive design with smooth animations
- Local data persistence with AsyncStorage
- Camera integration for QR scanning
- Biometric authentication integration
- Push notification system

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation Steps

1. **Clone or Download the Project**
   \`\`\`bash
   # If using git
   git clone <repository-url>
   cd econex-app
   
   # Or extract the downloaded ZIP file
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Start the Development Server**
   \`\`\`bash
   npx expo start
   # or
   yarn expo start
   \`\`\`

4. **Run on Device/Simulator**
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal (limited functionality)

### Required Permissions
The app will request the following permissions:
- **Camera**: For QR code scanning
- **Notifications**: For bin alerts and collection reminders
- **Biometric**: For secure authentication (optional)

## Project Structure

\`\`\`
src/
├── components/           # Reusable UI components
│   ├── BinLevelIndicator.jsx
│   └── QRScanner.jsx
├── context/             # React Context providers
│   ├── AuthContext.jsx
│   ├── DataContext.jsx
│   └── LanguageContext.jsx
├── navigation/          # Navigation configuration
│   └── AppNavigator.jsx
├── screens/            # Screen components
│   ├── LandingScreen.jsx
│   ├── LoginScreen.jsx
│   ├── RegisterScreen.jsx
│   ├── RoleSelectionScreen.jsx
│   ├── household/
│   ├── collector/
│   ├── municipality/
│   ├── recycler/
│   └── admin/
└── utils/              # Utility functions
    ├── initialization.jsx
    ├── storage.jsx
    ├── biometric.jsx
    ├── qrGenerator.jsx
    └── notifications.jsx
\`\`\`

## User Roles & Access

### Household User
- View personal bin status and waste disposal history
- Track earnings from waste disposal
- Receive notifications for collection schedules
- Monitor environmental impact contributions

### Waste Collector
- Scan QR codes to verify bin collections
- Track collection routes and schedules
- Monitor daily collection targets and earnings
- Access bin location and status information

### Municipality Manager
- Oversee entire bin network status
- Monitor collection efficiency and schedules
- Track revenue distribution and municipal share
- Generate reports and analytics

### Recycling Company
- Track waste processing volumes by category
- Monitor revenue share from recycling operations
- View waste category breakdowns and trends
- Access processing history and analytics

### System Administrator
- Full system oversight and user management
- Monitor system health and performance
- Access comprehensive analytics and reports
- Manage user roles and permissions

## Data Management

The app uses local storage (AsyncStorage) for all data persistence:
- User authentication and profiles
- Bin network data and sensor readings
- Collection events and history
- Revenue and payout calculations
- App settings and preferences

## Color Scheme

- **Primary Green**: #059212
- **Secondary Green**: #06D001
- **Accent Green**: #9BEC00
- **Light Green**: #F6FF99
- **Background**: Dark theme with gradients
- **Text**: White and gray variants

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   \`\`\`bash
   npx expo start --clear
   \`\`\`

2. **iOS simulator not opening**
   - Ensure Xcode is installed and iOS Simulator is available
   - Try: `npx expo run:ios`

3. **Android emulator issues**
   - Ensure Android Studio is installed with an AVD
   - Try: `npx expo run:android`

4. **Camera permissions**
   - Ensure camera permissions are granted in device settings
   - Restart the app after granting permissions

5. **Biometric authentication not working**
   - Ensure biometric data is enrolled on the device
   - Check device compatibility with biometric authentication

### Performance Optimization

- The app initializes with sample data for demonstration
- Real-world deployment would integrate with IoT sensors and backend APIs
- Local storage is used for offline functionality
- Animations are optimized for smooth performance

## Development Notes

- Built with Expo SDK 53 for maximum compatibility
- Uses React Navigation 6 for navigation
- Implements React Context for state management
- Follows React Native best practices
- Responsive design for various screen sizes
- Professional UI/UX with smooth animations

## Future Enhancements

- Backend API integration for real-time data sync
- IoT sensor integration for live bin monitoring
- GPS tracking for collection routes
- Advanced analytics and reporting
- Integration with payment gateways
- Multi-tenant support for different municipalities
