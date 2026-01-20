import { Text, View } from "react-native";

export default function PetStatsCard({
  health = 15,
  hunger = 82,
  happiness = 60,
}) {
  return (
    <View className="flex-row mt-5 shadow-md bg-white rounded-3xl p-4">
      {/* Progress bars */}
      <View className="flex-1 ml-4 bg-#EBEBEB">
        <View className="h-6 bg-gray-300 rounded-full overflow-hidden">
          <View
            className="h-full bg-indigo-700"
            style={{ width: `${health}%` }}
          />
        </View>
        <Text className="text-xs mt-1 text-indigo-700">Health</Text>
      </View>

      <View className="flex-1 ml-4 bg-#EBEBEB">
        <View className="h-6 bg-gray-300 rounded-full overflow-hidden">
          <View
            className="h-full bg-indigo-700"
            style={{ width: `${hunger}%` }}
          />
        </View>
        <Text className="text-xs mt-1 text-indigo-700">Hunger</Text>
      </View>

      <View className="flex-1 ml-4 bg-#EBEBEB">
        <View className="h-6 bg-gray-300 rounded-full overflow-hidden">
          <View
            className="h-full bg-indigo-700"
            style={{ width: `${happiness}%` }}
          />
        </View>
        <Text className="text-xs mt-1 text-indigo-700">Happiness</Text>
      </View>
    </View>
  );
}
