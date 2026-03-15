import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";
import EditTaskCard from "./EditTaskCard";

export default function TasksSection({ title }) {
  const { child } = useAppData();
  const [tasks, setTasks] = useState([]);

  // return true if the task's dueDate is the same calendar day as today
  const isDueToday = (task) => {
    if (!task.dueDate) return false; // undated tasks are not "due today"
    const due = task.dueDate.toDate();
    const today = new Date();
    return (
      due.getFullYear() === today.getFullYear() &&
      due.getMonth() === today.getMonth() &&
      due.getDate() === today.getDate()
    );
  };

  const isNotDone = (task) => task.status === "notdone";

  const isRecurring = (task) => {
    return task.recurrence !== null;
  };

  const tasksForSection = (title) => {
    if (title === "Today's Tasks") {
      // only tasks with a due date matching today
      return tasks.filter(isDueToday).filter(isNotDone);
    } else if (title === "Upcoming Tasks") {
      // tasks with a due date in the future (includes undated)
      return tasks
        .filter((t) => t.dueDate && t.dueDate.toDate() > new Date())
        .filter(isNotDone);
    } else if (title === "Repeating Tasks") {
      return tasks.filter(isRecurring).filter(isNotDone);
    }
  };

  const filteredTasks = tasksForSection(title);

  useEffect(() => {
    if (!child) return;

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

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, [child]);

  // fixed height (adjust as needed) so multiple sections stack and the
  // parent ScrollView handles overflow
  const sectionHeight = 280; // about 15rem / 240px

  return (
    <View style={{ height: sectionHeight }} className="flex-none">
      <Text className="text-black font-bold text-xl">{title}</Text>
      <ScrollView className="mt-3 flex-1 rounded-[20px] bg-white p-4 mb-4 shadow-md">
        {filteredTasks.map((task) => (
          <EditTaskCard key={task.id} text={task.description} title={title} />
        ))}
      </ScrollView>
    </View>
  );
}
