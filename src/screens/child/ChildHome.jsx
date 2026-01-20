import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Avatar from "../../components/Avatar";
import LevelCoinSection from "../../components/LevelCoinSection";
import PinModal from "../../components/PinModal";
import TaskCard from "../../components/TaskCard";
import { useMode } from "../../context/ModeContext";

export default function ChildHome() {
  const { setMode } = useMode();
  const childName = "Sam";
  const [showPin, setShowPin] = useState(false);
  return (
    <View className="flex-1 px-4 pt-4">
      {/* Switch button */}
      <Pressable
        onPress={() => setShowPin(true)}
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          zIndex: 10,
          padding: 10,
          elevation: 10,
        }}
      >
        <Ionicons name="swap-horizontal" size={26} color="#374151" />
      </Pressable>

      {/* PIN overlay */}
      <PinModal
        visible={showPin}
        onClose={() => setShowPin(false)}
        onSuccess={() => {
          setShowPin(false);
          setMode("parent");
        }}
      />

      <Text className="text-2xl font-bold text-center text-indigo-700">
        Welcome {childName}!
      </Text>
      {/* Avatar */}
      <View className="flex-row justify-center mt-4 justify-evenly">
        <Avatar />
        {/* Stats */}
        {/*insert stats card here with health, happiness, hunger*/}
      </View>

      {/*Summary Card */}
      {/* Insert a card with summary for example 1/3 tasks done */}

      {/* Level */}
      <LevelCoinSection />

      {/* Tasks / Cards */}
      <Text className="text-indigo-700 font-semibold mt-2 text-lg text-center">
        Tasks
      </Text>
      <ScrollView className="mt-6 space-y-4 mb-4">
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
      </ScrollView>
    </View>
  );
}
