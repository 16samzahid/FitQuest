import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";

export default function TasksCompleted() {
  const { child } = useAppData();
  const [todayTasks, setTodayTasks] = useState([]);

  useEffect(() => {
    if (!child || !child.id) {
      setTodayTasks([]);
      return;
    }

    const q = query(collection(db, "Task"), where("childID", "==", child.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter for today's tasks
      const today = new Date();
      const todayName = today.toLocaleDateString("en-GB", {
        weekday: "long",
      });

      const todayTasksFiltered = allTasks.filter((task) => {
        // 1️⃣ check exact date match
        if (task.dueDate) {
          const due = task.dueDate.toDate();
          const sameExactDate =
            due.getFullYear() === today.getFullYear() &&
            due.getMonth() === today.getMonth() &&
            due.getDate() === today.getDate();
          if (sameExactDate) return true;
        }
      });

      setTodayTasks(todayTasksFiltered);
    });

    return () => unsubscribe();
  }, [child]);

  const completed = todayTasks.filter(
    (task) => task.status && task.status !== "notdone",
  ).length;
  const total = todayTasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View className="mt-5 shadow-md bg-white rounded-3xl p-4">
      <Text className="text-[#150F59] text-[18px] font-bold text-center">
        Today&apos;s Progress
      </Text>
      {/* Progress bar */}
      <View className="mt-2">
        <View className="h-6 bg-gray-300 rounded-full overflow-hidden">
          <View className="h-full bg-green" style={{ width: `${progress}%` }} />
        </View>
        <Text className="text-lg mt-1 text-indigo font-bold text-center">
          {completed} / {total} tasks completed
        </Text>
      </View>
    </View>
  );
}
