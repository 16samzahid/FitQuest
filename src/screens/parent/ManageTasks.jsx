import { useAppData } from "@/src/context/AppDataContext";
import { Timestamp } from "firebase/firestore";
import { useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddTaskModal from "../../components/AddTaskModal";
import TasksSection from "../../components/TasksSection";
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
    <SafeAreaView className="flex-1 bg-[#D9D8FF]" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[#7F7DCE] text-[30px] font-black p-2 text-center">
          Manage Tasks
        </Text>
        <Pressable
          className="mt-4 mb-4 bg-[#302ECC] py-3 rounded-full items-center shadow-md border border-[#302ECC]"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-white font-semibold">+ Create New Task</Text>
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
        <TasksSection title="Today's Tasks" />
        <TasksSection title="Upcoming Tasks" />
        <TasksSection title="Repeating Tasks" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageTasks;
