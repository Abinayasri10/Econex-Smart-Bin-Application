import QRCode from "react-native-qrcode-svg"

export const generateBinQRData = (binId, location) => {
  const qrData = {
    type: "bin_collection",
    binId: binId,
    location: location,
    timestamp: new Date().toISOString(),
    version: "1.0",
  }

  return JSON.stringify(qrData)
}

export const generateUserQRData = (userId, userName) => {
  const qrData = {
    type: "user_identification",
    userId: userId,
    userName: userName,
    timestamp: new Date().toISOString(),
    version: "1.0",
  }

  return JSON.stringify(qrData)
}

export const parseQRData = (qrString) => {
  try {
    const data = JSON.parse(qrString)

    // Validate QR data structure
    if (!data.type || !data.timestamp || !data.version) {
      throw new Error("Invalid QR code format")
    }

    return {
      success: true,
      data: data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to parse QR code",
    }
  }
}

export const QRCodeComponent = ({ value, size = 200, backgroundColor = "white", color = "black" }) => {
  return (
    <QRCode
      value={value}
      size={size}
      backgroundColor={backgroundColor}
      color={color}
      logoSize={30}
      logoBackgroundColor={backgroundColor}
    />
  )
}
