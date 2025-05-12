import { StatusBar } from "expo-status-bar";
import { Image, ScrollView, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import { CustomButton } from "../components";
import { useGlobalContext } from "../context/GlobalProvider";
import { styleSheet } from 'nativewind';
import { useEffect } from "react";
export default function App() {
  const { loading, isLoggedIn } = useGlobalContext();
  if (!loading && isLoggedIn) return <Redirect href="/board" />;
  useEffect(() => {
    if (!loading && isLoggedIn) {
      router.push("/board"); // Perform the manual redirect when the user is logged in
    }
  }, [loading, isLoggedIn]);
  return (
    <SafeAreaView className="bg-charcoal">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full justify-center items-center min-h-[85vh] px-4">
          <Image
            source={images.logoSmall}
            className="w-[180px] h-[180px]"
            resizeMode="contain"
          />
          <View className="relative mt-5">
            <Text className="text-5xl font-pnew text-white mb-10 text-center">
              TaskTris
            </Text>
            {/* Still need to add a picture in here probably */}
            <Text className="text-xl text-secondary-blue font-pnew text-center">
              Gamify your goals
            </Text>
            <Text className="text-l text-secondary-blue font-pnew text-center">
              and
            </Text>
            <Text className="text-xl text-secondary-blue font-pnew text-center">
              Boost Productivity!
            </Text>
          </View>
          <CustomButton
            title="Get Started"
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-full mt-7 "
            textStyles="text-white"
          />
        </View>
      </ScrollView>
      <StatusBar backgroundColor="#161622" style="light" />
      {/* This will make the time and stuff on iphone light since our background is dark*/}
    </SafeAreaView>
  );
}
