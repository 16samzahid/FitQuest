import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";
import TaskCard from "./TaskCard";

function Tasks() {
  const { child, loading } = useAppData();
  const [tasks, setTasks] = useState([]);

  // 🔗 category → stat (MATCH FIRESTORE CASE)
  const categoryToStat = {
    Exercise: "health",
    Hygiene: "health",

    Food: "hunger",
    Water: "hunger",

    Learning: "happiness",
    Play: "happiness",
  };

  // 🎨 stat → bg colour
  const statToBgClass = {
    health: "bg-red",
    hunger: "bg-green",
    happiness: "bg-lightBlue",
  };

  const getBgForCategory = (category) => {
    const stat = categoryToStat[category];
    return statToBgClass[stat] ?? "bg-gray-300";
  };

  useEffect(() => {
    if (!child) return; // ✅ GUARD
    fetchTasks();
  }, [child]);

  const fetchTasks = async () => {
    try {
      const q = query(collection(db, "Task"), where("childID", "==", child.id));

      const tasksSnap = await getDocs(q);

      const fetchedTasks = tasksSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Fetched tasks:", fetchedTasks);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  if (loading || !child) {
    return (
      <Text className="mt-6 text-center text-gray-400">Loading tasks...</Text>
    );
  }

  return (
    <ScrollView
      className="mt-6 space-y-4 rounded-t-3xl px-3 shadow-md bg-white p-5"
      showsVerticalScrollIndicator={false}
    >
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          color={getBgForCategory(task.category)}
          text={task.description}
          xp={task.xp}
        />
      ))}
    </ScrollView>
  );
}

export default Tasks;
