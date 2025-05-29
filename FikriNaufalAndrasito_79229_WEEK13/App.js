import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useState, useEffect, useRef } from "react";
import { supabase } from "./utils/supabase";
import Camera from "./components/Camera";
import GeoLocation from "./components/GetLocation";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [imageUri, setImageUri] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState(null);
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [showGeoLocation, setShowGeoLocation] = useState(false);
  const [fullLocationData, setFullLocationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(false);

  // Counters for Supabase operations
  const [supabaseStats, setSupabaseStats] = useState({
    successful: 0,
    failed: 0,
  });

  useEffect(() => {
    (async () => {
      // Request media permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(status === "granted");

      // Request notification permissions with explicit configuration
      const { status: notifStatus } =
        await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });

      console.log("Notification permission status:", notifStatus);
      setNotificationPermission(notifStatus === "granted");

      // Test notification on app start (optional)
      if (notifStatus === "granted") {
        await sendNotification("App Started", "Notification system is ready!");
      }

      fetchPhotos();
    })();
  }, []);

  // Track Supabase operation results
  const trackSupabaseOperation = (isSuccessful) => {
    setSupabaseStats((prev) => ({
      successful: isSuccessful ? prev.successful + 1 : prev.successful,
      failed: !isSuccessful ? prev.failed + 1 : prev.failed,
    }));
  };

  // Enhanced notification function with operation tracking
  const sendNotification = async (title, body, showStats = false) => {
    try {
      console.log("Attempting to send notification:", { title, body });

      if (!notificationPermission) {
        console.log("No notification permission");
        // Show alert as fallback
        Alert.alert(title, body);
        return;
      }

      // Add operation stats if enabled
      let finalBody = body;
      if (showStats) {
        finalBody = `${body}\n${supabaseStats.successful} successful, ${supabaseStats.failed} unsuccessful.`;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: finalBody,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Show immediately
      });

      console.log("Notification sent with ID:", notificationId);
      return notificationId;
    } catch (error) {
      console.error("Error sending notification:", error);
      // Fallback to alert
      Alert.alert(title, body);
    }
  };

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("photo_locations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        trackSupabaseOperation(false);
        throw error;
      }

      if (data) {
        trackSupabaseOperation(true);
        setPhotos(data);
        // Send notification with stats about loaded photos
        await sendNotification(
          "Supabase operation",
          `Photos loaded from database`,
          true
        );
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      await sendNotification(
        "Supabase operation",
        "Failed to load photos from database",
        true
      );
      alert("Could not load photos from database");
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async () => {
    if (!imageUri) {
      alert("Please select an image first");
      return;
    }

    if (!latitude || !longitude) {
      alert("Please get location data first");
      return;
    }

    try {
      setLoading(true);
      console.log("Starting photo upload process...");

      // Send notification that upload is starting
      await sendNotification(
        "Supabase operation",
        `Starting upload for location: ${latitude.substring(
          0,
          8
        )}, ${longitude.substring(0, 8)}`,
        true
      );

      // Generate a unique filename
      const fileName = `photo_${Date.now()}.jpg`;
      console.log("Generated filename:", fileName);

      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      console.log("Image converted to blob");

      // Upload to Supabase Storage
      console.log("Uploading to Supabase storage...");
      const { data, error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, blob);

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        trackSupabaseOperation(false);
        // Send detailed failure notification with stats
        await sendNotification(
          "Supabase share",
          `Storage upload error at location: Lat ${latitude.substring(
            0,
            8
          )}, Lng ${longitude.substring(0, 8)}`,
          true
        );
        throw new Error(`Upload error: ${uploadError.message || uploadError}`);
      }

      trackSupabaseOperation(true);
      console.log("Upload successful, getting public URL");

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      if (!urlData || !urlData.publicUrl) {
        trackSupabaseOperation(false);
        await sendNotification(
          "Supabase share",
          `Failed to get photo URL\nLocation: Lat ${latitude.substring(
            0,
            8
          )}, Lng ${longitude.substring(0, 8)}`,
          true
        );
        throw new Error("Failed to get public URL");
      }

      trackSupabaseOperation(true);
      console.log("Got public URL:", urlData.publicUrl);

      // Save metadata to database
      console.log("Saving to database...");
      const { error: insertError } = await supabase
        .from("photo_locations")
        .insert([
          {
            photo_url: urlData.publicUrl,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            filename: fileName,
          },
        ]);

      if (insertError) {
        console.error("Database insert error:", insertError);
        trackSupabaseOperation(false);
        // Send detailed failure notification with stats
        await sendNotification(
          "Supabase share",
          `Photo uploaded but database save failed\nLocation: Lat ${latitude.substring(
            0,
            8
          )}, Lng ${longitude.substring(0, 8)}`,
          true
        );
        throw new Error(
          `Database error: ${insertError.message || insertError}`
        );
      }

      trackSupabaseOperation(true);
      console.log("Photo upload complete!");

      // Send detailed success notification with stats
      await sendNotification(
        "Supabase share",
        `Photo saved successfully!\nLocation: Lat ${latitude.substring(
          0,
          8
        )}, Lng ${longitude.substring(0, 8)}`,
        true
      );

      alert("Photo uploaded successfully!");
      fetchPhotos(); // Refresh the photo list
    } catch (error) {
      console.error("Error uploading photo:", error);

      // Send final failure notification with stats
      await sendNotification(
        "Supabase share",
        `Complete upload failure\nLocation: Lat ${latitude.substring(
          0,
          8
        )}, Lng ${longitude.substring(0, 8)}`,
        true
      );

      alert(`Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openImagePicker = async () => {
    if (!hasMediaPermission) {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need media library permissions to make this work!");
        return;
      }
      setHasMediaPermission(true);
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setImageUri(selectedImageUri);
      console.log("Selected image from gallery:", selectedImageUri);

      // Get location when image is picked
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          const lat = location.coords.latitude.toString();
          const lng = location.coords.longitude.toString();

          setLatitude(lat);
          setLongitude(lng);
          setFullLocationData(location);

          console.log("Location obtained:", { lat, lng });
        }
      } catch (error) {
        console.error("Error getting location:", error);
      }
    }
  };

  const handleDeletePhoto = async (id, filename) => {
    try {
      setLoading(true);

      // Delete from database first
      const { error: dbError } = await supabase
        .from("photo_locations")
        .delete()
        .match({ id });

      if (dbError) {
        trackSupabaseOperation(false);
        console.error("Error deleting from database:", dbError);
        await sendNotification(
          "Supabase share",
          "Failed to delete photo record from database",
          true
        );
        throw dbError;
      }

      trackSupabaseOperation(true);

      // Then delete from storage
      const { error: storageError } = await supabase.storage
        .from("photos")
        .remove([filename]);

      if (storageError) {
        trackSupabaseOperation(false);
        console.error("Error deleting from storage:", storageError);
        await sendNotification(
          "Supabase share",
          "Failed to delete photo file from storage",
          true
        );
      } else {
        trackSupabaseOperation(true);
      }

      // Refresh the photos list
      fetchPhotos();

      // Show success notification with stats
      await sendNotification(
        "Supabase share",
        "Photo deleted successfully",
        true
      );
    } catch (error) {
      console.error("Error in delete process:", error);
      alert(`Delete failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraPhoto = (photoUrl, locationData) => {
    if (photoUrl) {
      setImageUri(photoUrl);
    }

    if (locationData) {
      setLatitude(locationData.coords.latitude.toString());
      setLongitude(locationData.coords.longitude.toString());
      setFullLocationData(locationData);
    }

    setShowCamera(false);
    fetchPhotos(); // Refresh photos to include the newly taken photo
  };

  const renderPhotoCard = (photo, index) => {
    return (
      <View style={styles.photoCard} key={photo.id || index}>
        <Image
          source={{ uri: photo.photo_url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.photoInfo}>
          <Text style={styles.photoDate}>
            {new Date(photo.created_at).toLocaleString()}
          </Text>
          <View style={styles.locationInfo}>
            <Text>Lat: {photo.latitude?.toFixed(6) || "N/A"}</Text>
            <Text>Lng: {photo.longitude?.toFixed(6) || "N/A"}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePhoto(photo.id, photo.filename)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {showCamera ? (
        <Camera
          onBack={() => setShowCamera(false)}
          onPhotoTaken={handleCameraPhoto}
        />
      ) : showGeoLocation ? (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <GeoLocation
              onLocationUpdate={(longitude, latitude, location) => {
                setLongitude(longitude.toString());
                setLatitude(latitude.toString());
                setFullLocationData(location);
              }}
            />
            <Button title="Close" onPress={() => setShowGeoLocation(false)} />
          </View>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Photo Location App</Text>
            <Text style={styles.subtitle}>
              Week 13 - Supabase Operations:
              {supabaseStats.successful} successful, {supabaseStats.failed}{" "}
              failed
            </Text>
          </View>

          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.preview}
                resizeMode="cover"
              />
              <View style={styles.locationData}>
                {latitude && longitude ? (
                  <View>
                    <Text>Latitude: {latitude.substring(0, 10)}</Text>
                    <Text>Longitude: {longitude.substring(0, 10)}</Text>
                  </View>
                ) : (
                  <Text>No location data</Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                Select an image or take a photo
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={openImagePicker}
            >
              <Text style={styles.buttonText}>Select Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowCamera(true)}
            >
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowGeoLocation(true)}
            >
              <Text style={styles.buttonText}>Get Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                (!imageUri || !latitude || !longitude) && styles.buttonDisabled,
                loading && styles.buttonLoading,
              ]}
              onPress={uploadPhoto}
              disabled={!imageUri || !latitude || !longitude || loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Uploading..." : "Upload to Supabase"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.photosSection}>
            <View style={styles.photosSectionHeader}>
              <Text style={styles.photosSectionTitle}>Saved Photos</Text>
              <TouchableOpacity onPress={fetchPhotos}>
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : photos.length > 0 ? (
              photos.map(renderPhotoCard)
            ) : (
              <Text style={styles.noPhotosText}>No photos saved yet</Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  previewContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  preview: {
    width: "100%",
    height: 200,
  },
  locationData: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  placeholderContainer: {
    backgroundColor: "#ddd",
    height: 200,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    width: "48%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  buttonLoading: {
    backgroundColor: "#FFA000",
  },
  photosSection: {
    marginTop: 10,
    marginBottom: 40,
  },
  photosSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  photosSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  refreshText: {
    color: "blue",
  },
  photoCard: {
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  thumbnail: {
    width: "100%",
    height: 150,
  },
  photoInfo: {
    padding: 10,
  },
  photoDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  locationInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    padding: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  noPhotosText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
});
