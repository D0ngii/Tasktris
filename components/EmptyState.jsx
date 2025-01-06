import { View, Text, Image, Alert } from "react-native";
import React from "react";
import { images } from "../constants";
import CustomButton from "./CustomButton";
import { router } from "expo-router";
const EmptyState = ({ title, subtitle }) => {
  const handleCreateBoard = async () => {
    try {
      // const newBoard = await createBoard
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };
  return (
    <View className="justify-center items-center px-4">
      {/* <Image
        source={images.empty}
        className="w-[270px] h-[215px]"
        resizeMode="contain"
      /> */}
      <Text className="text-x text-center font-retro text-secondary-blue mt-2">
        {title}
      </Text>
      <Text className="font-retro text-sm text-secondary-blue">{subtitle}</Text>
      <CustomButton
        title="Create Board"
        handlePress={() => router.push("/tetris/createBoard")}
        containerStyles="w-[300px] my-20"
      />
    </View>
  );
};

export default EmptyState;
