// this component shows the child's task list for today
// it listens to firestore for not-done tasks and displays them as task cards
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";
import { isDueToday } from "../timeUtils";
import TaskCard from "./TaskCard";

// used to position the confetti from the middle of the screen
const { width } = Dimensions.get("window");

function Tasks() {
  // get the current child and loading state from global app data
  const { child, loading } = useAppData();

  // stores the child's active tasks from firestore
  const [tasks, setTasks] = useState([]);

  // controls whether the confetti animation is shown
  const [showConfetti, setShowConfetti] = useState(false);

  // only show tasks where the due date matches today's date
  const todayTasks = tasks.filter(isDueToday);

  const triggerCelebration = (taskID) => {
    // remove the completed task from the local list straight away
    // this makes the UI feel faster while firestore updates in the background
    setTasks((prev) => prev.filter((t) => t.id !== taskID));

    // show confetti when a task is completed
    setShowConfetti(true);

    // hide confetti after a short delay
    setTimeout(() => {
      setShowConfetti(false);
    }, 2500);
  };

  // maps each task category to the pet stat it affects
  // this matches the categories stored in firestore
  const categoryToStat = {
    Exercise: "health",
    Hygiene: "health",

    Food: "hunger",
    Water: "hunger",

    Learning: "happiness",
    Play: "happiness",
  };

  // maps each pet stat to a background colour for the task card
  const statToBgClass = {
    health: "bg-red",
    hunger: "bg-green",
    happiness: "bg-lightBlue",
  };

  const getBgForCategory = (category) => {
    // choose the task card colour based on the task category
    const stat = categoryToStat[category];
    return statToBgClass[stat] ?? "bg-gray-300";
  };

  useEffect(() => {
    // do not query tasks until the child profile has loaded
    if (!child) return;

    // listen to this child's tasks that are still not done
    const q = query(
      collection(db, "Task"),
      where("childID", "==", child.id),
      where("status", "==", "notdone"),
    );

    // onSnapshot keeps the task list updated in real time
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(updatedTasks);
    });

    // clean up the firestore listener when the component unmounts or child changes
    return () => unsubscribe();
  }, [child]);

  // show a simple loading message while child/task data is not ready
  if (loading || !child) {
    return (
      <Text className="mt-6 text-center text-gray-400">Loading tasks...</Text>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* confetti animation shown after a task is completed */}
      {showConfetti && (
        <ConfettiCannon
          count={80}
          origin={{ x: width / 2, y: 0 }}
          // controls how quickly the confetti bursts and falls
          explosionSpeed={1000}
          fallSpeed={1500}
          fadeOut
        />
      )}

      {/* scrollable list of today's tasks */}
      <ScrollView
        className="mt-6 space-y-4 rounded-t-3xl px-3 shadow-md bg-white p-5"
        showsVerticalScrollIndicator={false}
      >
        {todayTasks.map((task) => (
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
