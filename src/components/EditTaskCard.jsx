import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Timestamp } from "firebase/firestore";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { deleteTask, editTask } from "../services/taskService";
import EditTaskModal from "./EditTaskModal";

export default function EditTaskCard({ task = null, title = "Task Title" }) {
  // Controls whether the edit modal is shown
  const [modalVisible, setModalVisible] = useState(false);

  // Runs when the user saves changes in the edit modal
  const handleEditTask = async (updatedTask) => {
    console.log("editing task with id:", task.id);

    try {
      // Create an object containing the updated task values
      const updateData = {
        description: updatedTask.description,
        approvalNeeded: updatedTask.approvalNeeded,
        category: updatedTask.category,
        coins: Number(updatedTask.coins),
        recurrence: updatedTask.recurrence || null,
      };

      // If the due date was changed, convert it to a Firestore Timestamp
      // If no due date was selected, save it as null
      if (updatedTask.dueDate !== undefined) {
        updateData.dueDate = updatedTask.dueDate
          ? Timestamp.fromDate(updatedTask.dueDate)
          : null;
      }

      // Send the updated task data to Firestore through taskService
      await editTask(task.id, updateData);
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  // Runs when the delete button is pressed
  const handleDeleteTask = async () => {
    // Ask the parent to confirm before deleting the task
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
            // Delete the task from Firestore through taskService
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
      {/* Small accent bar to make the task card more visually clear */}
      <View className="absolute left-0 h-[70%] w-[6px] bg-[#4F46E5] rounded-r-full" />

      {/* Main task text */}
      <View className="ml-3 flex-1">
        <Text className="text-[#1E1B8F] text-[16px] font-semibold">
          {task?.description}
        </Text>

        {/* 
          Extra task information is only shown for upcoming or repeating tasks.
          Today's tasks do not need a due date label because they are already due today.
        */}
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

      {/* 
        This modal opens when the edit button is pressed.
        The current task is passed in so the modal can pre-fill the existing values.
      */}
      <EditTaskModal
        task={task}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onEdit={handleEditTask}
      />

      {/* Buttons on the right side of the task card */}
      <View className="flex-row gap-2">
        {/* 
          Daily tasks are not edited here because they are managed separately
          from the Settings screen.
        */}
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

        {/* 
          Delete button is also hidden for daily tasks.
          This prevents daily task management being split across multiple screens.
        */}
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
