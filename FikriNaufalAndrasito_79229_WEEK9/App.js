import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { Camera } from "expo-camera";
import { useState } from "react";
import RNFS from "react-native-fs";

export default function App() {
  const [url, setUrl] = useState("");
  const [savedFilePath, setSavedFilePath] = useState("");

  const openImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setUrl(result.uri);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setUrl(result.uri);
      }
    } else {
      console.log("Camera permission denied");
    }
  };

  const saveImageToDevice = async () => {
    if (!url) {
      Alert.alert("Error", "Please select or capture an image first");
      return;
    }

    try {
      // Request permissions for accessing media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Need permission to save images to gallery"
        );
        return;
      }

      // Generate a unique filename
      const fileName = `image_${new Date().getTime()}.jpg`;

      // Save the image to media library (Pictures folder)
      const asset = await MediaLibrary.createAssetAsync(url);

      // Create an album named after the app to organize the pictures
      const album = await MediaLibrary.getAlbumAsync(
        "FikriNaufalAndrasito_79229_WEEK9"
      );
      if (album === null) {
        await MediaLibrary.createAlbumAsync(
          "FikriNaufalAndrasito_79229_WEEK9",
          asset,
          false
        );
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      setSavedFilePath(asset.uri);
      Alert.alert("Success", `Image saved to Pictures folder!`);

      console.log("Image saved to Pictures:", asset);
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error", "Failed to save image to Pictures folder");
    }
  };

  const saveFile = async () => {
    const path = RNFS.DownloadDirectoryPath + "/test.txt";
    RNFS.writeFile(path, "Lorem ipsum dolor sit amet", "utf8")
      .then((res) => {
        console.log("Success create file. Check your download folder");
        Alert.alert("Success", "File created in downloads folder");
      })
      .catch((err) => {
        console.error(err);
        Alert.alert("Error", "Failed to create file");
      });
  };

  return (
    <View style={styles.container}>
      <Text>Camera & Image Picker Demo</Text>
      <Text>Fikri Naufal Andrasito - 0000079229</Text>
      <Button title="Open Gallery" onPress={openImagePicker} />
      <Button title="Open Camera" onPress={requestCameraPermission} />
      <Button title="Save Test File" onPress={saveFile} color="#4CAF50" />
      {url ? (
        <>
          <Image source={{ uri: url }} style={styles.image} />
          <Button
            title="Save Image"
            onPress={saveImageToDevice}
            color="#007AFF"
          />
        </>
      ) : null}
      {savedFilePath ? (
        <Text style={styles.savedText}>Image saved to Pictures folder</Text>
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
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },
  savedText: {
    marginTop: 10,
    fontSize: 12,
    color: "green",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
