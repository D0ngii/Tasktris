import React, { useState } from "react";
import { View, Button, SafeAreaView, Alert } from "react-native";
import GoalForm from "../../components/GoalForm";
import { CustomButton } from "../../components";
import { newGoal, getGoals, setBoard } from "../../lib/appwrite";
import { Redirect, router } from "expo-router";

const Goals = () => {
  const [form, setForm] = useState({
    title: "",
    number: "",
    colour: "",
  });

  const [isSubmitting, setisSubmitting] = useState(false);
  const [hasGoal, setHasGoal] = useState(false);
  const submit = async () => {
    console.log("Form Data:", form); // This will log the entire form object

    if (!form.title || !form.number || !form.colour) {
      Alert.alert("Error", "Please fill in all the fields");
      return;
    }

    const numberInt = parseInt(form.number, 10);
    if (isNaN(numberInt)) {
      Alert.alert("Error", "Duration must be a valid number");
      return;
    }

    setisSubmitting(true);
    try {
      // const userDocs = await getCurrentUser(); // Ensure this returns a valid user
      await newGoal(form.title, numberInt, form.colour);
      setHasGoal(true);
      router.replace("/tetris/goals");
    } catch (error) {
      Alert.alert("Error", error.message);
      return;
    } finally {
      setisSubmitting(false);
    }
  };

  const finish = async () => {
    const goals = await getGoals();
    if (goals.total === 0) {
      Alert.alert("Error", "Add at least one goal");
      return;
    }

    try {
      // const userDocs = await getCurrentUser(); // Ensure this returns a valid user
      let task_count = 0;
      for (const goal of goals.documents) {
        task_count += goal.goal_num;
        // console.log("GOAL NUM", goal.goal_num);
      }
      const dimensions = Math.ceil(Math.sqrt(task_count));
      // console.log("DIMENSIONS: ", dimensions);
      await setBoard(dimensions);
      router.replace("/board");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setisSubmitting(false);
    }
  };
  return (
    <SafeAreaView className="bg-charcoal h-full">
      <View className="mt-5 mx-3">
        <View style={{ padding: 16 }}>
          <GoalForm
            title="Goal Title"
            value={form.title}
            placeholder="Enter goal title"
            handleChangeText={(value) => setForm({ ...form, title: value })}
            inputType="text"
            otherStyles="mt-7"
          />

          <GoalForm
            title="Goal Number"
            value={form.number}
            placeholder="Enter goal number"
            handleChangeText={(value) => setForm({ ...form, number: value })}
            inputType="number"
            otherStyles="mt-7"
          />

          <GoalForm
            title="Goal colour"
            value={form.colour}
            handleChangeText={(value) => setForm({ ...form, colour: value })}
            inputType="colour"
            options={["#FF5733", "#33FF57", "#3357FF", "#F333FF"]} // List of colour options
            otherStyles="mt-7"
          />

          {/* <Button title="Submit Goal" onPress={submit} /> */}
          <CustomButton
            title="Submit Goal"
            handlePress={submit}
            // CREATE BOARD FOR THE USER IN DATABASE
            containerStyles="mt-10 justify-center items-center"
            textStyles="text-white font-retro"
            isLoading={isSubmitting}
          />

          <CustomButton
            title="Finish"
            handlePress={finish}
            // CREATE BOARD FOR THE USER IN DATABASE
            containerStyles="w-full mt-40"
            textStyles="text-white"
            isLoading={isSubmitting}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Goals;
