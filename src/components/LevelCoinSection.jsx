import { Text, View } from "react-native";

export default function LevelCoinSection({
  level = 15,
  progress = 82,
  coins = 60,
}) {
  return (
    <View className="flex-row items-center mt-5 shadow-md bg-white rounded-3xl p-4">
      {/* Level circle */}
      <View className="w-14 h-14 rounded-full border-4 border-indigo-700 items-center justify-center">
        <Text className="text-indigo-700 font-semibold">Lvl {level}</Text>
      </View>

      {/* Progress bar */}
      <View className="flex-1 ml-4 bg-#EBEBEB">
        <View className="h-2 bg-gray-300 rounded-full overflow-hidden">
          <View
            className="h-full bg-indigo-700"
            style={{ width: `${progress}%` }}
          />
        </View>
        <Text className="text-xs mt-1 text-indigo-700">{progress} / 100</Text>
      </View>

      {/* Coins */}
      <View className="ml-3 items-center">
        <Text className="text-yellow-500 text-xl">🪙</Text>
        <Text className="text-xs text-indigo-700">{coins}</Text>
      </View>
    </View>
  );
}
