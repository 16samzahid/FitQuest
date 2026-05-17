// task card used on the parent manage tasks screen
// it shows one task, and gives the parent options to edit or delete it
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Timestamp } from "firebase/firestore";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { deleteTask, editTask } from "../services/taskService";
import EditTaskModal from "./EditTaskModal";

export default function EditTaskCard({ task = null, title = "Task Title" }) {
  // controls whether the edit task modal is open
  const [modalVisible, setModalVisible] = useState(false);

  const handleEditTask = async (updatedTask) => {
    // called after the parent saves changes in the edit modal
    console.log("editing task with id:", task.id);

    try {
      // build the updated task object that will be sent to firestore
      const updateData = {
        description: updatedTask.description,
        approvalNeeded: updatedTask.approvalNeeded,
        category: updatedTask.category,
        coins: Number(updatedTask.coins),
        recurrence: updatedTask.recurrence || null,
      };

      // if a due date was included, convert it into a firestore timestamp
      // null is used if the task no longer has a due date
      if (updatedTask.dueDate !== undefined) {
        updateData.dueDate = updatedTask.dueDate
          ? Timestamp.fromDate(updatedTask.dueDate)
          : null;
      }

      // update the task in firestore using the task service
      await editTask(task.id, updateData);
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  const handleDeleteTask = async () => {
    // show a confirmation alert so tasks are not deleted accidentally
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // delete the task from firestore using the task service
            await deleteTask(task.id);
          } catch (error) {
            console.error("Error deleting task:", error);
          }
        },
      },
    ]);
  };

  return (
    <View
      className="flex-row items-center justify-between px-5 py-4 rounded-[24px] bg-[#ECEBFF] mb-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
      }}
    >
      {/* small accent bar to make each task card easier to scan visually */}
      <View className="absolute left-0 h-[70%] w-[6px] bg-[#4F46E5] rounded-r-full" />

      {/* main task information */}
      <View className="ml-3 flex-1">
        {/* task description */}
        <Text className="text-[#1E1B8F] text-[16px] font-semibold">
          {task?.description}
        </Text>

        {/* show extra details depending on which task section this card is in */}
        {title !== "Today's Tasks" && (
          <Text className="text-[#7F7DCE] text-[13px] mt-1">
            {title === "Upcoming Tasks"
              ? `Due: ${
                  task?.dueDate
                    ? task.dueDate.toDate().toDateString()
                    : "No due date"
                }`
              : title === "Repeating Tasks"
                ? task?.recurrence === "daily"
                  ? "Daily"
                  : `Every ${task?.recurrence}`
                : ""}
          </Text>
        )}
      </View>

      {/* edit modal receives the selected task so it can pre-fill the existing values */}
      <EditTaskModal
        task={task}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onEdit={handleEditTask}
      />

      {/* edit and delete buttons */}
      <View className="flex-row gap-2">
        {/* daily tasks are edited from settings instead, so they are hidden here */}
        {task?.recurrence !== "daily" && (
          <Pressable
            onPress={() => setModalVisible(true)}
            className="w-10 h-10 rounded-full bg-[#4F46E5] items-center justify-center active:scale-95"
            style={{
              shadowColor: "#4F46E5",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <MaterialCommunityIcons name="pencil" size={18} color="white" />
          </Pressable>
        )}

        {/* daily tasks are also not deleted here to keep daily task management in one place */}
        {task?.recurrence !== "daily" && (
          <Pressable
            onPress={handleDeleteTask}
            className="w-10 h-10 rounded-full bg-[#e54646] items-center justify-center active:scale-95"
            style={{
              shadowColor: "#e54646",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <MaterialCommunityIcons name="trash-can" size={18} color="white" />
          </Pressable>
        )}
      </View>
    </View>
  );
}
