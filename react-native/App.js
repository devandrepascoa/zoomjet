import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, ListView, TextInput } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <TextInput style={styles.searchRoom}></TextInput>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#212529",
    alignItems: "center",
    justifyContent: "center",
  },
  searchRoom: {
  },
});
