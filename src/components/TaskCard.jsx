import { Text, View } from "react-native";

export default function TaskCard({
  color = "bg-red-500",
  text = "Task Name",
  xp = 10,
}) {
  return (
    <View className="mb-6">
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

        {/* Empty content area */}
        <View className="flex-1">
          <Text className="text-lg font-semibold p-4 align-middle justify-center">
            {text}
          </Text>
          <View className="absolute bottom-4 right-4 rounded-full bg-lightGray px-3 py-1 border-2 border-gray-200 shadow-sm">
            <Text className="text-sm font-bold">{xp} XP</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
