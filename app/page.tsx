import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-md sm:max-w-2xl lg:max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🗑️</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary">EcoNex</h1>
          </div>
          <p className="text-lg sm:text-xl text-foreground max-w-2xl mx-auto leading-relaxed">
            Smart Bin Management System - A comprehensive React Native Expo application for intelligent waste management
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              React Native
            </Badge>
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              Expo SDK 53
            </Badge>
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              Multi-Role System
            </Badge>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-primary flex items-center gap-2 text-lg">
                <span>👥</span> Multi-Role Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Household Users</li>
                <li>• Waste Collectors</li>
                <li>• Municipality Managers</li>
                <li>• Recycling Companies</li>
                <li>• System Administrators</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-primary flex items-center gap-2 text-lg">
                <span>📱</span> Smart Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time bin monitoring</li>
                <li>• QR code scanning</li>
                <li>• Biometric authentication</li>
                <li>• Push notifications</li>
                <li>• Multi-language support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-primary flex items-center gap-2 text-lg">
                <span>💰</span> Revenue System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automatic revenue distribution</li>
                <li>• User earnings tracking</li>
                <li>• Municipality share (60%)</li>
                <li>• Recycler share (30%)</li>
                <li>• User share (40%)</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Card className="bg-card border-border shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <span>🚀</span> Setup Instructions
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              This is a React Native Expo application designed for mobile devices. Follow these steps to run it:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">Prerequisites:</h4>
              <ul className="text-sm text-foreground space-y-1">
                <li>• Node.js (v18 or higher)</li>
                <li>
                  • Expo CLI:{" "}
                  <code className="bg-secondary px-2 py-1 rounded text-secondary-foreground">
                    npm install -g @expo/cli
                  </code>
                </li>
                <li>• iOS Simulator or Android Studio</li>
              </ul>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">Installation Steps:</h4>
              <ol className="text-sm text-foreground space-y-2">
                <li>1. Download the project ZIP file</li>
                <li>2. Extract and navigate to the project folder</li>
                <li>
                  3. Run: <code className="bg-secondary px-2 py-1 rounded text-secondary-foreground">npm install</code>
                </li>
                <li>
                  4. Start the app:{" "}
                  <code className="bg-secondary px-2 py-1 rounded text-secondary-foreground">npx expo start</code>
                </li>
                <li>5. Scan QR code with Expo Go app or press 'i' for iOS simulator</li>
              </ol>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">Required Permissions:</h4>
              <ul className="text-sm text-foreground space-y-1">
                <li>• Camera (for QR code scanning)</li>
                <li>• Notifications (for bin alerts)</li>
                <li>• Biometric (for secure authentication)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* User Roles */}
        <Card className="bg-card border-border shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-primary">User Roles & Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="font-semibold text-primary mb-2">🏠 Household User</h4>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• Monitor personal waste disposal</li>
                  <li>• Track earnings from waste</li>
                  <li>• View environmental impact</li>
                  <li>• Receive collection notifications</li>
                </ul>

                <h4 className="font-semibold text-primary mb-2">🚛 Waste Collector</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Scan QR codes for collection</li>
                  <li>• Track collection routes</li>
                  <li>• Monitor daily targets</li>
                  <li>• Access bin locations</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-primary mb-2">🏛️ Municipality Manager</h4>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• Oversee bin network</li>
                  <li>• Monitor collections</li>
                  <li>• Track revenue distribution</li>
                  <li>• Generate reports</li>
                </ul>

                <h4 className="font-semibold text-primary mb-2">♻️ Recycling Company</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Track waste processing</li>
                  <li>• Monitor revenue share</li>
                  <li>• View category breakdowns</li>
                  <li>• Access processing history</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-primary">Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="font-semibold text-primary mb-2">Framework</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• React Native</li>
                  <li>• Expo SDK 53</li>
                  <li>• React Navigation 6</li>
                  <li>• AsyncStorage</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-primary mb-2">Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Biometric Auth</li>
                  <li>• QR Code Generation</li>
                  <li>• Push Notifications</li>
                  <li>• Local Storage</li>
                </ul>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <h4 className="font-semibold text-primary mb-2">Design</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Clean White Theme</li>
                  <li>• Professional Green Palette</li>
                  <li>• Smooth Animations</li>
                  <li>• Mobile-First Layout</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-border">
          <p className="text-foreground font-medium">EcoNex Smart Bin Management System</p>
          <p className="text-sm text-muted-foreground mt-1">
            Built with React Native Expo - Professional waste management solution
          </p>
        </div>
      </div>
    </div>
  )
}
