import { useAppData } from "@/src/context/AppDataContext";
import { Timestamp } from "firebase/firestore";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddTaskModal from "../../components/addTaskModal";
import { createTask } from "../../services/taskService";

const ManageTasks = () => {
  // setting the values to be updated in backend
  const { child } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);

  const handleCreateTask = async (
    description,
    approvalNeeded,
    category,
    coins,
    dueDate,
  ) => {
    if (!child) {
      alert("No child selected");
      alert("Please select a child before creating a task");
      return;
    }
    try {
      await createTask({
        approvalNeeded: approvalNeeded,
        approvedBy: null,
        category: category,
        childID: child.id,
        coins: Number(coins),
        completedAt: null,
        createdAt: Timestamp.now(),
        description: description,
        dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
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
          onCreate={({
            description,
            approvalNeeded,
            category,
            coins,
            dueDate,
          }) =>
            handleCreateTask(
              description,
              approvalNeeded,
              category,
              coins,
              dueDate,
            )
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default ManageTasks;
