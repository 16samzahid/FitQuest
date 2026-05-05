import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";
import { isDueToday } from "../timeUtils";
import EditTaskCard from "./EditTaskCard";

export default function TasksSection({ title }) {
  const { child } = useAppData();
  const [tasks, setTasks] = useState([]);

  // Helper functions to categorize tasks by status and recurrence.
  const isNotDone = (task) =>
    task.status === "notdone" || task.status === "pending";

  const isRecurring = (task) => {
    return task.recurrence !== null && task.recurrence !== "";
  };

  const isDaily = (task) => task.recurrence === "daily";

  const getTaskKey = (task) =>
    task.seriesId || task.description?.trim()?.toLowerCase() || task.id;

  const getTimestampMillis = (timestamp) => {
    if (!timestamp) return 0;
    if (timestamp?.toMillis) return timestamp.toMillis();
    if (timestamp?.toDate) return timestamp.toDate().getTime();
    return new Date(timestamp).getTime();
  };

  // Keep only the latest instance of each daily recurring task
  const getLatestDailyTasks = (taskList) => {
    const latestTasksMap = new Map();

    taskList.forEach((task) => {
      const key = getTaskKey(task);
      const existingTask = latestTasksMap.get(key);

      if (!existingTask) {
        latestTasksMap.set(key, task);
        return;
      }

      const currentCreatedAt = getTimestampMillis(task.createdAt);
      const existingCreatedAt = getTimestampMillis(existingTask.createdAt);

      if (currentCreatedAt > existingCreatedAt) {
        latestTasksMap.set(key, task);
      }
    });

    return Array.from(latestTasksMap.values());
  };

  // Filter tasks based on the section title to show relevant ones.
  const filteredTasks = useMemo(() => {
    if (title === "Today's Tasks") {
      // Show tasks due today that are not yet completed
      return tasks.filter(isDueToday).filter(isNotDone);
    }

    if (title === "Upcoming Tasks") {
      // Show future non-recurring tasks that are not done
      return tasks
        .filter((t) => t.dueDate && t.dueDate.toDate() > new Date())
        .filter((t) => !isRecurring(t))
        .filter(isNotDone);
    }

    if (title === "Repeating Tasks") {
      // Show recurring tasks, keeping only the latest daily ones to avoid duplicates
      const recurringTasks = tasks.filter(isRecurring).filter(isNotDone);

      const dailyTasks = recurringTasks.filter(isDaily);
      const nonDailyRecurringTasks = recurringTasks.filter(
        (task) => task.recurrence !== "daily",
      );

      const latestDailyTasks = getLatestDailyTasks(dailyTasks);

      return [...latestDailyTasks, ...nonDailyRecurringTasks];
    }

    return [];
  }, [tasks, title]);

  useEffect(() => {
    if (!child?.id) {
      setTasks([]);
      return;
    }

    // Fetch all tasks (not filtered by status) so we can show pending daily recurring tasks
    const q = query(collection(db, "Task"), where("childID", "==", child.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter out completed and approved tasks
      const incompleteTasks = updatedTasks.filter(
        (task) => task.status !== "approved",
      );

      setTasks(incompleteTasks);
    });

    return () => unsubscribe();
  }, [child?.id]);

  const sectionHeight = 280;

  return (
    <View style={{ height: sectionHeight }} className="flex-none">
      <Text className="text-black font-bold text-xl">{title}</Text>

      <ScrollView className="mt-3 flex-1 rounded-[20px] bg-white p-4 mb-4 shadow-md">
        {filteredTasks.map((task) => (
          <EditTaskCard
            task={task}
            key={task.id}
            text={task.description}
            title={title}
            dueDate={task.dueDate ? task.dueDate.toDate().toDateString() : null}
            recurrence={task.recurrence}
          />
        ))}
      </ScrollView>
    </View>
  );
}
