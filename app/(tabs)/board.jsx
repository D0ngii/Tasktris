import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  Pressable,
  Animated,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import EmptyState from "../../components/EmptyState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getActiveBoard,
  getGoals,
  getCurrentUser,
  updateBoard,
  updateGoal,
} from "../../lib/appwrite";

const Board = () => {
  const { data: activeBoard, refetch } = useAppwrite(getActiveBoard);
  const { data: rawGoalsData } = useAppwrite(getGoals);
  const [refreshing, setRefreshing] = useState(false);
  const [boardData, setBoardData] = useState([]);
  const { data: user } = useAppwrite(getCurrentUser);
  const boardTitle = activeBoard?.title || "Get Started";
  const boardWidth = activeBoard?.width || 0;
  const [rawGoals, setRawGoals] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const skipInitRef = useRef(false);
  const CACHE_KEY_BOARD_DATA = "cachedBoardData";
  const CACHE_KEY_GOALS_DATA = "cachedGoalsData";

  // Lighten color helper function
  const lightenColor = (hex, amount = 0.3) => {
    const num = parseInt(hex.slice(1), 16);
    const r = (num >> 16) + Math.round((255 - (num >> 16)) * amount);
    const g =
      ((num >> 8) & 0x00ff) +
      Math.round((255 - ((num >> 8) & 0x00ff)) * amount);
    const b = (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * amount);
    const clamp = (value) => Math.min(255, Math.max(0, value));
    return `#${((1 << 24) | (clamp(r) << 16) | (clamp(g) << 8) | clamp(b))
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  };

  // Load cached board data
  useEffect(() => {
    const loadCachedBoardData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY_BOARD_DATA);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setBoardData(parsedData);
        }
      } catch (error) {
        console.error("Failed to load cached board data:", error);
      }
    };

    loadCachedBoardData();
  }, []);

  // Load cached goals data
  useEffect(() => {
    const loadCachedGoalsData = async () => {
      try {
        const cachedGoals = await AsyncStorage.getItem(CACHE_KEY_GOALS_DATA);
        if (cachedGoals) {
          const parsedGoals = JSON.parse(cachedGoals);
          setRawGoals(parsedGoals);
        }
      } catch (error) {
        console.error("Failed to load cached goals data:", error);
      }
    };

    loadCachedGoalsData();
  }, []);

  // Cache board data
  const cacheBoardData = async (data) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY_BOARD_DATA, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to cache board data:", error);
    }
  };

  // Cache goals data
  const cacheGoalsData = async (data) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY_GOALS_DATA, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to cache goals data:", error);
    }
  };

  // Update raw goals data when new data is available
  useEffect(() => {
    if (rawGoalsData) {
      setRawGoals(rawGoalsData);
      cacheGoalsData(rawGoalsData);
    }
  }, [rawGoalsData]);

  // Initialize board data with colors and states
  const initializeBoard = () => {
    if (!activeBoard) return;
    const boardDisplay = activeBoard?.board_display || [];
    const colourDisplay = activeBoard?.colour_display || [];

    const data = [];
    for (let i = 0; i < boardDisplay.length; i += boardWidth) {
      const row = boardDisplay
        .slice(i, i + boardWidth)
        .map((cell, cellIndex) => ({
          goal_id: cell,
          pressed: cell === "-1",
          colour:
            colourDisplay[i + cellIndex] ??
            (cell === "0" ? "#979E9E" : "#555555"),
          animatedValue: new Animated.Value(1),
        }));
      data.push(row);
    }

    setBoardData(data);
    cacheBoardData(data); // Cache data
  };

  // Initialize board on mount
  useEffect(() => {
    if (!skipInitRef.current) {
      initializeBoard();
    }
  }, [activeBoard, rawGoals]);

  const handleCellPress = async (cell, rowIndex, cellIndex) => {
    if (isUpdating) return;
    if (cell.pressed || cell.goal_id === "0" || cell.goal_id === "-1") return;

    const animatedValue = boardData[rowIndex][cellIndex].animatedValue;
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: 100, // Scale up
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100, // Scale back
        useNativeDriver: true,
      }),
    ]).start();

    setIsUpdating(true);
    skipInitRef.current = true;

    const og_goal = cell.goal_id;

    const newData = boardData.map((row, i) =>
      row.map((c, j) =>
        i === rowIndex && j === cellIndex
          ? {
              ...c,
              pressed: true,
              goal_id: "-1",
              colour: lightenColor(c.colour, 0.5),
            }
          : c
      )
    );

    setBoardData(newData);
    cacheBoardData(newData); // Cache updated data

    const goal = rawGoals.documents.find((g) => g.goal_id === og_goal);
    const newCurrentNum = Math.min(
      (goal?.current_num || 0) + 1,
      goal?.goal_num || 0
    );
    const finished_flag = newCurrentNum === goal?.goal_num;

    setRawGoals((prevGoals) => {
      const updatedGoals = prevGoals.documents.map((goal) => {
        if (goal.goal_id === og_goal) {
          goal.current_num = Math.min(goal.current_num + 1, goal.goal_num);
        }
        return goal;
      });

      return { documents: updatedGoals };
    });
    cacheGoalsData({ documents: rawGoals.documents });

    try {
      await Promise.all([
        updateBoard(
          newData.flatMap((row) => row.map((c) => c.goal_id)),
          newData.flatMap((row) => row.map((cell) => cell.colour))
        ),
        updateGoal(og_goal, finished_flag),
      ]);
    } catch (error) {
      console.error("Failed to update board/colours", error);
      refetch();
    } finally {
      setIsUpdating(false);
      skipInitRef.current = false;
    }
  };

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-charcoal h-full">
      <FlatList
        data={boardData}
        keyExtractor={(item, index) => `row-${index}`}
        ListHeaderComponent={() => (
          <View className="flex my-3 px-4 py-2 space-y-6 ">
            <View className="flex justify-between items-start flex-row">
              <View>
                <Text className="font-retro text-sm text-gray-100">
                  Welcome Back
                </Text>
                <Text className="text-2xl font-retro text-white">
                  {user.username}
                </Text>
              </View>
              <View className="mt-1.5">
                <Image
                  source={images.logoSmall}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>
            <View className="w-[80%] mx-auto border bg-secondary-blue rounded-md">
              <Text className="text-center font-retro text-2xl text-black">
                {boardTitle}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Board Found"
            subtitle="What are you waiting for?"
          />
        )}
        renderItem={({ item: row, index: rowIndex }) => (
          <View className="flex-row justify-center space-x-1 mt-1">
            {row.map((cell, cellIndex) => {
              return (
                <Pressable
                  key={`cell-${cellIndex}`}
                  onPress={() => handleCellPress(cell, rowIndex, cellIndex)}
                >
                  <Animated.View
                    className="h-10 w-10 flex justify-center items-center rounded-lg"
                    style={{
                      backgroundColor: cell.colour,
                      margin: 2,
                      transform: [{ scale: cell.animatedValue }],
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
        )}
        ListFooterComponent={() =>
          rawGoals?.documents && rawGoals?.documents.length > 0 ? (
            <View className="mt-5 w-[90%] p-4 mx-auto rounded-md bg-secondary-new border-secondary-blue border-2">
              <Text className="text-center font-retro">Key</Text>
              {rawGoals.documents.map((goal) => (
                <View
                  key={goal.$id}
                  className="flex flex-row items-center mb-2 justify-center"
                >
                  <View
                    className="w-6 h-6 rounded-lg mr-6"
                    style={{ backgroundColor: goal.colour }}
                  />
                  <Text className="font-retro">{goal.title}</Text>
                  <Text className="font-retro pl-[80px]">
                    {goal.current_num}/{goal.goal_num}
                  </Text>
                </View>
              ))}
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Board;
