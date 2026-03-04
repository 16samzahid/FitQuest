import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { completeTask } from "../services/taskService";

export default function TaskCard({
  taskID = "undefined",
  color = "bg-red-500",
  text = "Task Name",
  xp = 10,
  onComplete,
}) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleCheckPress = () => {
    // animate away first
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      delay: 0,
      useNativeDriver: true,
    }).start(() => {
      // after animation, call service and parent
      completeTask(taskID);
      onComplete && onComplete(taskID);
    });
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -500],
  });

  return (
    <>
      <Animated.View style={{ transform: [{ translateX }] }} className="mb-6">
        {/* Card container with colored bar on left */}
        <View
          className="flex-row h-24 rounded-3xl bg-white border-8 border-[#D2D2D2]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 3, height: 5 },
            shadowOpacity: 0.5,
            shadowRadius: 3.84,
            elevation: 5,
            borderRadius: 30,
          }}
        >
          {/* Colored left bar */}
          <View className={`w-16 ${color} rounded-l-3xl`} />

          {/* Content area with spaced text and controls */}
          <View className="flex-1 px-4 py-4">
            <View className="flex-row items-center justify-between">
              {/* Task title */}
              <Text className="text-lg font-semibold">{text}</Text>

              {/* Right side controls */}
              <View className="flex-row items-center space-x-3">
                <View className="rounded-full bg-lightGray px-3 py-1 border-2 border-gray-200 shadow-sm">
                  <Text className="text-sm font-bold">{xp} XP</Text>
                </View>
                <TouchableOpacity
                  className="bg-green-500 rounded-full border-2 border-green-600 items-center justify-center ml-2"
                  style={{ width: 44, height: 44 }}
                  onPress={handleCheckPress}
                >
                  <FontAwesome name="check" size={20} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}
