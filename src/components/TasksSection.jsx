// this component shows a section of tasks on the parent manage tasks screen
// the same component is reused for today's tasks, upcoming tasks and repeating tasks
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";
import { isDueToday } from "../timeUtils";
import EditTaskCard from "./EditTaskCard";

export default function TasksSection({ title }) {
  // get the current child so only their tasks are loaded
  const { child } = useAppData();

  // stores all incomplete tasks fetched from firestore
  const [tasks, setTasks] = useState([]);

  // checks if a task is still active
  // pending is included because it has been submitted by the child but not approved yet
  const isNotDone = (task) =>
    task.status === "notdone" || task.status === "pending";

  // checks if a task repeats, for example daily or weekly
  const isRecurring = (task) => !!task.recurrence;

  // checks specifically for daily recurring tasks
  const isDaily = (task) => task.recurrence === "daily";

  // gets a stable key for grouping repeated task versions together
  // seriesId is preferred because it links tasks from the same recurring series
  const getTaskKey = (task) =>
    task.seriesId || task.description?.trim()?.toLowerCase() || task.id;

  const getTimestampMillis = (timestamp) => {
    // converts firestore timestamps or normal dates into milliseconds
    // this makes it easier to compare which task version is newest
    if (!timestamp) return 0;
    if (timestamp?.toMillis) return timestamp.toMillis();
    if (timestamp?.toDate) return timestamp.toDate().getTime();
    return new Date(timestamp).getTime();
  };

  // daily recurring tasks can have multiple documents over time
  // this keeps only the latest version of each daily task so duplicates are not shown
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

      // if this task was created later, replace the older version
      if (currentCreatedAt > existingCreatedAt) {
        latestTasksMap.set(key, task);
      }
    });

    return Array.from(latestTasksMap.values());
  };

  // decides which tasks to show based on the section title
  // useMemo avoids recalculating the filtered list unless tasks or title changes
  const filteredTasks = useMemo(() => {
    if (title === "Today's Tasks") {
      // show tasks due today that are not approved yet
      return tasks.filter(isDueToday).filter(isNotDone);
    }

    if (title === "Upcoming Tasks") {
      // show future one-time tasks only
      // recurring tasks are handled in the repeating section instead
      return tasks
        .filter((t) => t.dueDate && t.dueDate.toDate() > new Date())
        .filter((t) => !isRecurring(t))
        .filter(isNotDone);
    }

    if (title === "Repeating Tasks") {
      // show recurring tasks that are still active
      const recurringTasks = tasks.filter(isRecurring).filter(isNotDone);

      // daily tasks are grouped to avoid showing repeated versions
      const dailyTasks = recurringTasks.filter(isDaily);

      // weekly recurring tasks are kept separately
      const nonDailyRecurringTasks = recurringTasks.filter(
        (task) => task.recurrence !== "daily",
      );

      const latestDailyTasks = getLatestDailyTasks(dailyTasks);

      // return the latest daily tasks plus any weekly recurring tasks
      return [...latestDailyTasks, ...nonDailyRecurringTasks];
    }

    return [];
  }, [tasks, title]);

  useEffect(() => {
    // if no child is loaded, clear the task list
    if (!child?.id) {
      setTasks([]);
      return;
    }

    // listen to all tasks for this child in real time
    // this means changes appear without manually refreshing the screen
    const q = query(collection(db, "Task"), where("childID", "==", child.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // approved tasks are completed, so they are not shown in these active sections
      const incompleteTasks = updatedTasks.filter(
        (task) => task.status !== "approved",
      );

      setTasks(incompleteTasks);
    });

    // clean up the listener when the component unmounts or the child changes
    return () => unsubscribe();
  }, [child?.id]);

  // fixed height keeps each task section consistent on the manage tasks screen
  const sectionHeight = 280;

  return (
    <View style={{ height: sectionHeight }} className="flex-none">
      {/* section heading, for example today's tasks or repeating tasks */}
      <Text className="text-black font-bold text-xl">{title}</Text>

      {/* scrollable list of filtered tasks for this section */}
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
