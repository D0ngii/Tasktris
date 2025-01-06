import {
  View,
  Text,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import GoalForm from "../../components/GoalForm";
import { CustomButton } from "../../components";
import { Redirect, router } from "expo-router";
import { getCurrentUser, signIn, newBoard } from "../../lib/appwrite";

const createBoard = () => {
  const [form, setForm] = useState({
    title: "",
    duration: "",
  });
  const [isSubmitting, setisSubmitting] = useState(false);

  const submit = async () => {
    if (!form.title || !form.duration) {
      Alert.alert("Error", "Please fill in all the fields");
      return;
    }

    const durationInt = parseInt(form.duration, 10);
    if (isNaN(durationInt)) {
      Alert.alert("Error", "Duration must be a valid number");
      return;
    }

    setisSubmitting(true);
    try {
      // const userDocs = await getCurrentUser(); // Ensure this returns a valid user
      await newBoard(
        // creator: userDocs,
        form.title,
        durationInt
      );

      router.replace("/tetris/goals");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setisSubmitting(false);
    }
  };
  const back = () => {
    router.replace("/board");
  };
  return (
    <SafeAreaView className="bg-charcoal h-full">
      <TouchableOpacity
        className="bg-secondary-new w-[50px] h-[25px] rounded-md justify-center ml-2"
        onPress={back}
      >
        <Text className="text-md font-retro text-center">Back</Text>
      </TouchableOpacity>
      <View className="mt-20">
        <GoalForm
          title="Tetris Board Title"
          inputType="text"
          value={form.title}
          handleChangeText={(e) => setForm({ ...form, title: e })}
          placeholder="Whats your board's name?"
        />
      </View>
      <View className="mt-10">
        <GoalForm
          title="Duration"
          inputType="number"
          value={form.duration}
          handleChangeText={(e) =>
            setForm({ ...form, duration: e ? parseInt(e, 10) : "" })
          }
          placeholder="How long's this board gonna last"
        />
      </View>
      <CustomButton
        title="Create"
        handlePress={submit}
        // CREATE BOARD FOR THE USER IN DATABASE
        containerStyles="w-full mt-14"
        textStyles="text-white"
        isLoading={isSubmitting}
      />
    </SafeAreaView>
  );
};

export default createBoard;
