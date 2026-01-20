import { Text, View } from "react-native";

const COLOR_MAP = {
  red: "bg-[#FD4545]",
  green: "bg-[#61AC51]",
  blue: "bg-[#5192AC]",
};

export default function StatBar({ label, color, value, icon }) {
  return (
    <View className="mb-4 flex-row items-start">
      <View className="mr-3">{icon}</View>
      <View className="flex-1">
        <Text className="text-[16px] text-indigo-700 mb-1 font-bold">
          {label}
        </Text>
        <View className="h-6 bg-gray-300 rounded-full overflow-hidden">
          <View
            className={`h-full ${COLOR_MAP[color]}`}
            style={{ width: `${value}%` }}
          />
        </View>
      </View>
    </View>
  );
}
