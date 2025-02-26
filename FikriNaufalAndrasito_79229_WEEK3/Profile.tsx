import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ProfileProps {
  name: string;
  age: number;
}

const Profile: React.FC<ProfileProps> = ({ name, age }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Name: {name || "-"}</Text>
      <Text style={styles.text}>Age: {age || 0}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    padding: 20,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
    width: "90%",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    marginVertical: 5,
    color: "#2E7D32",
    fontWeight: "600",
  },
});

export default Profile;
