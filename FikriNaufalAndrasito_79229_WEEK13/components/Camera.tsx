import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { supabase } from "../utils/supabase";
import * as FileSystem from "expo-file-system";

import type { CameraView as CameraViewType } from "expo-camera";
import type { LocationObject } from "expo-location";

export default function Camera({ onBack, onPhotoTaken }) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraViewType | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  }

  async function takePicture() {
    if (!cameraRef) {
      return;
    }

    setUploading(true);

    try {
      const photo = await cameraRef.takePictureAsync();
      console.log("Photo taken:", photo);

      // Save to media library
      await MediaLibrary.saveToLibraryAsync(photo.uri);

      // Get location
      let location: LocationObject | null = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          location = await Location.getCurrentPositionAsync({});
          console.log("Location captured:", location);
        }
      } catch (error) {
        console.error("Error getting location:", error);
      } // Upload to Supabase
      try {
        // Read the file as base64
        const base64 = await FileSystem.readAsStringAsync(photo.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Create a Uint8Array for upload
        const uint8Array = new Uint8Array(
          atob(base64)
            .split("")
            .map((c) => c.charCodeAt(0))
        );

        // Generate unique filename
        const fileName = `photo_${Date.now()}.jpg`;
        const filePath = fileName;

        // Upload file to storage
        console.log("Uploading to Supabase...");
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("photos")
          .upload(filePath, uint8Array, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          // No need to track here, this will be tracked in App.js
          throw uploadError;
        }

        console.log("Upload successful:", uploadData);

        // Get the public URL of the file
        const { data: urlData } = supabase.storage
          .from("photos")
          .getPublicUrl(filePath);

        if (!urlData || !urlData.publicUrl) {
          throw new Error("Failed to get public URL for uploaded file");
        }

        console.log("Public URL:", urlData.publicUrl);

        // Save metadata to the database
        const { data: metaData, error: metaError } = await supabase
          .from("photo_locations")
          .insert([
            {
              photo_url: urlData.publicUrl,
              latitude: location ? location.coords.latitude : null,
              longitude: location ? location.coords.longitude : null,
              filename: fileName,
            },
          ]);

        if (metaError) {
          console.error("Database insertion error:", metaError);
          throw metaError;
        }

        console.log("Database record created:", metaData);

        // Tell the parent component about the photo
        onPhotoTaken(urlData.publicUrl, location);
      } catch (error) {
        console.error("Error uploading to Supabase:", error);
        Alert.alert("Upload Error", "Failed to upload photo to storage");
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Camera Error", "Failed to take picture");
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={(ref) => setCameraRef(ref)}
        style={styles.camera}
        facing={facing}
        onMountError={(error) => {
          console.error("Camera mount error:", error);
          Alert.alert("Camera Error", "Could not start camera");
        }}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={uploading ? styles.buttonUploading : styles.button}
            onPress={takePicture}
            disabled={uploading}
          >
            {uploading ? (
              <Text style={styles.text}>Uploading...</Text>
            ) : (
              <Ionicons name="camera" size={50} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  flipButton: {
    padding: 10,
  },
  captureContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  buttonUploading: {
    backgroundColor: "rgba(255, 0, 0, 0.5)",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  text: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  message: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginVertical: 20,
  },
});
