import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { approveTask, rejectTask } from "../services/taskService";

export default function ApproveTaskCard({
  text = "Task Name",
  xp = 10,
  taskID,
}) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateAndCall = (callback) => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      callback();
    });
  };

  const handleReject = () => {
    animateAndCall(() => rejectTask(taskID));
  };

  const handleConfirm = () => {
    animateAndCall(() => approveTask(taskID));
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -500],
  });

  return (
    <Animated.View style={{ transform: [{ translateX }] }}>
      <View
        className="flex-row items-center justify-between px-5 py-4 rounded-[24px] bg-[#ECEBFF] mb-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        {/* Accent bar */}
        <View className="absolute left-0 h-[70%] w-[6px] bg-[#4F46E5] rounded-r-full" />

        {/* Left Side */}
        <View className="ml-3">
          <Text className="text-[#1E1B8F] text-[16px] font-semibold">
            {text}
          </Text>

          <Text className="text-[#7F7DCE] text-[13px] mt-1">
            Reward: {xp} XP
          </Text>
        </View>

        {/* Right Side Buttons */}
        <View className="flex-row gap-2">
          {/* Reject */}
          <Pressable
            onPress={handleReject}
            className="w-10 h-10 rounded-full bg-[#EF4444] items-center justify-center active:scale-95"
          >
            <MaterialCommunityIcons name="close" size={20} color="white" />
          </Pressable>

          {/* Confirm */}
          <Pressable
            onPress={handleConfirm}
            className="w-10 h-10 rounded-full bg-[#4F46E5] items-center justify-center active:scale-95"
          >
            <MaterialCommunityIcons name="check" size={20} color="white" />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
