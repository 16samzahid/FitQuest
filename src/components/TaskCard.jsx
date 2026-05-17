// task card shown in the child's task list
// this shows the task name, xp reward, colour category and completion button
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
  // animated value used to slide the task card away after completion
  const slideAnim = useRef(new Animated.Value(0)).current;

  const playSound = async () => {
    try {
      // load and play the congratulations sound when a task is completed
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/congrats.mp3"),
      );
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const handleCheckPress = () => {
    // slide the card left before updating the task status
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      delay: 0,
      useNativeDriver: true,
    }).start(() => {
      // once the animation finishes, mark the task as complete in firestore
      completeTask(taskID);

      // tell the parent Tasks component that this task was completed
      // this is used to remove the task locally and trigger confetti
      onComplete && onComplete(taskID);
    });

    // play the completion sound at the same time as the animation
    playSound();
  };

  // converts slideAnim from 0 to 1 into a left movement across the screen
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -500],
  });

  return (
    <>
      {/* animated wrapper lets the whole card slide away when completed */}
      <Animated.View style={{ transform: [{ translateX }] }} className="mb-6">
        {/* card container with border, shadow and rounded corners */}
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
          {/* coloured left bar shows the task category/stat type */}
          <View className={`w-16 ${color} rounded-l-3xl`} />

          {/* main task content area */}
          <View className="flex-1 px-4 py-4">
            <View className="flex-row items-start justify-between">
              {/* task description */}
              <Text className="flex-1 text-lg font-semibold pr-2">{text}</Text>

              {/* xp badge and complete button */}
              <View className="flex-row items-center ml-2">
                {/* shows how much xp the child earns for this task */}
                <View className="rounded-full bg-white px-3 py-1 border-4 border-lightGray shadow-sm mr-2">
                  <Text className="text-sm font-bold">{xp} XP</Text>
                </View>

                {/* button the child presses when they have completed the task */}
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
