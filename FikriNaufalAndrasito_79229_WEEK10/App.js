import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";

// Import Sharing conditionally to avoid errors if the package isn't installed
let Sharing = null;
try {
  Sharing = require("expo-sharing");
} catch (e) {
  console.log("expo-sharing not available, file sharing will be limited");
}

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filePath, setFilePath] = useState(null);

  const getLocation = async () => {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) {
      return;
    }

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(position.coords);
      console.log(position);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      setErrorMsg("Failed to get location");
    }
  };

  const hasLocationPermission = async () => {
    if (Platform.OS === "android" && Platform.Version < 23) {
      return true;
    }

    const hasPermission = await Location.getForegroundPermissionsAsync();

    if (hasPermission.granted) {
      return true;
    }

    const status = await Location.requestForegroundPermissionsAsync();

    if (status.granted) {
      return true;
    }

    if (status.status === "denied") {
      console.log("Location permission denied by user.");
    } else if (status.status === "never_ask_again") {
      console.log("Location permission denied by user.");
    }

    return false;
  };

  const saveLocationToFile = async () => {
    if (!location) {
      Alert.alert("Error", "No location data to save.");
      return;
    }

    try {
      // Create content for the file
      const timestamp = new Date().toISOString();
      const content =
        `Location Data - ${timestamp}\n` +
        `Longitude: ${location.longitude}\n` +
        `Latitude: ${location.latitude}\n` +
        `Altitude: ${location.altitude || "N/A"}\n` +
        `Accuracy: ${location.accuracy} meters\n`;

      // Define file path in the app's document directory
      const path = `${FileSystem.documentDirectory}location_${Date.now()}.txt`;

      // Write file
      await FileSystem.writeAsStringAsync(path, content);
      setFilePath(path);

      // Check if sharing is available
      if (Sharing && (await Sharing.isAvailableAsync())) {
        // If sharing is available, share the file
        await Sharing.shareAsync(path);
        Alert.alert("Success", "Location data saved and ready to share");
      } else {
        // If sharing is not available, use alternative method
        Alert.alert(
          "Success",
          `Location data saved to app's document directory at: ${path}`
        );
      }
    } catch (error) {
      console.error("Error saving file:", error);
      Alert.alert("Error", "Failed to save location data.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.nameText}>Fikri Naufal Andrasito - 00000079229</Text>

      <TouchableOpacity style={styles.button} onPress={getLocation}>
        <Text style={styles.buttonText}>GET GEO LOCATION</Text>
      </TouchableOpacity>

      {location ? (
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            Longitude: {location.longitude.toFixed(7)}
          </Text>
          <Text style={styles.locationText}>
            Latitude: {location.latitude.toFixed(7)}
          </Text>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveLocationToFile}
          >
            <Text style={styles.buttonText}>SAVE TO FILE</Text>
          </TouchableOpacity>

          {filePath && (
            <Text style={styles.filePathText}>Saved to: {filePath}</Text>
          )}
        </View>
      ) : (
        <Text style={styles.infoText}>
          {errorMsg || "Press the button to get location"}
        </Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  nameText: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 15,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  locationContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    marginVertical: 2,
  },
  infoText: {
    marginTop: 10,
    color: "#666",
  },
  filePathText: {
    fontSize: 12,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
});
