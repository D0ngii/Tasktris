import { View, Text, FlatList, Image, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchInput from "../../components/SearchInput";
import EmptyState from "../../components/EmptyState";
import { getUserBoards, signOut } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import SummaryCard from "../../components/SummaryCard";
import VideoCard from "../../components/VideoCard";

import { router, useLocalSearchParams } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import { TouchableOpacity } from "react-native";
import { icons } from "../../constants";
import InfoBox from "../../components/InfoBox";
import { NodeBuilderFlags } from "typescript";
const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const { data: boards, refetch } = useAppwrite(() => getUserBoards(user.$id));
  const [refreshing, setRefreshing] = useState();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);
    router.replace("/sign-in");
  };

  const getCompleted = () => {
    let completed = 0;
    for (let i = 0; i < boards.length; i++) {
      if (boards[i].completed) {
        completed++;
      }
    }
    return completed;
  };
  return (
    <SafeAreaView className="bg-charcoal h-full">
      <FlatList
        data={boards}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <SummaryCard board={item} />}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              className="w-full items-end mb-10"
              onPress={logout}
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>
            <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>
            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />
            <View className="mt-5 flex-row">
              <InfoBox
                title={boards.length || 0}
                subtitle="Boards"
                containerStyles="mr-10"
                titleStyles="text-xl"
              />
              <InfoBox
                title={getCompleted()}
                subtitle="Completed"
                titleStyles="text-xl"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this search query"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Profile;
