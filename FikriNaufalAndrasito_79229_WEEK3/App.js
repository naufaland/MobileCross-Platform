import { StatusBar } from "expo-status-bar";
import { StyleSheet, TextInput, View, Button, Text } from "react-native";
import Counter from "./Counter";
import { useState } from "react";
import Profile from "./Profile";

export default function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileAge, setProfileAge] = useState(0);

  const handleIncrement = () => setCount(count + 1);

  const handleDecrement = () => setCount(count - 1);

  const handlePassValue = () => {
    setProfileName(name);
    setProfileAge(count);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Form</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <Counter
        count={count}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />
      <Button title="Pass Value" onPress={handlePassValue} color="#4CAF50" />
      <Profile name={profileName} age={profileAge} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#4CAF50",
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    width: "90%",
    fontSize: 16,
    backgroundColor: "#FFF",
  },
});
