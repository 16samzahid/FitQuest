import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";
import TaskCard from "./TaskCard";

function Tasks() {
  // will instead take tasks from the parent and display using v-for
  const { child } = useAppData();
  const [tasks, setTasks] = useState([]);
  const categoryToStat = {
    Exercise: "health",
    Hygiene: "health",

    Food: "hunger",
    Water: "hunger",

    Learning: "happiness",
    Play: "happiness",
  };
  const statToBgClass = {
    health: "bg-red",
    hunger: "bg-green",
    happiness: "bg-lightBlue", // light blue
  };
  const getBgForCategory = (category) => {
    const stat = categoryToStat[category];
    return statToBgClass[stat] ?? "bg-gray-300";
  };

  const fetchTasks = async () => {
    const q = query(collection(db, "Task"), where("childID", "==", child.id));

    const tasksSnap = await getDocs(q);
    // const tasksSnap = await getDocs(collection(db, "Task"));
    const tasks = tasksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTasks(tasks);
    console.log(tasks);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <ScrollView
      className="mt-6 space-y-4 rounded-t-3xl px-2 shadow-md bg-white p-5"
      showsVerticalScrollIndicator={false}
    >
      {tasks.map(
        (task, index) => (
          console.log(task),
          (
            <TaskCard
              key={index}
              color={getBgForCategory(task.category)}
              text={task.description}
            />
          )
        ),
      )}
    </ScrollView>
  );
}

export default Tasks;
