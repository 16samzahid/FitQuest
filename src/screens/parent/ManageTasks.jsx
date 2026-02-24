import { useAppData } from "@/src/context/AppDataContext";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createTask } from "../../services/taskService";

const ManageTasks = () => {
  const { child } = useAppData();
  const handleCreateTask = async () => {
    alert("Creating a new task for the child...");
    try {
      await createTask({
        approvalNeeded: true,
        approvedBy: null,
        category: "Exercise",
        childID: child.id,
        coins: 10,
        completedAt: null,
        createdAt: new Date(),
        description: "Do 20 push-ups",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        recurrence: null,
        status: "notdone",
        xp: 10,
      });
    } catch (err) {
      console.error("Failed creating task", err);
      alert("Failed to create task");
    }
  };
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 px-4">
        <Text>ManageTasks</Text>
        <Pressable
          className="mt-4 bg-indigo-600 py-3 rounded-full items-center"
          onPress={handleCreateTask}
        >
          <Text className="text-white font-semibold">Create New Task</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default ManageTasks;
