import Ionicons from "@expo/vector-icons/Ionicons";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../config/FirebaseConfig";
import Avatar from "../../components/Avatar";
import PetStatsCard from "../../components/PetStatsCard";
import PinModal from "../../components/PinModal";
import Tasks from "../../components/Tasks";
import TasksCompleted from "../../components/TasksCompleted";
import WelcomeModal from "../../components/WelcomeModal";
import { useAppData } from "../../context/AppDataContext";
import { useMode } from "../../context/ModeContext";

export default function ChildHome() {
  const { setMode } = useMode();
  const { child, loading } = useAppData();
  const [showPin, setShowPin] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const handleCloseWelcomeModal = async () => {
    try {
      await updateDoc(doc(db, "Child", child.id), {
        hasSeenWelcomeMessage: true,
      });
      setShowWelcomeModal(false);
    } catch (error) {
      console.error("Error updating welcome message flag:", error);
      setShowWelcomeModal(false);
    }
  };
  useEffect(() => {
    if (!child || loading) return;

    if (child.hasSeenWelcomeMessage === false) {
      setShowWelcomeModal(true);
    } else {
      setShowWelcomeModal(false);
    }
  }, [child, loading]);
  return (
    <SafeAreaView className="flex-1 px-4 pt-4" edges={["top"]}>
      <WelcomeModal
        visible={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
      />
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
        <Avatar
          health={child?.health ?? 0}
          happiness={child?.happiness ?? 0}
          hunger={child?.hunger ?? 0}
          showSpeechBubble={true}
        />
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
      <TasksCompleted />

      {/* Tasks / Cards */}
      <Tasks />
    </SafeAreaView>
  );
}
