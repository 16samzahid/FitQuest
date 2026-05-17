// approve task card
// this card is shown in the parent dashboard for tasks waiting for approval
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { approveTask, rejectTask } from "../services/taskService";

export default function ApproveTaskCard({
  text = "Task Name",
  xp = 10,
  taskID,
}) {
  // animated value used to slide the card away after approve/reject
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateAndCall = (callback) => {
    // slide the card left first, then run the approve or reject action
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      callback();
    });
  };

  const handleReject = () => {
    // reject sends the task back to "notdone" so the child can try again
    animateAndCall(() => rejectTask(taskID));
  };

  const handleConfirm = () => {
    // approve marks the task as approved and gives the child their rewards
    animateAndCall(() => approveTask(taskID));
  };

  // converts the animation value into horizontal movement
  // this makes the whole card slide off screen
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
        {/* small accent bar to make the card stand out visually */}
        <View className="absolute left-0 h-[70%] w-[6px] bg-[#4F46E5] rounded-r-full" />

        {/* task information */}
        <View className="ml-3">
          {/* task description */}
          <Text className="text-[#1E1B8F] text-[16px] font-semibold">
            {text}
          </Text>

          {/* xp reward shown so the parent knows what the child will receive */}
          <Text className="text-[#7F7DCE] text-[13px] mt-1">
            Reward: {xp} XP
          </Text>
        </View>

        {/* approve/reject buttons */}
        <View className="flex-row gap-2">
          {/* reject button */}
          <Pressable
            onPress={handleReject}
            className="w-10 h-10 rounded-full bg-[#EF4444] items-center justify-center active:scale-95"
          >
            <MaterialCommunityIcons name="close" size={20} color="white" />
          </Pressable>

          {/* confirm/approve button */}
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
