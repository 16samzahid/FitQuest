import { Text, View } from "react-native";

export default function LevelCoinSection({
  level = 15,
  progress = 82,
  coins = 60,
}) {
  return (
    <View className="flex-row items-center mt-5 shadow-md bg-white rounded-3xl p-4">
      {/* Level circle */}
      <View className="w-16 h-16 rounded-full border-4 border-indigo-700 items-center justify-center">
        <Text className="text-indigo-700 font-semibold">Lvl {level}</Text>
      </View>

      {/* Progress bar */}
      <View className="flex-1 ml-4 bg-#EBEBEB">
        <View className="h-6 bg-gray-300 rounded-full overflow-hidden">
          <View
            className="h-full bg-indigo-700"
            style={{ width: `${progress}%` }}
          />
        </View>
        <Text className="text-lg mt-1 text-indigo-700 font-bold">
          {progress} / 100
        </Text>
      </View>

      {/* Coins */}
      <View className="ml-3 items-center">
        <Text className="text-yellow-500 text-3xl">🪙</Text>
        <Text className="text-lg text-indigo-700 font-bold">{coins}</Text>
      </View>
    </View>
  );
}
