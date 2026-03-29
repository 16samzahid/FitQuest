import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../../config/FirebaseConfig.js";
import { useAppData } from "../../context/AppDataContext";
import { useMode } from "../../context/ModeContext";
import { editChildName, editParentPin } from "../../services/userService";

const Settings = () => {
  const { setMode } = useMode();
  const { child, parent } = useAppData();

  const [showPin, setShowPin] = useState(false);
  const [nameModal, setNameModal] = useState(false);
  const [pinModal, setPinModal] = useState(false);

  const [newName, setNewName] = useState(child?.name || "");
  const [newPin, setNewPin] = useState(parent?.pin || "");

  const handleSaveName = () => {
    editChildName(child.id, newName);
    setNameModal(false);
  };

  const handleSavePin = () => {
    editParentPin(parent.id, newPin);
    setPinModal(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 px-5">
        {/* Header */}
        <Text className="text-[#7F7DCE] text-[30px] font-black text-center mt-2 mb-6">
          Settings
        </Text>

        {/* Switch mode */}
        <Pressable
          onPress={() => setMode("child")}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 10,
          }}
        >
          <Ionicons name="swap-horizontal" size={28} color="#374151" />
        </Pressable>

        {/* CHILD NAME */}
        <View className="bg-[#ECEBFF] p-4 rounded-2xl mb-5">
          <Text className="text-[#150F59] text-lg font-bold mb-3">
            Child Name
          </Text>

          <View className="flex-row items-center justify-between">
            {/* white info box */}
            <View className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
              <Text className="text-lg text-[#150F59]">
                {child?.name || "Not set"}
              </Text>
            </View>

            {/* round edit button */}
            <Pressable
              onPress={() => setNameModal(true)}
              className="ml-3 w-10 h-10 rounded-full bg-[#4F46E5] items-center justify-center"
            >
              <MaterialCommunityIcons name="pencil" size={18} color="white" />
            </Pressable>
          </View>
        </View>

        {/* PARENT PIN */}
        <View className="bg-[#ECEBFF] p-4 rounded-2xl mb-5">
          <Text className="text-[#150F59] text-lg font-bold mb-3">
            Parent PIN
          </Text>

          <View className="flex-row items-center justify-between">
            {/* white info box */}
            <View className="flex-1 flex-row items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
              <Text className="text-lg text-[#150F59]">
                {showPin ? parent?.pin : "****"}
              </Text>

              <Pressable onPress={() => setShowPin(!showPin)}>
                <Ionicons
                  name={showPin ? "eye-off" : "eye"}
                  size={20}
                  color="#6B7280"
                />
              </Pressable>
            </View>

            {/* edit button */}
            <Pressable
              onPress={() => setPinModal(true)}
              className="ml-3 w-10 h-10 rounded-full bg-[#4F46E5] items-center justify-center"
            >
              <MaterialCommunityIcons name="pencil" size={18} color="white" />
            </Pressable>
          </View>
        </View>

        {/* LOGOUT */}
        <View className="flex-1 justify-end pb-6">
          <Pressable
            onPress={() => signOut(auth)}
            className="bg-[#e54646] rounded-xl py-4 items-center"
          >
            <Text className="text-white text-lg font-semibold">Log Out</Text>
          </Pressable>
        </View>
      </View>

      {/* EDIT NAME MODAL */}
      <Modal visible={nameModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-5">
            <Text className="text-xl font-bold mb-3 text-[#150F59]">
              Edit Child Name
            </Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              className="border border-gray-200 rounded-lg p-3 mb-4 text-lg"
            />

            <View className="flex-row justify-end">
              <Pressable
                onPress={() => setNameModal(false)}
                className="mr-3 px-4 py-2 bg-gray-200 rounded-full"
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => handleSaveName()}
                className="px-4 py-2 bg-indigo-600 rounded-full"
              >
                <Text className="text-white">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT PIN MODAL */}
      <Modal visible={pinModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-5">
            <Text className="text-xl font-bold mb-3 text-[#150F59]">
              Edit Parent PIN
            </Text>

            <TextInput
              value={newPin}
              onChangeText={setNewPin}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              className="border border-gray-200 rounded-lg p-3 mb-4 text-lg"
            />

            <View className="flex-row justify-end">
              <Pressable
                onPress={() => setPinModal(false)}
                className="mr-3 px-4 py-2 bg-gray-200 rounded-full"
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => handleSavePin()}
                className="px-4 py-2 bg-indigo-600 rounded-full"
              >
                <Text className="text-white">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;
