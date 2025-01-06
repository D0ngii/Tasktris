import { View, Text, Image } from "react-native";
import { tailwind } from "tailwindcss-react-native";

import React from "react";
import { icons } from "../constants";

const SummaryCard = ({
  board: {
    title,
    active,
    creator: { username, avatar },
    completed,
  },
}) => {
  return (
    <View
      className={`flex-row mb-5 px-4 border-secondary-blue border-2 rounded-lg`}
      style={{
        backgroundColor: completed ? "#AFE1AF" : "#E5E7EB", // Conditional background
      }}
    >
      <View className="w-[46px] h-[46px] rounded-lg border justify-center items-center border-secondary-100 my-1">
        <Image
          source={{ uri: avatar }}
          className="w-full h-full rounded-lg"
          resizeMode="cover"
        />
      </View>
      <View className="flex-col ml-2 justify-center items-center">
        <Text className="font-retro">{title}</Text>
        <Text className="font-retro text-xs text-secondary-gray">
          {username}
        </Text>
      </View>
      <View className="justify-center items-center flex-row ml-auto">
        <Text>Active: </Text>
        {active ? (
          <Image source={icons.eye} className="w-5 h-5" resizeMode="contain" />
        ) : (
          <Image
            source={icons.eyeHide}
            className="w-5 h-5"
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );
};

export default SummaryCard;
