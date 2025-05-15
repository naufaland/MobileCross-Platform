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

export default function Camera({ onBack, onPhotoTaken }) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
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
    setFacing((current) => (current === "back" ? "front" : "back"));
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
      let location = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          location = await Location.getCurrentPositionAsync({});
          console.log("Location captured:", location);
        }
      } catch (error) {
        console.error("Error getting location:", error);
      }

      // Upload to Supabase
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
          throw uploadError;
        }

        console.log("Upload successful:", uploadData);

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from("photos")
          .getPublicUrl(filePath);

        const imageUrl = publicUrlData?.publicUrl;
        console.log("Public URL:", imageUrl);

        // Save to database
        const dataToInsert = {
          photo_url: imageUrl,
          latitude: location?.coords.latitude,
          longitude: location?.coords.longitude,
          filename: fileName,
        };

        const { data: dbData, error: dbError } = await supabase
          .from("photo_locations")
          .insert([dataToInsert]);

        if (dbError) {
          console.error("Database error:", dbError);
          throw dbError;
        }

        console.log("Database record created:", dbData);
        Alert.alert("Success", "Photo uploaded and saved successfully!");

        // Call callback to inform parent component
        onPhotoTaken(imageUrl, location);
      } catch (error) {
        console.error("Error processing photo:", error);
        Alert.alert("Error", `Failed to process photo: ${error.message}`);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", `Failed to take photo: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={(ref) => setCameraRef(ref)}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onBack}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={uploading}
          >
            {uploading ? (
              <View
                style={[styles.captureInner, { backgroundColor: "#888" }]}
              />
            ) : (
              <View style={styles.captureInner} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
      {uploading && (
        <View style={styles.uploadingOverlay}>
          <Text style={styles.uploadingText}>Uploading photo...</Text>
        </View>
      )}
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
    position: "absolute",
    bottom: 30,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  button: {
    padding: 15,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  message: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    padding: 20,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    color: "white",
    fontSize: 18,
  },
});
