import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export default function App() {
  const [uri, setUri] = useState("");

  const openImagePicker = async () => {
    // Request permission for media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    // Launch image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    handleResponse(result);
  };

  const handleCameraLaunch = async () => {
    // Launch camera directly after permission is granted
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    handleResponse(result);
  };

  const requestCameraPermission = async () => {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }

    // If permission granted, launch camera
    handleCameraLaunch();
  };

  const handleResponse = (result) => {
    if (result.canceled) {
      console.log("User cancelled image picker");
    } else if (result.assets && result.assets[0] && result.assets[0].uri) {
      console.log("Image: ", result.assets[0].uri);
      setUri(result.assets[0].uri);
    } else {
      console.log("No assets found in the response");
    }
  };

  const saveFile = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + "test.txt";
      await FileSystem.writeAsStringAsync(
        fileUri,
        "Lorem ipsum dolor sit amet",
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      console.log("Success create file at:", fileUri);
      Alert.alert("Success", "File created successfully! Path: " + fileUri);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to create file: " + err.message);
    }
  };

  const saveImageFile = async () => {
    if (!uri) {
      Alert.alert("Error", "No image selected");
      return;
    }

    try {
      // First, request permission to save to media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to save images to your gallery"
        );
        return;
      }

      // Generate a unique filename like "rn_image_picker_1234567890.jpg"
      const filename = `rn_image_picker_${new Date().getTime()}.jpg`;

      // Create a temporary copy in FileSystem if needed
      let asset;

      // Save to media library (Photos/Gallery)
      asset = await MediaLibrary.createAssetAsync(uri);

      // Get album named "Pictures" or create it if it doesn't exist
      const album = await MediaLibrary.getAlbumAsync("Pictures");

      if (album === null) {
        // Create "Pictures" album if it doesn't exist
        await MediaLibrary.createAlbumAsync("Pictures", asset, false);
      } else {
        // Add to existing "Pictures" album
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      console.log("Image saved to Pictures folder:", asset.uri);
      Alert.alert("Success", "Image saved successfully to Pictures folder");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save image: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Picker</Text>
      <Text style={styles.title}>Fikri Naufal Andrasito - 00000079229</Text>
      <Button title="Pick an image from gallery" onPress={openImagePicker} />
      <Button title="Take a photo" onPress={requestCameraPermission} />
      <Button title="Save Text File" onPress={saveFile} />
      {uri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri }} style={styles.image} />
          <Button title="Save Image to Pictures" onPress={saveImageFile} />
        </View>
      ) : null}
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
    gap: 10,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
});
