import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const Counter = ({ count, onIncrement, onDecrement }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onIncrement}
        style={[styles.button, styles.increment]}
      >
        <Text style={styles.buttonText}>Increment +</Text>
      </TouchableOpacity>
      <Text style={styles.text}>{count}</Text>
      <TouchableOpacity
        onPress={onDecrement}
        style={[styles.button, styles.decrement]}
      >
        <Text style={styles.buttonText}>Decrement -</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  text: {
    marginHorizontal: 20,
    fontSize: 24,
    fontWeight: "bold",
  },
  button: {
    padding: 10,
    borderRadius: 5,
  },
  increment: {
    backgroundColor: "#2196F3",
  },
  decrement: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Counter;
