// parent screen for creating and managing child tasks
import { useAppData } from "@/src/context/AppDataContext";
import { collection, doc, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../config/FirebaseConfig";
import AddTaskModal from "../../components/addTaskModal";
import TasksSection from "../../components/TasksSection";
import { createTask } from "../../services/taskService";

const ManageTasks = () => {
  // get the current child so new tasks can be linked to their profile
  const { child } = useAppData();

  // controls whether the create task modal is open or closed
  const [modalVisible, setModalVisible] = useState(false);

  // maps weekday names to javascript day numbers
  // this is used when creating weekly recurring tasks
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
    // start from today at midnight so the comparison is based on the date only
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayIndex = today.getDay();
    const targetIndex = weekdayMap[recurrenceDay];

    // work out how many days away the selected recurrence day is
    let diff = targetIndex - todayIndex;

    // if the selected day has already passed this week, move it to next week
    if (diff < 0) {
      diff += 7;
    }

    // create the first due date for the recurring task
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
    // create either a one-time task or the first task in a recurring series
    if (!child) {
      alert("No child selected");
      alert("Please select a child before creating a task");
      return;
    }

    try {
      // if the task is recurring, calculate the first due date from the selected day
      let finalDueDate = dueDate;
      if (recurrence) {
        finalDueDate = getFirstDueDate(recurrence);
      }

      // build the task object that will be saved to firestore
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

      // for recurring tasks, create the document reference first
      // this lets us use the task's id as the seriesId
      if (recurrence) {
        const newTaskRef = doc(collection(db, "Task"));
        taskData.seriesId = newTaskRef.id;
        await createTask(taskData, newTaskRef);
      } else {
        // one-time tasks do not need a seriesId, so they can be created normally
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
        {/* screen title */}
        <Text className="text-[#7F7DCE] text-[30px] font-black p-2 text-center">
          Manage Tasks
        </Text>

        {/* opens the modal where the parent can create a new task */}
        <Pressable
          className="mt-4 mb-4 bg-[#302ECC] py-3 rounded-full items-center shadow-md border border-[#302ECC]"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-white font-semibold">+ Create New Task</Text>
        </Pressable>

        {/* modal for creating a new task.
            when the modal submits, the task data is passed into handleCreateTask */}
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

        {/* task lists shown in sections so the parent can see tasks by type */}
        <TasksSection title="Today's Tasks" />
        <TasksSection title="Upcoming Tasks" />
        <TasksSection title="Repeating Tasks" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageTasks;
