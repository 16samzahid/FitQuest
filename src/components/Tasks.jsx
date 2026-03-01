import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";
import TaskCard from "./TaskCard";
const { width } = Dimensions.get("window");

function Tasks() {
  const { child, loading } = useAppData();
  const [tasks, setTasks] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const triggerCelebration = (taskID) => {
    // remove task instantly
    setTasks((prev) => prev.filter((t) => t.id !== taskID));

    // show confetti
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
    }, 2500);
  };

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

  if (loading || !child) {
    return (
      <Text className="mt-6 text-center text-gray-400">Loading tasks...</Text>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {showConfetti && (
        <ConfettiCannon
          count={80}
          origin={{ x: width / 2, y: 0 }}
          explosionSpeed={1000}
          fallSpeed={1500}
          fadeOut
        />
      )}

      <ScrollView
        className="mt-6 space-y-4 rounded-t-3xl px-3 shadow-md bg-white p-5"
        showsVerticalScrollIndicator={false}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            taskID={task.id}
            color={getBgForCategory(task.category)}
            text={task.description}
            xp={task.xp}
            onComplete={triggerCelebration}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default Tasks;
