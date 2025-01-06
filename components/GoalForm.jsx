import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React from "react";

const GoalForm = ({
  title,
  value,
  placeholder,
  handleChangeText,
  inputType = "text",
  options = [],
  otherStyles,
}) => {
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base font-retro text-secondary-blue">{title}</Text>

      {inputType === "text" && (
        <View className="w-full h-16 px-4 bg-secondary-lgray rounded-2xl items-center flex-row">
          <TextInput
            className="flex-1 text-white font-retro text-base"
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#7b7b8b"
            onChangeText={handleChangeText}
          />
        </View>
      )}

      {inputType === "number" && (
        <View className="w-full h-16 px-4 bg-secondary-lgray rounded-2xl items-center flex-row">
          <TextInput
            className="flex-1 text-white font-retro text-base"
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#7b7b8b"
            onChangeText={handleChangeText}
            keyboardType="numeric"
          />
        </View>
      )}

      {inputType === "colour" && (
        <View className="flex-row flex-wrap">
          {options.map((colour) => (
            <TouchableOpacity
              key={colour}
              style={{
                backgroundColor: colour,
                width: 40,
                height: 40,
                margin: 4,
                borderRadius: 4,
                borderWidth: colour === value ? 2 : 0,
                borderColor: "#FFF",
              }}
              onPress={() => handleChangeText(colour)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default GoalForm;
