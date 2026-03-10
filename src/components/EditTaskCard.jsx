import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, Text, View } from "react-native";
export default function EditTaskCard({ text = "Task Name" }) {
  return (
    <View
      className="flex-row items-center justify-between px-3 h-[55px] rounded-[20px] bg-[#E6E5FF] mb-5"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 3, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 6,
      }}
    >
      {/* Left Side */}
      <View>
        <Text className="text-[#22198E] text-lg font-bold">{text}</Text>
      </View>

      {/* Right Side Buttons */}
      <View className="flex-row items-center gap-3">
        {/* Edit */}
        <Pressable className="px-5 py-2 rounded-full bg-blue shadow-md active:opacity-80 border border-[#302ECC]">
          <MaterialCommunityIcons name="pencil" size={24} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
