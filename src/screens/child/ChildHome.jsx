import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../../components/Avatar";
import PetStatsCard from "../../components/PetStatsCard";
import PinModal from "../../components/PinModal";
import Tasks from "../../components/Tasks";
import { useAppData } from "../../context/AppDataContext";
import { useMode } from "../../context/ModeContext";

export default function ChildHome() {
  const { setMode } = useMode();
  const { child, loading, pet } = useAppData();
  const [showPin, setShowPin] = useState(false);
  return (
    <SafeAreaView className="flex-1 px-4 pt-4">
      {/* Switch button */}
      <Pressable
        className="mt-4"
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
        <Ionicons name="swap-horizontal" size={40} color="#374151" />
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
        Welcome {loading ? "..." : child ? child.name : "Guest"}!
      </Text>
      {/* Avatar */}
      <View className="flex-row justify-center justify-evenly">
        <Avatar />
      </View>

      {/*Summary Card */}
      {/* Insert a card with summary for example 1/3 tasks done */}

      {/* Level */}
      <PetStatsCard
        health={child?.health ?? 0}
        hunger={child?.hunger ?? 0}
        happiness={child?.happiness ?? 0}
        loading={loading}
      />

      {/* Tasks / Cards */}
      <Tasks />
    </SafeAreaView>
  );
}
