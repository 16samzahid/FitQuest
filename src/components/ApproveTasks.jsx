// approve tasks section for the parent dashboard
// this shows tasks the child has marked as completed but still need parent approval
import { FontAwesome } from "@expo/vector-icons";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";
import ApproveTaskCard from "./ApproveTaskCard";

export default function ApproveTasks() {
  // get the current child so we only load their pending tasks
  const { child } = useAppData();

  // controls whether the help/information modal is visible
  const [helpVisible, setHelpVisible] = useState(false);

  // stores tasks that are waiting for parent approval
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // wait until the child profile has loaded before querying firestore
    if (!child) {
      setTasks([]);
      return;
    }

    // listen in real time for this child's pending tasks
    // pending means the child has marked the task as complete, but the parent has not approved it yet
    const q = query(
      collection(db, "Task"),
      where("childID", "==", child.id),
      where("status", "==", "pending"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // convert firestore documents into normal task objects with ids
      const updatedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(updatedTasks);
    });

    // clean up the real-time listener when the component unmounts or child changes
    return () => unsubscribe();
  }, [child]);

  return (
    <>
      <View className="mt-5 bg-white rounded-t-[40px] shadow-md flex-1">
        {/* section header with help button */}
        <View className="flex-row items-center mt-4 justify-between px-4">
          <Text className="text-[#150F59] text-[20px] font-bold m-2">
            Tasks Awaiting Approval
          </Text>

          {/* opens a short explanation for parents */}
          <Pressable onPress={() => setHelpVisible(true)}>
            <FontAwesome name="question-circle" size={24} color="black" />
          </Pressable>
        </View>

        {/* scrollable list of tasks waiting for approval */}
        <ScrollView
          className="mt-4 p-2 rounded-t-[40px]"
          showsVerticalScrollIndicator={false}
        >
          {/* each pending task is shown as an approve/reject card */}
          {tasks.map((task) => (
            <ApproveTaskCard
              key={task.id}
              text={task.description}
              xp={task.xp}
              taskID={task.id}
            />
          ))}
        </ScrollView>
      </View>

      {/* help modal explaining what task approval means */}
      <Modal
        visible={helpVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-white rounded-[30px] p-6 w-full shadow-lg">
            <Text className="text-[#150F59] text-xl font-bold mb-4">
              Task Approval
            </Text>

            {/* simple guidance for the parent */}
            <Text className="text-gray-700 text-base leading-6">
              These are tasks your child has marked as completed.
              {"\n\n"}
              Please confirm if the task was done correctly, or reject if it was
              not completed.
              {"\n\n"}
              You can view all tasks in the Tasks tab at the bottom.
            </Text>

            {/* closes the help modal */}
            <Pressable
              onPress={() => setHelpVisible(false)}
              className="mt-6 bg-indigo-600 py-3 rounded-full items-center"
            >
              <Text className="text-white font-semibold">Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
