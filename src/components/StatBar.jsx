import { Text, View } from "react-native";

const COLOR_MAP = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
};

export default function StatBar({ label, color = "red", value }) {
  return (
    <View>
      <Text className="text-sm text-indigo-700 mb-1">{label}</Text>

      <View className="w-full h-3 bg-white rounded-full overflow-hidden">
        <View
          className={`h-full ${COLOR_MAP[color]}`}
          style={{ width: `${value}%` }}
        />
      </View>
    </View>
  );
}
