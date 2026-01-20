import { View } from "react-native";

export default function TaskCard({ color }) {
  return (
    <View className="bg-white rounded-2xl p-5 shadow mb-6">
      <View className="h-3 w-20 rounded-full mb-2 bg-gray-200">
        <View className={`h-full ${color} rounded-full w-1/3`} />
      </View>
    </View>
  );
}
