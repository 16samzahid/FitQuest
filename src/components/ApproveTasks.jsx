import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import ApproveTaskCard from "./ApproveTaskCard";

export default function ApproveTasks() {
  const [helpVisible, setHelpVisible] = useState(false);

  return (
    <>
      <View className="mt-5 bg-white rounded-t-[40px] shadow-md flex-1">
        <View className="flex-row items-center mt-4 justify-between px-4">
          <Text className="text-[#150F59] text-[20px] font-bold m-2">
            Tasks Awaiting Approval
          </Text>

          <Pressable onPress={() => setHelpVisible(true)}>
            <FontAwesome name="question-circle" size={24} color="black" />
          </Pressable>
        </View>

        <ScrollView
          className="mt-4 p-2 rounded-t-[40px]"
          showsVerticalScrollIndicator={false}
        >
          <ApproveTaskCard text="Do 20 push-ups" xp={20} />
          <ApproveTaskCard text="Eat a healthy meal" xp={15} />
          <ApproveTaskCard text="Read for 30 minutes" xp={10} />
        </ScrollView>
      </View>

      {/* 🔵 Help Modal */}
      <Modal
        visible={helpVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-white rounded-[30px] p-6 w-full shadow-lg">
            <Text className="text-[#150F59] text-xl font-bold mb-4">
              Task Approval
            </Text>

            <Text className="text-gray-700 text-base leading-6">
              These are tasks your child has marked as completed.
              {"\n\n"}
              Please confirm if the task was done correctly, or reject if it was
              not completed.
              {"\n\n"}
              You can view all tasks in the Tasks tab at the bottom.
            </Text>

            <Pressable
              onPress={() => setHelpVisible(false)}
              className="mt-6 bg-indigo-600 py-3 rounded-full items-center"
            >
              <Text className="text-white font-semibold">Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
