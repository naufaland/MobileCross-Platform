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
import { useState, useEffect } from "react";
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

  // Enhanced notification function with better error handling
  const sendNotification = async (title, body) => {
    try {
      console.log("Attempting to send notification:", { title, body });

      if (!notificationPermission) {
        console.log("No notification permission");
        // Show alert as fallback
        Alert.alert(title, body);
        return;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
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
        throw error;
      }

      if (data) {
        setPhotos(data);
        // Send notification about loaded photos
        await sendNotification(
          "Photos Loaded",
          `Successfully loaded ${data.length} photos from database`
        );
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      await sendNotification(
        "Database Error",
        "Failed to load photos from database"
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
        "Upload Started",
        `Starting upload for location: ${latitude.substring(
          0,
          8
        )}, ${longitude.substring(0, 8)}`
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
        // Send detailed failure notification
        await sendNotification(
          "❌ Photo Upload Failed",
          `Storage error at location: Lat ${latitude.substring(
            0,
            8
          )}, Lng ${longitude.substring(0, 8)}\nError: ${uploadError.message}`
        );
        throw new Error(`Upload error: ${uploadError.message || uploadError}`);
      }

      console.log("Upload successful, getting public URL");

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      if (!urlData || !urlData.publicUrl) {
        await sendNotification(
          "❌ Photo Upload Failed",
          `Failed to get photo URL\nLocation: Lat ${latitude.substring(
            0,
            8
          )}, Lng ${longitude.substring(0, 8)}`
        );
        throw new Error("Failed to get public URL");
      }

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
        // Send detailed failure notification
        await sendNotification(
          "❌ Database Save Failed",
          `Photo uploaded but database save failed\nLocation: Lat ${latitude.substring(
            0,
            8
          )}, Lng ${longitude.substring(0, 8)}\nError: ${insertError.message}`
        );
        throw new Error(
          `Database error: ${insertError.message || insertError}`
        );
      }

      console.log("Photo upload complete!");

      // Send detailed success notification
      await sendNotification(
        "✅ Photo Upload Success!",
        `Photo saved successfully!\n📍 Location: Lat ${latitude.substring(
          0,
          8
        )}, Lng ${longitude.substring(0, 8)}\n📅 ${new Date().toLocaleString()}`
      );

      alert("Photo uploaded successfully!");
      fetchPhotos(); // Refresh the photo list
    } catch (error) {
      console.error("Error uploading photo:", error);

      // Send final failure notification with location
      await sendNotification(
        "❌ Upload Failed",
        `Complete upload failure\n📍 Location: Lat ${latitude.substring(
          0,
          8
        )}, Lng ${longitude.substring(0, 8)}\nError: ${error.message}`
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

          // Send notification about location capture
          await sendNotification(
            "📍 Location Captured",
            `Photo location set to:\nLat: ${lat.substring(
              0,
              8
            )}\nLng: ${lng.substring(0, 8)}`
          );
        }
      } catch (error) {
        console.error("Error getting location:", error);
        await sendNotification(
          "⚠️ Location Error",
          "Failed to get current location for photo"
        );
      }
    }
  };

  const handlePhotoTaken = async (photoUrl, location) => {
    setShowCamera(false);

    if (location) {
      const lat = location.coords.latitude.toString();
      const lng = location.coords.longitude.toString();

      setLatitude(lat);
      setLongitude(lng);
      setFullLocationData(location);

      // Send notification about camera photo with location
      await sendNotification(
        "📸 Photo Captured",
        `Photo taken with location:\nLat: ${lat.substring(
          0,
          8
        )}\nLng: ${lng.substring(0, 8)}`
      );
    }

    fetchPhotos();
  };

  const handleLocationUpdate = async (
    newLongitude,
    newLatitude,
    locationData
  ) => {
    const lng = newLongitude.toString();
    const lat = newLatitude.toString();

    setLongitude(lng);
    setLatitude(lat);
    setFullLocationData(locationData);

    // Send notification about manual location update
    await sendNotification(
      "📍 Location Updated",
      `New location set:\nLat: ${lat.substring(0, 8)}\nLng: ${lng.substring(
        0,
        8
      )}`
    );
  };

  const handleGetLocation = () => {
    setShowGeoLocation(true);
  };

  const saveLocationFile = async () => {
    if (!fullLocationData) {
      alert("No location data to save!");
      return;
    }

    const fileUri = `${FileSystem.documentDirectory}location_data.txt`;
    const dataToSave = JSON.stringify(fullLocationData, null, 2);

    try {
      await FileSystem.writeAsStringAsync(fileUri, dataToSave, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);

        // Send notification about successful file save
        await sendNotification(
          "💾 Location File Saved",
          `Location data saved and shared\nLat: ${latitude.substring(
            0,
            8
          )}, Lng: ${longitude.substring(0, 8)}`
        );
      } else {
        alert("Sharing is not available on this device.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save location data.");

      // Send notification about save failure
      await sendNotification(
        "❌ Save Failed",
        "Failed to save location data file"
      );
    }
  };

  // Function to test notifications manually
  const testNotification = async () => {
    await sendNotification(
      "🧪 Test Notification",
      `Test notification with current location:\nLat: ${
        latitude || "N/A"
      }\nLng: ${longitude || "N/A"}`
    );
  };

  if (showCamera) {
    return (
      <Camera
        onBack={() => setShowCamera(false)}
        onPhotoTaken={handlePhotoTaken}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Fikri Naufal Andrasito (00000079229)</Text>

        {/* Notification Status Indicator */}
        <View style={styles.notificationStatus}>
          <Text style={styles.statusText}>
            🔔 Notifications:{" "}
            {notificationPermission ? "✅ Enabled" : "❌ Disabled"}
          </Text>
          {!notificationPermission && (
            <Text style={styles.warningText}>
              Please enable notifications in device settings for upload status
              updates
            </Text>
          )}
        </View>

        <View style={styles.buttonSection}>
          <View style={styles.button}>
            <Button
              title="Open Camera"
              onPress={() => setShowCamera(true)}
              color="#3498db"
            />
          </View>
          <View style={styles.button}>
            <Button
              title="Open Gallery"
              onPress={openImagePicker}
              color="#2ecc71"
            />
          </View>
          <View style={styles.button}>
            <Button
              title="Get Location"
              onPress={handleGetLocation}
              color="#9b59b6"
            />
          </View>
          <View style={styles.button}>
            <Button
              title="Save Location"
              onPress={saveLocationFile}
              disabled={!fullLocationData}
              color={fullLocationData ? "#e74c3c" : "#95a5a6"}
            />
          </View>
          {/* Test Notification Button */}
          <View style={styles.button}>
            <Button
              title="Test Notification"
              onPress={testNotification}
              color="#f39c12"
            />
          </View>
        </View>

        {showGeoLocation ? (
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Current Location</Text>
            <GeoLocation onLocationUpdate={handleLocationUpdate} />
          </View>
        ) : (
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Location Data</Text>
            <Text style={styles.locationInfo}>
              Longitude: {longitude || "Not available"}
            </Text>
            <Text style={styles.locationInfo}>
              Latitude: {latitude || "Not available"}
            </Text>
          </View>
        )}

        {imageUri ? (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>Selected Image</Text>
            <Image source={{ uri: imageUri }} style={styles.image} />

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={uploadPhoto}
              disabled={loading}
            >
              <Text style={styles.uploadButtonText}>
                {loading ? "Uploading..." : "Upload This Photo"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.photosContainer}>
          <Text style={styles.sectionTitle}>Photos Gallery</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
              <Text style={{ marginTop: 10 }}>Loading photos...</Text>
            </View>
          ) : photos.length > 0 ? (
            photos.map((photo) => (
              <View key={photo.id} style={styles.photoItem}>
                <Image source={{ uri: photo.photo_url }} style={styles.image} />
                <View style={styles.photoDetails}>
                  <Text style={styles.photoInfo}>
                    Latitude: {photo.latitude || "N/A"}
                  </Text>
                  <Text style={styles.photoInfo}>
                    Longitude: {photo.longitude || "N/A"}
                  </Text>
                  <Text style={styles.photoInfo}>
                    Taken: {new Date(photo.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: "center", padding: 20 }}>
              No photos found. Upload some!
            </Text>
          )}
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 15,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 25,
    marginTop: 50,
    color: "#2c3e50",
  },
  notificationStatus: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  warningText: {
    fontSize: 14,
    color: "#e74c3c",
    marginTop: 5,
    fontStyle: "italic",
  },
  buttonSection: {
    marginVertical: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    minWidth: "48%",
    marginBottom: 10,
  },
  locationSection: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#34495e",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    paddingBottom: 8,
  },
  locationInfo: {
    fontSize: 16,
    marginBottom: 6,
    color: "#2c3e50",
  },
  imageContainer: {
    marginTop: 25,
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 320,
    height: 320,
    borderRadius: 15,
  },
  photosContainer: {
    marginVertical: 25,
  },
  photoItem: {
    marginBottom: 30,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoDetails: {
    marginTop: 15,
    width: "100%",
  },
  photoInfo: {
    fontSize: 15,
    marginBottom: 6,
    color: "#34495e",
  },
  uploadButton: {
    marginTop: 20,
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    width: "80%",
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
});
