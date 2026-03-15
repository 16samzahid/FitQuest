import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, Text, View } from "react-native";

export default function EditTaskCard({
  text = "Task Name",
  title = "Task Title",
  dueDate = null,
  recurrence = null,
}) {
  return (
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
        <Text className="text-[#1E1B8F] text-[16px] font-semibold">{text}</Text>

        {title !== "Today's Tasks" && (
          <Text className="text-[#7F7DCE] text-[13px] mt-1">
            {title === "Upcoming Tasks"
              ? "Due:"
              : title === "Repeating Tasks"
                ? "Every"
                : ""}
          </Text>
        )}
      </View>

      {/* Right Side */}
      <Pressable
        className="w-10 h-10 rounded-full bg-[#4F46E5] items-center justify-center active:scale-95"
        style={{
          shadowColor: "#4F46E5",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <MaterialCommunityIcons name="pencil" size={18} color="white" />
      </Pressable>
    </View>
  );
}
