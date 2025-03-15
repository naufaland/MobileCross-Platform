import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import Input from "./components/Input"; // Import the new Input component

export default function App() {
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");

  const handleChangeMyName = (value) => {
    setName(value);
  };

  const handleChangeMyNIM = (value) => {
    setNim(value);
  };

  return (
    <View style={styles.container}>
      <Text>
        {name} - {nim}
      </Text>
      <Input
        label="Name"
        value={name}
        onChangeText={handleChangeMyName}
        placeholder="Enter your name"
      />
      <Input
        label="NIM"
        value={nim}
        onChangeText={handleChangeMyNIM}
        placeholder="Enter your NIM"
        keyboardType="numeric"
      />
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
});
