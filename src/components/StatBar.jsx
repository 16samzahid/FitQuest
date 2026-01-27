import { Text, View } from "react-native";

const COLOR_MAP = {
  red: "bg-[#FD4545]",
  green: "bg-[#61AC51]",
  blue: "bg-[#5192AC]",
};

export default function StatBar({ label, color, value, icon }) {
  return (
    <View className="mb-4 w-full">
      {/* Icon + Label */}
      <View className="flex-row items-center mb-2">
        <View className="mr-2 shrink-0">{icon}</View>

        <Text
          className="text-[15px] text-indigo-700 font-semibold"
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
        <View
          className={`${COLOR_MAP[color]} h-full rounded-full`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </View>
    </View>
  );
}
