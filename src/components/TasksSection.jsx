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

  const isNotDone = (task) => task.status === "notdone";

  const isRecurring = (task) => {
    return task.recurrence !== null && task.recurrence !== "";
  };

  const isDaily = (task) => task.recurrence === "daily";

  const getTaskKey = (task) =>
    task.description?.trim()?.toLowerCase() || task.id;

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

  const filteredTasks = useMemo(() => {
    if (title === "Today's Tasks") {
      return tasks.filter(isDueToday).filter(isNotDone);
    }

    if (title === "Upcoming Tasks") {
      return tasks
        .filter((t) => t.dueDate && t.dueDate.toDate() > new Date())
        .filter((t) => !isRecurring(t))
        .filter(isNotDone);
    }

    if (title === "Repeating Tasks") {
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

    const q = query(
      collection(db, "Task"),
      where("childID", "==", child.id),
      where("status", "==", "notdone"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(updatedTasks);
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
