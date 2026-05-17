// child home screen
// this is the main daily screen where the child sees their pet, stats and tasks
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
  // setMode is used to switch from child mode to parent mode after the pin is correct
  const { setMode } = useMode();

  // get the child data and level-up state from the global app data context
  const {
    child,
    loading,
    lastSeenLevel,
    setLastSeenLevel,
    pendingLevelUp,
    setPendingLevelUp,
  } = useAppData();

  // controls whether the parent pin modal is shown
  const [showPin, setShowPin] = useState(false);

  // controls whether the welcome message appears for new users
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // controls the level-up popup when the child gains a level
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showLevel, setShowLevel] = useState(null);

  // checks whether this screen is currently active
  // this avoids showing the level-up modal on the wrong screen
  const isFocused = useIsFocused();

  const handleCloseWelcomeModal = async () => {
    try {
      // save that the welcome message has been seen so it does not show every time
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
    // wait until the child data has loaded before checking the welcome modal
    if (!child || loading) return;

    // show the welcome modal only if this child has not seen it before
    if (child.hasSeenWelcomeMessage === false) {
      setShowWelcomeModal(true);
    } else {
      setShowWelcomeModal(false);
    }
  }, [child, loading]);

  useEffect(() => {
    // show the level-up modal only when there is a pending level-up
    // and the child home screen is currently focused
    if (loading || !child || !isFocused || pendingLevelUp == null) return;

    setShowLevel(pendingLevelUp);
    setShowLevelUpModal(true);
  }, [child, loading, isFocused, pendingLevelUp]);

  return (
    <SafeAreaView className="flex-1 px-4 pt-4" edges={["top"]}>
      {/* welcome modal for first-time users */}
      <WelcomeModal
        visible={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
      />

      {/* level-up modal shown when the child reaches a new level */}
      <LevelUpModal
        visible={showLevelUpModal}
        level={showLevel}
        onClose={() => {
          // close the popup and mark the current level as seen
          setShowLevelUpModal(false);
          setPendingLevelUp(null);
          setLastSeenLevel(child?.level ?? 0);
        }}
      />

      {/* button used to open the parent pin modal */}
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

      {/* pin modal protects access to parent mode */}
      <PinModal
        visible={showPin}
        onClose={() => setShowPin(false)}
        onSuccess={() => {
          // switch to parent mode only after the correct pin is entered
          setShowPin(false);
          setMode("parent");
        }}
      />

      {/* personalised greeting using the child's name */}
      <Text className="text-2xl font-bold text-center text-indigo-700">
        Welcome {loading ? "..." : child ? child.name : "Guest"}!
      </Text>

      {/* pet avatar display with speech bubble for child feedback */}
      <View className="flex-row justify-center justify-evenly">
        <Avatar
          health={child?.health ?? 0}
          happiness={child?.happiness ?? 0}
          hunger={child?.hunger ?? 0}
          showSpeechBubble={true}
        />
      </View>

      {/* shows the pet's current health, hunger and happiness stats */}
      <PetStatsCard
        health={child?.health ?? 0}
        hunger={child?.hunger ?? 0}
        happiness={child?.happiness ?? 0}
        loading={loading}
      />

      {/* shows how many tasks the child has completed today */}
      <TasksCompleted />

      {/* main list of tasks the child can complete */}
      <Tasks />
    </SafeAreaView>
  );
}
