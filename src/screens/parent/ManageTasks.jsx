import { useAppData } from "@/src/context/AppDataContext";
import { collection, doc, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../config/FirebaseConfig";
import AddTaskModal from "../../components/AddTaskModal";
import TasksSection from "../../components/TasksSection";
import { createTask } from "../../services/taskService";

const ManageTasks = () => {
  // setting the values to be updated in backend
  const { child } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const weekdayMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const getFirstDueDate = (recurrenceDay) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayIndex = today.getDay();
    const targetIndex = weekdayMap[recurrenceDay];

    let diff = targetIndex - todayIndex;

    if (diff < 0) {
      diff += 7;
    }

    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + diff);

    return dueDate;
  };

  const handleCreateTask = async (
    description,
    approvalNeeded,
    category,
    coins,
    dueDate,
    recurrence,
  ) => {
    if (!child) {
      alert("No child selected");
      alert("Please select a child before creating a task");
      return;
    }
    try {
      let finalDueDate = dueDate;
      if (recurrence) {
        finalDueDate = getFirstDueDate(recurrence);
      }

      const taskData = {
        approvalNeeded: approvalNeeded,
        approvedBy: null,
        category: category,
        childID: child.id,
        coins: Number(coins),
        completedAt: null,
        createdAt: Timestamp.now(),
        description: description,
        dueDate: finalDueDate ? Timestamp.fromDate(finalDueDate) : null,
        recurrence: recurrence ?? null,
        status: "notdone",
        xp: 10,
      };

      // For recurring tasks, create a doc ref first so we can set seriesId
      if (recurrence) {
        const newTaskRef = doc(collection(db, "Task"));
        taskData.seriesId = newTaskRef.id;
        await createTask(taskData, newTaskRef);
      } else {
        // For one-time tasks, use regular addDoc
        await createTask(taskData);
      }
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
          childID={child?.id}
          onCreate={({
            description,
            approvalNeeded,
            category,
            coins,
            dueDate,
            recurrence,
          }) =>
            handleCreateTask(
              description,
              approvalNeeded,
              category,
              coins,
              dueDate,
              recurrence,
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
