import { Pressable, Text, View } from "react-native";
import { approveTask, rejectTask } from "../services/taskService";

export default function ApproveTaskCard({
  text = "Task Name",
  xp = 10,
  taskID,
}) {
  const handleReject = () => {
    rejectTask(taskID);
  };
  const handleConfirm = () => {
    approveTask(taskID);
  };
  return (
    <View className="mb-6">
      <View
        className="flex-row items-center justify-between px-3 h-[55px] rounded-[20px] bg-[#E6E5FF]"
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
          {/* Reject */}
          <Pressable
            onPress={handleReject}
            className="px-5 py-2 rounded-full bg-[#ED4F4F] shadow-md active:opacity-80 border border-[#CC2E2E]"
          >
            <Text className="text-white font-semibold text-md">Reject</Text>
          </Pressable>

          {/* Confirm */}
          <Pressable
            className="px-5 py-2 rounded-full bg-indigo-600 shadow-md active:opacity-80 border border-[#302ECC]"
            onPress={handleConfirm}
          >
            <Text className="text-white font-semibold text-md">Confirm</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
