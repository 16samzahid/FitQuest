import { useAppData } from "@/src/context/AppDataContext";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddTaskModal from "../../components/addTaskModal";
import { createTask } from "../../services/taskService";

const ManageTasks = () => {
  const { child } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);

  const handleCreateTask = async (description, approvalNeeded) => {
    if (!child) {
      alert("No child selected");
      return;
    }
    try {
      await createTask({
        approvalNeeded: approvalNeeded,
        approvedBy: null,
        category: "Exercise",
        childID: child.id,
        coins: 10,
        completedAt: null,
        createdAt: new Date(),
        description: description,
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
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-white font-semibold">Create New Task</Text>
        </Pressable>

        <AddTaskModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onCreate={({ description, approvalNeeded }) =>
            handleCreateTask(description, approvalNeeded)
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default ManageTasks;
