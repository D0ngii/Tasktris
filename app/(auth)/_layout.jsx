import { View, Text } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const AuthLayout = () => {
  return (
    <View className="flex-1 bg-primary">
      <Stack>
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </View>
  );
};

export default AuthLayout;
