import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../config/FirebaseConfig";
import Avatar from "../../components/Avatar";
import LevelUpModal from "../../components/LevelUpModal";
import PetStatsCard from "../../components/PetStatsCard";
import PinModal from "../../components/PinModal";
import Tasks from "../../components/Tasks";
import TasksCompleted from "../../components/TasksCompleted";
import WelcomeModal from "../../components/WelcomeModal";
import { useAppData } from "../../context/AppDataContext";
import { useMode } from "../../context/ModeContext";

export default function ChildHome() {
  const { setMode } = useMode();
  const {
    child,
    loading,
    lastSeenLevel,
    setLastSeenLevel,
    pendingLevelUp,
    setPendingLevelUp,
  } = useAppData();
  const [showPin, setShowPin] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showLevel, setShowLevel] = useState(null);
  const isFocused = useIsFocused();

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

  useEffect(() => {
    if (loading || !child || !isFocused || pendingLevelUp == null) return;

    setShowLevel(pendingLevelUp);
    setShowLevelUpModal(true);
  }, [child, loading, isFocused, pendingLevelUp]);

  return (
    <SafeAreaView className="flex-1 px-4 pt-4" edges={["top"]}>
      <WelcomeModal
        visible={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
      />
      <LevelUpModal
        visible={showLevelUpModal}
        level={showLevel}
        onClose={() => {
          setShowLevelUpModal(false);
          setPendingLevelUp(null);
          setLastSeenLevel(child?.level ?? 0);
        }}
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
      {/* Avatar component shows the pet, mood, and speech bubble. */}
      <View className="flex-row justify-center justify-evenly">
        <Avatar
          health={child?.health ?? 0}
          happiness={child?.happiness ?? 0}
          hunger={child?.hunger ?? 0}
          showSpeechBubble={true}
        />
      </View>

      {/* Pet stats card displays health, hunger, and happiness values. */}
      <PetStatsCard
        health={child?.health ?? 0}
        hunger={child?.hunger ?? 0}
        happiness={child?.happiness ?? 0}
        loading={loading}
      />
      {/* Completed task summary for today. */}
      <TasksCompleted />

      {/* Main task list for the child. */}
      <Tasks />
    </SafeAreaView>
  );
}
