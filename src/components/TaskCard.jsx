import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Audio } from "expo-av";
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
  // Animated value for sliding the card away on completion
  // also play congrats sound effect
  const slideAnim = useRef(new Animated.Value(0)).current;

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/congrats.mp3"),
      );
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

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
    playSound();
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
          className="flex-row min-h-24 rounded-3xl bg-white border-8 border-[#D2D2D2]"
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
            <View className="flex-row items-start justify-between">
              {/* Task title */}
              <Text className="flex-1 text-lg font-semibold pr-2">{text}</Text>

              {/* Right side controls */}
              <View className="flex-row items-center ml-2">
                <View className="rounded-full bg-white px-3 py-1 border-4 border-lightGray shadow-sm mr-2">
                  <Text className="text-sm font-bold">{xp} XP</Text>
                </View>

                <TouchableOpacity
                  className="bg-green rounded-full border-2 border-green items-center justify-center shadow-sm"
                  style={{ width: 44, height: 44 }}
                  onPress={handleCheckPress}
                >
                  <FontAwesome name="check" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}
