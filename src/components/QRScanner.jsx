import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  StatusBar,
  Vibration 
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const QRScanner = ({ onScan, onClose }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned || isProcessing) return;
    
    setScanned(true);
    setIsProcessing(true);
    
    // Add vibration feedback
    Vibration.vibrate(100);
    
    // Show success message
    Alert.alert(
      "QR Code Scanned Successfully! ✅",
      `Waste Collection Completed!\n\nBin ID: ${data}\nStatus: Collection Successful\nTimestamp: ${new Date().toLocaleString()}`,
      [
        {
          text: "OK",
          onPress: () => {
            // Call the original onScan function
            if (onScan) {
              onScan(data);
            }
            onClose();
          }
        }
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>No access to camera</Text>
          <Text style={styles.subMessageText}>Please enable camera permissions to scan QR codes</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity style={styles.headerCloseButton} onPress={onClose}>
          <Text style={styles.headerCloseText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417'],
          }}
        />
        
        {/* Scanning Overlay */}
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.overlayTop}>
            <Text style={styles.instructionText}>Position QR code within the frame</Text>
          </View>
          
          {/* Scanning frame */}
          <View style={styles.scanningArea}>
            <View style={styles.scanFrame}>
              {/* Corner indicators */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Animated scanning line */}
              {!scanned && (
                <Animatable.View
                  animation={{
                    from: { translateY: -120 },
                    to: { translateY: 120 }
                  }}
                  iterationCount="infinite"
                  duration={2000}
                  easing="linear"
                  style={styles.scanLine}
                />
              )}
            </View>
          </View>
          
          {/* Bottom overlay */}
          <View style={styles.overlayBottom}>
            {scanned && (
              <Animatable.View animation="bounceIn" duration={800} style={styles.successContainer}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successText}>QR Code Detected!</Text>
                <Text style={styles.processingText}>Processing collection...</Text>
              </Animatable.View>
            )}
            
            {!scanned && (
              <View style={styles.actionContainer}>
                <TouchableOpacity 
                  style={styles.rescanButton} 
                  onPress={() => setScanned(false)}
                >
                  <Text style={styles.rescanText}>📷 Ready to Scan</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Align the QR code within the frame to scan</Text>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCloseText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Camera
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },

  // Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },

  // Scanning Area
  scanningArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Corners
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#059212',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  // Scan Line
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#059212',
    shadowColor: '#059212',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },

  // Success State
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  successText: {
    color: '#059212',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 14,
  },

  // Action Container
  actionContainer: {
    alignItems: 'center',
  },
  rescanButton: {
    backgroundColor: 'rgba(5, 146, 18, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#059212',
  },
  rescanText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Footer
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.8)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Message Container (for permissions)
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subMessageText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
  },
  closeButton: {
    backgroundColor: '#059212',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRScanner;