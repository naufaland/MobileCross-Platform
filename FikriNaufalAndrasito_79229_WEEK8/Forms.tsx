import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { updatePost } from "./axios";

const Forms = ({ route, navigation }) => {
  const { post } = route.params;
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Error", "Title and body cannot be empty");
      return;
    }

    setIsLoading(true);
    const updatedData = {
      id: post.id,
      title,
      body,
      userId: post.userId,
    };

    updatePost(post.id, updatedData)
      .then((res) => {
        console.log("Update response:", res.data);
        if (res.status === 200) {
          Alert.alert("Success", "Post updated successfully", [
            {
              text: "OK",
              onPress: () => {
                // Tambahkan parameter refreshPosts untuk memicu refresh data
                navigation.navigate("Home", { refreshPosts: true });
              },
            },
          ]);
        }
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to update post");
        console.error("Update error:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.postInfo}>
            <Text style={styles.postId}>Post #{post.id}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter post title"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Content</Text>
            <TextInput
              style={[styles.input, styles.bodyInput]}
              value={body}
              onChangeText={setBody}
              placeholder="Enter post content"
              placeholderTextColor="#aaa"
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleUpdate}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>Update Post</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  formContainer: {
    padding: 20,
    paddingTop: 10,
  },
  postInfo: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#e0e6ff",
    borderRadius: 8,
    alignItems: "center",
  },
  postId: {
    fontSize: 16,
    color: "#4630EB",
    fontWeight: "600",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#333",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  bodyInput: {
    height: 200,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#4630EB",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "transparent",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default Forms;
