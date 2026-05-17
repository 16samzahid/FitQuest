// this component shows the child's progress for today's tasks
// it appears on the child home screen as a small progress summary
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";

export default function TasksCompleted() {
  // get the current child so we can load only their tasks
  const { child } = useAppData();

  // stores the tasks that are due today
  const [todayTasks, setTodayTasks] = useState([]);

  useEffect(() => {
    // if no child is loaded yet, clear the task list and stop
    if (!child || !child.id) {
      setTodayTasks([]);
      return;
    }

    // listen to all tasks for this child in real time
    // this means the progress updates automatically when a task status changes
    const q = query(collection(db, "Task"), where("childID", "==", child.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // get today's date so tasks can be filtered by exact due date
      const today = new Date();

      // this is not currently used, but could be useful for weekday-based checks
      const todayName = today.toLocaleDateString("en-GB", {
        weekday: "long",
      });

      // only include tasks where the due date is the same calendar day as today
      const todayTasksFiltered = allTasks.filter((task) => {
        if (task.dueDate) {
          const due = task.dueDate.toDate();

          const sameExactDate =
            due.getFullYear() === today.getFullYear() &&
            due.getMonth() === today.getMonth() &&
            due.getDate() === today.getDate();

          if (sameExactDate) return true;
        }

        // tasks without today's due date are not included in this progress count
        return false;
      });

      setTodayTasks(todayTasksFiltered);
    });

    // clean up the firestore listener when the component unmounts or child changes
    return () => unsubscribe();
  }, [child]);

  // count tasks that are no longer "notdone"
  // this includes pending and approved tasks, because both mean the child has attempted/completed them
  const completed = todayTasks.filter(
    (task) => task.status && task.status !== "notdone",
  ).length;

  // total number of tasks due today
  const total = todayTasks.length;

  // calculate progress percentage for the progress bar
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View className="mt-5 shadow-md bg-white rounded-3xl p-4">
      {/* section title */}
      <Text className="text-[#150F59] text-[18px] font-bold text-center">
        Today&apos;s Progress
      </Text>

      {/* progress bar showing how many of today's tasks have been completed */}
      <View className="mt-2">
        <View className="h-6 bg-gray-300 rounded-full overflow-hidden">
          {/* width changes depending on the completion percentage */}
          <View className="h-full bg-green" style={{ width: `${progress}%` }} />
        </View>

        {/* text summary below the progress bar */}
        <Text className="text-lg mt-1 text-indigo font-bold text-center">
          {completed} / {total} tasks completed
        </Text>
      </View>
    </View>
  );
}
