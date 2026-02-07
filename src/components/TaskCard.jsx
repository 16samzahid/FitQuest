import { Text, View } from "react-native";

export default function TaskCard({ color = "bg-red-500", text = "Task Name" }) {
  return (
    <View className="mb-6">
      {/* Card container with colored bar on left */}
      <View className="flex-row h-24 rounded-3xl bg-white overflow-hidden border-8 border-[#A4A4A4] shadow-lg">
        {/* Colored left bar */}
        <View className={`w-16 ${color} rounded-r-xl`} />

        {/* Empty content area */}
        <View className="flex-1">
          <Text className="text-lg font-semibold p-4 align-middle justify-center">
            {text}
          </Text>
        </View>
      </View>
    </View>
  );
}
