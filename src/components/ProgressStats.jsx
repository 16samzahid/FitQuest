import { Text, View } from "react-native";

export default function ProgressStats() {
  return (
    <View className="mt-5 bg-[#DDDDFF] rounded-[40px] px-4 shadow-md relative h-[45%] items-center">
      <Text className="text-[#150F59] text-[20px] font-bold mt-2">
        Harry&apos;s Progress
      </Text>
      <View className="h-[80%] w-[100%] bg-white rounded-[40px] mt-2 shadow-md" />
    </View>
  );
}
