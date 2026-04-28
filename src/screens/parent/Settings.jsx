import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Checkbox from "expo-checkbox";
import { signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../../config/FirebaseConfig.js";
import { useAppData } from "../../context/AppDataContext";
import { useMode } from "../../context/ModeContext";
import { editChildName, editParentPin } from "../../services/userService";

const Settings = () => {
  const { setMode } = useMode();
  const { child, parent } = useAppData();

  const [showPin, setShowPin] = useState(false);
  const [nameModal, setNameModal] = useState(false);
  const [pinModal, setPinModal] = useState(false);

  const [newName, setNewName] = useState(child?.name || "");
  const [newPin, setNewPin] = useState(parent?.pin || "");

  // Daily tasks state
  const [dailyTasks, setDailyTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [addTaskModal, setAddTaskModal] = useState(false);
  const [editTaskModal, setEditTaskModal] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskCategory, setTaskCategory] = useState(null);
  const [taskCoins, setTaskCoins] = useState("");
  const [taskApprovalNeeded, setTaskApprovalNeeded] = useState(true);

  const categories = [
    { label: "Exercise", value: "Exercise" },
    { label: "Learning", value: "Learning" },
    { label: "Hygiene", value: "Hygiene" },
    { label: "Food", value: "Food" },
    { label: "Play", value: "Play" },
  ];

  const coinOptions = [
    { label: "5", value: "5" },
    { label: "10", value: "10" },
    { label: "15", value: "15" },
    { label: "20", value: "20" },
  ];

  useEffect(() => {
    setNewName(child?.name || "");
  }, [child]);

  useEffect(() => {
    setNewPin(parent?.pin || "");
  }, [parent]);

  useEffect(() => {
    const fetchDailyTasks = async () => {
      if (!child?.id) {
        setDailyTasks([]);
        setLoadingTasks(false);
        return;
      }

      try {
        setLoadingTasks(true);

        const q = query(
          collection(db, "Task"),
          where("childID", "==", child.id),
          where("recurrence", "==", "daily"),
        );

        const snapshot = await getDocs(q);

        const tasksList = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        // Group tasks by seriesId (or fall back to description, then id) and keep only the latest instance of each
        const latestTasksMap = new Map();

        tasksList.forEach((task) => {
          const key =
            task.seriesId || task.description?.trim()?.toLowerCase() || task.id;
          const existingTask = latestTasksMap.get(key);

          const currentCreatedAt = task.createdAt?.toMillis?.() ?? 0;
          const existingCreatedAt = existingTask?.createdAt?.toMillis?.() ?? 0;

          if (!existingTask || currentCreatedAt > existingCreatedAt) {
            latestTasksMap.set(key, task);
          }
        });

        const uniqueTasks = Array.from(latestTasksMap.values());

        setDailyTasks(uniqueTasks);
      } catch (error) {
        console.error("Error fetching daily tasks:", error);
        Alert.alert("Error", "Could not load daily tasks.");
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchDailyTasks();
  }, [child?.id]);

  const refreshDailyTasks = async () => {
    if (!child?.id) return;

    try {
      const q = query(
        collection(db, "Task"),
        where("childID", "==", child.id),
        where("recurrence", "==", "daily"),
      );

      const snapshot = await getDocs(q);

      const tasksList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Group tasks by description and keep only the latest instance of each
      const latestTasksMap = new Map();
      tasksList.forEach((task) => {
        const existingTask = latestTasksMap.get(task.description);
        if (!existingTask || task.createdAt > existingTask.createdAt) {
          latestTasksMap.set(task.description, task);
        }
      });

      const uniqueTasks = Array.from(latestTasksMap.values());

      setDailyTasks(uniqueTasks);
    } catch (error) {
      console.error("Error refreshing daily tasks:", error);
    }
  };

  const handleSaveName = async () => {
    try {
      await editChildName(child.id, newName);
      setNameModal(false);
    } catch (error) {
      console.error("Error saving child name:", error);
      Alert.alert("Error", "Could not update child name.");
    }
  };

  const handleSavePin = async () => {
    try {
      await editParentPin(parent.id, newPin);
      setPinModal(false);
    } catch (error) {
      console.error("Error saving parent pin:", error);
      Alert.alert("Error", "Could not update parent PIN.");
    }
  };

  const handleSignOut = () => {
    Alert.alert("Confirm Sign Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => signOut(auth),
      },
    ]);
  };

  const resetTaskForm = () => {
    setSelectedTask(null);
    setTaskDescription("");
    setTaskCategory(null);
    setTaskCoins("");
    setTaskApprovalNeeded(true);
  };

  const openEditTaskModal = (task) => {
    setSelectedTask(task);
    setTaskDescription(task?.description || "");
    setTaskCategory(task?.category || null);
    setTaskCoins(task?.coins != null ? String(task.coins) : "");
    setTaskApprovalNeeded(task?.approvalNeeded ?? true);
    setEditTaskModal(true);
  };

  const handleAddTask = async () => {
    if (!taskDescription.trim()) {
      Alert.alert("Missing description", "Please enter a task description.");
      return;
    }

    if (!taskCategory) {
      Alert.alert("Missing category", "Please select a category.");
      return;
    }

    if (!taskCoins) {
      Alert.alert("Missing coins", "Please select a coin reward.");
      return;
    }

    if (!child?.id) {
      Alert.alert("Error", "No child found.");
      return;
    }

    try {
      const newTaskRef = doc(collection(db, "Task"));
      await setDoc(newTaskRef, {
        description: taskDescription.trim(),
        category: taskCategory,
        coins: Number(taskCoins),
        childID: child.id,
        recurrence: "daily",
        seriesId: newTaskRef.id,
        status: "notdone",
        approvalNeeded: taskApprovalNeeded,
        approvedBy: null,
        completedAt: null,
        dueDate: Timestamp.now(),
        createdAt: Timestamp.now(),
        xp: 10,
      });

      setAddTaskModal(false);
      resetTaskForm();
      await refreshDailyTasks();
    } catch (error) {
      console.error("Error adding daily task:", error);
      Alert.alert("Error", "Could not add daily task.");
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask?.id) return;

    if (!taskDescription.trim()) {
      Alert.alert("Missing description", "Please enter a task description.");
      return;
    }

    if (!taskCategory) {
      Alert.alert("Missing category", "Please select a category.");
      return;
    }

    if (!taskCoins) {
      Alert.alert("Missing coins", "Please select a coin reward.");
      return;
    }

    try {
      await updateDoc(doc(db, "Task", selectedTask.id), {
        description: taskDescription.trim(),
        category: taskCategory,
        coins: Number(taskCoins),
        approvalNeeded: taskApprovalNeeded,
      });

      setEditTaskModal(false);
      resetTaskForm();
      await refreshDailyTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Could not update task.");
    }
  };

  const handleDeleteTask = (taskId) => {
    if (dailyTasks.length <= 3) {
      Alert.alert("Cannot Delete", "You must maintain at least 3 daily tasks.");
      return;
    }
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this daily task?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "Task", taskId));
              await refreshDailyTasks();
            } catch (error) {
              console.error("Error deleting task:", error);
              Alert.alert("Error", "Could not delete task.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        <Pressable
          onPress={() => setMode("child")}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 10,
            backgroundColor: "#ffffff",
            borderRadius: 9999,
            padding: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Ionicons name="swap-horizontal" size={28} color="#374151" />
        </Pressable>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        >
          <Text className="text-[#7F7DCE] text-[30px] font-black text-center mt-2 mb-6">
            Settings
          </Text>

          {/* CHILD NAME */}
          <View className="bg-[#ECEBFF] p-4 rounded-2xl mb-5">
            <Text className="text-[#150F59] text-lg font-bold mb-3">
              Child Name
            </Text>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
                <Text className="text-lg text-[#150F59]">
                  {child?.name || "Not set"}
                </Text>
              </View>

              <Pressable
                onPress={() => setNameModal(true)}
                className="ml-3 w-10 h-10 rounded-full bg-[#4F46E5] items-center justify-center"
              >
                <MaterialCommunityIcons name="pencil" size={18} color="white" />
              </Pressable>
            </View>
          </View>

          {/* PARENT PIN */}
          <View className="bg-[#ECEBFF] p-4 rounded-2xl mb-5">
            <Text className="text-[#150F59] text-lg font-bold mb-3">
              Parent PIN
            </Text>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                <Text className="text-lg text-[#150F59]">
                  {showPin ? parent?.pin : "****"}
                </Text>

                <Pressable onPress={() => setShowPin(!showPin)}>
                  <Ionicons
                    name={showPin ? "eye-off" : "eye"}
                    size={20}
                    color="#6B7280"
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={() => setPinModal(true)}
                className="ml-3 w-10 h-10 rounded-full bg-[#4F46E5] items-center justify-center"
              >
                <MaterialCommunityIcons name="pencil" size={18} color="white" />
              </Pressable>
            </View>
          </View>

          {/* DAILY TASK MANAGEMENT */}
          <View className="bg-[#ECEBFF] p-4 rounded-2xl mb-5">
            <Text className="text-[#150F59] text-lg font-bold mb-3">
              Daily Tasks
            </Text>

            {loadingTasks ? (
              <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
                <Text className="text-gray-500">Loading daily tasks...</Text>
              </View>
            ) : dailyTasks.length === 0 ? (
              <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
                <Text className="text-gray-500">No daily tasks yet.</Text>
              </View>
            ) : (
              dailyTasks.map((task) => (
                <View
                  key={task.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-3">
                      <Text className="text-[#150F59] text-base font-bold">
                        {task.description}
                      </Text>

                      <Text className="text-[#7F7DCE] text-sm mt-2">
                        {task.category} • {task.coins || 0} coins
                        {task.approvalNeeded && " • Requires Approval"}
                      </Text>
                    </View>

                    <View className="flex-row">
                      <Pressable
                        onPress={() => openEditTaskModal(task)}
                        className="w-9 h-9 rounded-full bg-[#4F46E5] items-center justify-center mr-2"
                      >
                        <MaterialCommunityIcons
                          name="pencil"
                          size={17}
                          color="white"
                        />
                      </Pressable>

                      <Pressable
                        onPress={() => handleDeleteTask(task.id)}
                        className="w-9 h-9 rounded-full bg-[#e54646] items-center justify-center"
                      >
                        <MaterialCommunityIcons
                          name="trash-can-outline"
                          size={17}
                          color="white"
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))
            )}

            <Pressable
              onPress={() => {
                resetTaskForm();
                setAddTaskModal(true);
              }}
              className="bg-white border-2 border-dashed border-[#7F7DCE] rounded-xl py-4 items-center justify-center"
            >
              <Ionicons name="add-circle-outline" size={24} color="#7F7DCE" />
              <Text className="text-[#7F7DCE] font-semibold mt-1">
                Add Daily Task
              </Text>
            </Pressable>
          </View>

          {/* LOGOUT */}
          <View className="mt-4 pb-6">
            <Pressable
              onPress={handleSignOut}
              className="bg-[#e54646] rounded-xl py-4 items-center"
            >
              <Text className="text-white text-lg font-semibold">Log Out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {/* EDIT NAME MODAL */}
      <Modal visible={nameModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-5">
            <Text className="text-xl font-bold mb-3 text-[#150F59]">
              Edit Child Name
            </Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              className="border border-gray-200 rounded-lg p-3 mb-4 text-lg"
            />

            <View className="flex-row justify-end">
              <Pressable
                onPress={() => setNameModal(false)}
                className="mr-3 px-4 py-2 bg-gray-200 rounded-full"
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveName}
                className="px-4 py-2 bg-indigo-600 rounded-full"
              >
                <Text className="text-white">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT PIN MODAL */}
      <Modal visible={pinModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-5">
            <Text className="text-xl font-bold mb-3 text-[#150F59]">
              Edit Parent PIN
            </Text>

            <TextInput
              value={newPin}
              onChangeText={setNewPin}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              className="border border-gray-200 rounded-lg p-3 mb-4 text-lg"
            />

            <View className="flex-row justify-end">
              <Pressable
                onPress={() => setPinModal(false)}
                className="mr-3 px-4 py-2 bg-gray-200 rounded-full"
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSavePin}
                className="px-4 py-2 bg-indigo-600 rounded-full"
              >
                <Text className="text-white">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD TASK MODAL */}
      <Modal visible={addTaskModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-4 shadow-md max-h-[90%]">
            <ScrollView>
              <Text className="text-xl font-bold text-[#150F59] mb-4">
                Add Daily Task
              </Text>

              {/* Description */}
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Description
              </Text>
              <TextInput
                placeholder="Task description"
                value={taskDescription}
                onChangeText={setTaskDescription}
                autoCapitalize="words"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-200 rounded-lg p-3 mb-4 text-lg"
              />

              {/* Category */}
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Category
              </Text>
              <Dropdown
                data={categories}
                labelField="label"
                valueField="value"
                placeholder="Select Category"
                value={taskCategory}
                onChange={(item) => {
                  setTaskCategory(item.value);
                }}
                style={{
                  borderColor: "#E5E7EB",
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                }}
                placeholderStyle={{ color: "#9CA3AF", fontSize: 16 }}
                selectedTextStyle={{ color: "#111827", fontSize: 16 }}
                inputSearchStyle={{ color: "#111827", fontSize: 16 }}
              />

              {/* Coins */}
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Coins Reward
              </Text>
              <Dropdown
                data={coinOptions}
                labelField="label"
                valueField="value"
                placeholder="Select Coins"
                value={taskCoins}
                onChange={(item) => {
                  setTaskCoins(item.value);
                }}
                style={{
                  borderColor: "#E5E7EB",
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                }}
                placeholderStyle={{ color: "#9CA3AF", fontSize: 16 }}
                selectedTextStyle={{ color: "#111827", fontSize: 16 }}
                inputSearchStyle={{ color: "#111827", fontSize: 16 }}
              />

              {/* Approval Needed */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-700 text-lg">
                  Requires Parent Approval
                </Text>
                <Checkbox
                  value={taskApprovalNeeded}
                  onValueChange={setTaskApprovalNeeded}
                  color={taskApprovalNeeded ? "#4F46E5" : undefined}
                />
              </View>

              {/* Buttons */}
              <View className="flex-row justify-end gap-3">
                <Pressable
                  onPress={() => {
                    setAddTaskModal(false);
                    resetTaskForm();
                  }}
                  className="px-4 py-2 rounded-full bg-gray-200"
                >
                  <Text className="text-lg">Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleAddTask}
                  className="px-4 py-2 rounded-full bg-indigo-600"
                >
                  <Text className="text-white text-lg">Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* EDIT TASK MODAL */}
      <Modal visible={editTaskModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-4 shadow-md max-h-[90%]">
            <ScrollView>
              <Text className="text-xl font-bold text-[#150F59] mb-4">
                Edit Daily Task
              </Text>

              {/* Description */}
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Description
              </Text>
              <TextInput
                placeholder="Task description"
                value={taskDescription}
                onChangeText={setTaskDescription}
                autoCapitalize="words"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-200 rounded-lg p-3 mb-4 text-lg"
              />

              {/* Category */}
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Category
              </Text>
              <Dropdown
                data={categories}
                labelField="label"
                valueField="value"
                placeholder="Select Category"
                value={taskCategory}
                onChange={(item) => {
                  setTaskCategory(item.value);
                }}
                style={{
                  borderColor: "#E5E7EB",
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                }}
                placeholderStyle={{ color: "#9CA3AF", fontSize: 16 }}
                selectedTextStyle={{ color: "#111827", fontSize: 16 }}
                inputSearchStyle={{ color: "#111827", fontSize: 16 }}
              />

              {/* Coins */}
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Coins Reward
              </Text>
              <Dropdown
                data={coinOptions}
                labelField="label"
                valueField="value"
                placeholder="Select Coins"
                value={taskCoins}
                onChange={(item) => {
                  setTaskCoins(item.value);
                }}
                style={{
                  borderColor: "#E5E7EB",
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                }}
                placeholderStyle={{ color: "#9CA3AF", fontSize: 16 }}
                selectedTextStyle={{ color: "#111827", fontSize: 16 }}
                inputSearchStyle={{ color: "#111827", fontSize: 16 }}
              />

              {/* Approval Needed */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-700 text-lg">
                  Requires Parent Approval
                </Text>
                <Checkbox
                  value={taskApprovalNeeded}
                  onValueChange={setTaskApprovalNeeded}
                  color={taskApprovalNeeded ? "#4F46E5" : undefined}
                />
              </View>

              {/* Buttons */}
              <View className="flex-row justify-end gap-3">
                <Pressable
                  onPress={() => {
                    setEditTaskModal(false);
                    resetTaskForm();
                  }}
                  className="px-4 py-2 rounded-full bg-gray-200"
                >
                  <Text className="text-lg">Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleUpdateTask}
                  className="px-4 py-2 rounded-full bg-indigo-600"
                >
                  <Text className="text-white text-lg">Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;
