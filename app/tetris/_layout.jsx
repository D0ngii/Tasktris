import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const TetrisLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="goals"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="createBoard"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default TetrisLayout;
