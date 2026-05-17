// parent settings screen
// this screen lets the parent update child details, change the parent pin,
// manage default daily tasks, switch back to child mode, and sign out
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
  where,
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
  // allows the parent to switch back to the child interface
  const { setMode } = useMode();

  // gets the current child and parent data from global app data
  const { child, parent } = useAppData();

  // controls whether the parent pin is shown or hidden
  const [showPin, setShowPin] = useState(false);

  // controls the child name and parent pin edit modals
  const [nameModal, setNameModal] = useState(false);
  const [pinModal, setPinModal] = useState(false);

  // local input values for editing the child name and parent pin
  const [newName, setNewName] = useState(child?.name || "");
  const [newPin, setNewPin] = useState(parent?.pin || "");
  const [pinError, setPinError] = useState("");

  // stores the latest version of each daily recurring task
  const [dailyTasks, setDailyTasks] = useState([]);

  // tracks whether the daily tasks are still loading
  const [loadingTasks, setLoadingTasks] = useState(true);

  // controls the add and edit daily task modals
  const [addTaskModal, setAddTaskModal] = useState(false);
  const [editTaskModal, setEditTaskModal] = useState(false);

  // stores the task currently being edited and the form values for add/edit task
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskCategory, setTaskCategory] = useState(null);
  const [taskCoins, setTaskCoins] = useState("");
  const [taskApprovalNeeded, setTaskApprovalNeeded] = useState(true);

  // task categories available when adding or editing a daily task
  const categories = [
    { label: "Exercise", value: "Exercise" },
    { label: "Learning", value: "Learning" },
    { label: "Hygiene", value: "Hygiene" },
    { label: "Food", value: "Food" },
    { label: "Play", value: "Play" },
  ];

  // fixed coin reward options so parents cannot enter random reward values
  const coinOptions = [
    { label: "5", value: "5" },
    { label: "10", value: "10" },
    { label: "15", value: "15" },
    { label: "20", value: "20" },
  ];

  useEffect(() => {
    // keep the name input updated if the child data changes
    setNewName(child?.name || "");
  }, [child]);

  useEffect(() => {
    // keep the pin input updated if the parent data changes
    setNewPin(parent?.pin || "");
  }, [parent]);

  useEffect(() => {
    const fetchDailyTasks = async () => {
      // if there is no child profile yet, there are no tasks to load
      if (!child?.id) {
        setDailyTasks([]);
        setLoadingTasks(false);
        return;
      }

      try {
        setLoadingTasks(true);

        // fetch only this child's daily recurring tasks
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

        // daily tasks are recreated over time, so there may be many documents
        // for the same recurring task. this keeps only the latest task from each series.
        const latestTasksMap = new Map();

        tasksList.forEach((task) => {
          // seriesId groups repeated versions of the same daily task together
          // description and id are fallbacks in case old tasks do not have a seriesId
          const key =
            task.seriesId || task.description?.trim()?.toLowerCase() || task.id;
          const existingTask = latestTasksMap.get(key);

          const currentCreatedAt = task.createdAt?.toMillis?.() ?? 0;
          const existingCreatedAt = existingTask?.createdAt?.toMillis?.() ?? 0;

          // keep the most recently created version of the task
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
    // reload daily tasks after adding, editing or deleting one
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

      // group repeated task documents by seriesId so only one version is shown in settings
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
      console.error("Error refreshing daily tasks:", error);
    }
  };

  const handleSaveName = async () => {
    try {
      // update the child's display name in firestore
      await editChildName(child.id, newName);
      setNameModal(false);
    } catch (error) {
      console.error("Error saving child name:", error);
      Alert.alert("Error", "Could not update child name.");
    }
  };

  const handleSavePin = async () => {
    // parent pins must be exactly 4 digits
    if (!/^[0-9]{4}$/.test(newPin)) {
      setPinError("PIN must be exactly 4 digits.");
      return;
    }

    try {
      setPinError("");

      // update the pin used for entering parent mode
      await editParentPin(parent.id, newPin);
      setPinModal(false);
    } catch (error) {
      console.error("Error saving parent pin:", error);
      Alert.alert("Error", "Could not update parent PIN.");
    }
  };

  const handleSignOut = () => {
    // confirmation alert prevents the parent signing out by accident
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
    // clears the task form so old values do not remain when opening a modal again
    setSelectedTask(null);
    setTaskDescription("");
    setTaskCategory(null);
    setTaskCoins("");
    setTaskApprovalNeeded(true);
  };

  const openEditTaskModal = (task) => {
    // pre-fill the edit modal with the selected task's current values
    setSelectedTask(task);
    setTaskDescription(task?.description || "");
    setTaskCategory(task?.category || null);
    setTaskCoins(task?.coins != null ? String(task.coins) : "");
    setTaskApprovalNeeded(task?.approvalNeeded ?? true);
    setEditTaskModal(true);
  };

  const handleAddTask = async () => {
    // basic validation before creating a new daily task
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
      // create a new daily task with its own document id
      const newTaskRef = doc(collection(db, "Task"));

      await setDoc(newTaskRef, {
        description: taskDescription.trim(),
        category: taskCategory,
        coins: Number(taskCoins),
        childID: child.id,
        recurrence: "daily",

        // this starts a new recurring series for the task
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

      // reload the list so the new task appears straight away
      await refreshDailyTasks();
    } catch (error) {
      console.error("Error adding daily task:", error);
      Alert.alert("Error", "Could not add daily task.");
    }
  };

  const handleUpdateTask = async () => {
    // do nothing if no task has been selected
    if (!selectedTask?.id) return;

    // validate the edited task values
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
      const updateData = {
        description: taskDescription.trim(),
        category: taskCategory,
        coins: Number(taskCoins),
        approvalNeeded: taskApprovalNeeded,
      };

      // use the seriesId so all repeated versions of the same daily task are updated
      const seriesId = selectedTask.seriesId || selectedTask.id;

      const q = query(
        collection(db, "Task"),
        where("childID", "==", child.id),
        where("recurrence", "==", "daily"),
        where("seriesId", "==", seriesId),
      );

      const snapshot = await getDocs(q);

      // update every document in that recurring series, not just the latest one
      const updatePromises = snapshot.docs.map((docSnap) =>
        updateDoc(doc(db, "Task", docSnap.id), updateData),
      );

      await Promise.all(updatePromises);

      setEditTaskModal(false);
      resetTaskForm();

      // reload the displayed daily tasks after editing
      await refreshDailyTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Could not update task.");
    }
  };

  const handleDeleteTask = (task) => {
    // keep at least 3 daily tasks so the child always has a minimum daily routine
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
              // delete all documents in the same recurring series
              const seriesId = task.seriesId || task.id;

              const q = query(
                collection(db, "Task"),
                where("childID", "==", child.id),
                where("recurrence", "==", "daily"),
                where("seriesId", "==", seriesId),
              );

              const snapshot = await getDocs(q);

              const deletePromises = snapshot.docs.map((docSnap) =>
                deleteDoc(doc(db, "Task", docSnap.id)),
              );

              await Promise.all(deletePromises);

              // reload the list after deleting
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
        {/* switch back to child mode when the parent is finished */}
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

          {/* child name section */}
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

              {/* opens the child name edit modal */}
              <Pressable
                onPress={() => setNameModal(true)}
                className="ml-3 w-10 h-10 rounded-full bg-[#4F46E5] items-center justify-center"
              >
                <MaterialCommunityIcons name="pencil" size={18} color="white" />
              </Pressable>
            </View>
          </View>

          {/* parent pin section */}
          <View className="bg-[#ECEBFF] p-4 rounded-2xl mb-5">
            <Text className="text-[#150F59] text-lg font-bold mb-3">
              Parent PIN
            </Text>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                <Text className="text-lg text-[#150F59]">
                  {showPin ? parent?.pin : "****"}
                </Text>

                {/* toggles between showing and hiding the pin */}
                <Pressable onPress={() => setShowPin(!showPin)}>
                  <Ionicons
                    name={showPin ? "eye-off" : "eye"}
                    size={20}
                    color="#6B7280"
                  />
                </Pressable>
              </View>

              {/* opens the pin edit modal */}
              <Pressable
                onPress={() => setPinModal(true)}
                className="ml-3 w-10 h-10 rounded-full bg-[#4F46E5] items-center justify-center"
              >
                <MaterialCommunityIcons name="pencil" size={18} color="white" />
              </Pressable>
            </View>
          </View>

          {/* daily task management section */}
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
                      {/* edit this daily task series */}
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

                      {/* delete this daily task series */}
                      <Pressable
                        onPress={() => handleDeleteTask(task)}
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

            {/* opens the add daily task modal */}
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

          {/* logout section */}
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

      {/* edit child name modal */}
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

      {/* edit parent pin modal */}
      <Modal visible={pinModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-5">
            <Text className="text-xl font-bold mb-3 text-[#150F59]">
              Edit Parent PIN
            </Text>

            <TextInput
              value={newPin}
              onChangeText={(value) => {
                setNewPin(value);
                setPinError("");
              }}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              className="border border-gray-200 rounded-lg p-3 mb-4 text-lg"
            />

            {/* show validation error if the pin is not exactly 4 digits */}
            {pinError ? (
              <Text className="text-red mb-3">{pinError}</Text>
            ) : null}

            <View className="flex-row justify-end">
              <Pressable
                onPress={() => {
                  setPinError("");
                  setPinModal(false);
                }}
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

      {/* add daily task modal */}
      <Modal visible={addTaskModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-4 shadow-md max-h-[90%]">
            <ScrollView>
              <Text className="text-xl font-bold text-[#150F59] mb-4">
                Add Daily Task
              </Text>

              {/* task description input */}
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

              {/* category dropdown */}
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

              {/* coin reward dropdown */}
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

              {/* parent approval toggle */}
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

              {/* add task buttons */}
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

      {/* edit daily task modal */}
      <Modal visible={editTaskModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-4 shadow-md max-h-[90%]">
            <ScrollView>
              <Text className="text-xl font-bold text-[#150F59] mb-4">
                Edit Daily Task
              </Text>

              {/* task description input */}
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

              {/* category dropdown */}
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

              {/* coin reward dropdown */}
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

              {/* parent approval toggle */}
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

              {/* edit task buttons */}
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
