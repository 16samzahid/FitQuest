// add task modal
// this popup is used by the parent to create a new task for the child
// it supports one-time tasks, weekly repeating tasks, task history, and ai suggestions
import AntDesign from "@expo/vector-icons/AntDesign";
import DateTimePicker from "@react-native-community/datetimepicker";
import Checkbox from "expo-checkbox";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useAppData } from "../context/AppDataContext";
import { generateTaskSuggestion } from "../services/aiService";
import { getCompletedTasks } from "../services/taskService";

export default function AddTaskModal({ visible, onClose, onCreate, childID }) {
  // get the current child so ai suggestions can use their current stats
  const { child } = useAppData();

  // main form fields for the new task
  const [description, setDescription] = useState("");
  const [approvalNeeded, setApprovalNeeded] = useState(true);
  const [category, setCategory] = useState(null);
  const [coins, setCoins] = useState("");
  const [validationError, setValidationError] = useState("");

  // due date is used for one-time tasks only
  const [dueDate, setDueDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  // recurring task state
  // if isRecurring is true, the parent selects a weekday instead of a due date
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // stores previously completed tasks so the parent can reuse old ideas
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // tracks when the ai suggestion is loading
  const [aiLoading, setAiLoading] = useState(false);

  // fixed task categories used across the app
  // these match the categories used for pet stat rewards
  const categories = [
    { label: "Exercise", value: "Exercise" },
    { label: "Learning", value: "Learning" },
    { label: "Hygiene", value: "Hygiene" },
    { label: "Food", value: "Food" },
    { label: "Play", value: "Play" },
    { label: "Water", value: "Water" },
  ];

  // fixed coin values so rewards stay controlled
  const coinOptions = [
    { label: "5", value: "5" },
    { label: "10", value: "10" },
    { label: "15", value: "15" },
    { label: "20", value: "20" },
  ];

  // full weekday names are saved as recurrence values in firestore
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    // when the modal opens, load this child's completed tasks for the history section
    if (visible && childID) {
      const fetchCompletedTasks = async () => {
        const tasks = await getCompletedTasks(childID);
        setCompletedTasks(tasks);
      };

      fetchCompletedTasks();
    }
  }, [visible, childID]);

  const selectFromHistory = (task) => {
    // fills the form using a previously completed task
    // this helps the parent quickly recreate a similar task
    setDescription(task.description);
    setApprovalNeeded(task.approvalNeeded);
    setCategory(task.category);
    setCoins(task.coins.toString());

    // if the old task was recurring, restore its recurring setting
    setIsRecurring(!!task.recurrence);

    if (task.recurrence) {
      setSelectedDay(weekdays.indexOf(task.recurrence));
    }

    setShowHistory(false);
  };

  const toggleDay = (index) => {
    // allows one weekday to be selected for a repeating task
    // pressing the same day again removes the selection
    if (selectedDay === index) {
      setSelectedDay(null);
    } else {
      setSelectedDay(index);
    }
  };

  const getAISuggestion = async () => {
    try {
      // ai suggestions need child data, such as pet stats
      if (!child) {
        Alert.alert("Error", "No child selected");
        return;
      }

      setAiLoading(true);

      // ask the ai service for one task suggestion
      const suggestion = await generateTaskSuggestion(child);
      console.log("AI suggestion:", suggestion);

      // use the ai response to fill the form fields
      if (suggestion) {
        setDescription(suggestion.description || "");
        setCategory(suggestion.category || null);
        setCoins(suggestion.coins?.toString() || "");
      }
    } catch (error) {
      console.error("Error getting AI suggestion:", error);

      // show a clear message if the ai feature fails
      Alert.alert(
        "Error",
        error.message || "Could not get AI suggestion. Please try again.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreate = () => {
    // clear any old validation message before checking the form again
    setValidationError("");

    // validation checks stop incomplete tasks being saved
    if (!child) {
      setValidationError("No child selected.");
      return false;
    }

    if (!description.trim()) {
      setValidationError("Task description cannot be empty.");
      return false;
    }

    if (!category) {
      setValidationError("Please select a category.");
      return false;
    }

    if (!coins) {
      setValidationError("Please select a coin reward.");
      return false;
    }

    if (isRecurring && selectedDay === null) {
      setValidationError("Please select a day for the recurring task.");
      return false;
    }

    if (!isRecurring && !dueDate) {
      setValidationError("Please select a due date for one-time tasks.");
      return false;
    }

    // send the completed task data back to the parent screen
    // ManageTasks then creates the firestore document
    onCreate({
      description: description.trim(),
      approvalNeeded,
      category,
      coins: Number(coins),

      // one-time tasks use dueDate, recurring tasks use recurrence
      dueDate: isRecurring ? null : dueDate,
      recurrence:
        isRecurring && selectedDay !== null ? weekdays[selectedDay] : null,
    });

    // reset form after a successful create
    setDescription("");
    setApprovalNeeded(true);
    setCategory(null);
    setCoins("");
    setDueDate(null);
    setSelectedDay(null);
    setIsRecurring(false);
    setShowHistory(false);
    setValidationError("");

    return true;
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      {/* dark background overlay behind the modal */}
      <View className="flex-1 bg-black/40 justify-center items-center px-6">
        <View className="w-full bg-white rounded-2xl p-4 shadow-md">
          <Text className="text-xl font-bold text-[#150F59] mb-2">
            Create Task
          </Text>

          {/* shows validation errors above the form */}
          {validationError ? (
            <View className="bg-red-50 border border-red rounded-lg p-3 mb-4">
              <Text className="text-red">{validationError}</Text>
            </View>
          ) : null}

          <View className="flex-row items-center justify-between mb-4">
            {/* task history button only appears if there are completed tasks to reuse */}
            {completedTasks.length > 0 && (
              <Pressable
                onPress={() => setShowHistory(!showHistory)}
                className="flex-1 mr-2 py-2 px-3 bg-gray-100 rounded-lg"
              >
                <Text className="text-center text-gray-700 text-lg font-bold">
                  {showHistory ? "Hide History" : "Task History"}
                </Text>
              </Pressable>
            )}

            {/* ai suggestion button fills the form with an ai-generated task */}
            <Pressable
              onPress={getAISuggestion}
              disabled={aiLoading}
              className={`flex-1 ml-2 py-2 px-3 rounded-lg items-center justify-center ${
                aiLoading ? "bg-gray-400" : "bg-blue"
              }`}
            >
              {aiLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <AntDesign name="open-ai" size={24} color="white" />
              )}
            </Pressable>
          </View>

          {/* completed task history list */}
          {showHistory && (
            <View className="mb-4 max-h-48">
              <Text className="text-lg font-semibold mb-2">
                Completed Tasks:
              </Text>

              <ScrollView>
                {completedTasks
                  .reduce((uniqueTasks, task) => {
                    // remove duplicate descriptions so the history list is not repetitive
                    if (
                      !uniqueTasks.find(
                        (t) => t.description === task.description,
                      )
                    ) {
                      uniqueTasks.push(task);
                    }

                    return uniqueTasks;
                  }, [])
                  .map((task) => (
                    // pressing a history item copies its values into the form
                    <Pressable
                      key={task.id}
                      onPress={() => selectFromHistory(task)}
                      className="p-2 mb-1 bg-blue-50 rounded border"
                    >
                      <Text className="text-gray-800">{task.description}</Text>

                      <Text className="text-sm text-gray-600">
                        {task.category} - {task.coins} coins
                      </Text>
                    </Pressable>
                  ))}
              </ScrollView>
            </View>
          )}

          {/* task description input */}
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Task description"
            autoCapitalize="words"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-lg p-3 mb-4 text-lg"
          />

          {/* category dropdown */}
          <Dropdown
            data={categories}
            labelField="label"
            valueField="value"
            placeholder="Select Category"
            value={category}
            onChange={(item) => {
              setCategory(item.value);
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
          <Dropdown
            data={coinOptions}
            labelField="label"
            valueField="value"
            placeholder="Coins Reward (Suggested: 10)"
            value={coins}
            onChange={(item) => {
              setCoins(item.value);
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

          {/* checkbox for making the task repeat weekly */}
          <View className="flex-row justify-end mb-4 items-center">
            <Text className="mr-3 text-gray-700 text-lg">Repeating Task</Text>

            <Checkbox
              value={isRecurring}
              onValueChange={(value) => {
                setIsRecurring(value);

                // recurring tasks do not use a one-time due date
                if (value) setDueDate(null);
              }}
              color={isRecurring ? "#4F46E5" : undefined}
            />
          </View>

          {/* weekday selector only appears if the task is recurring */}
          {isRecurring && (
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 text-lg">Repeat on:</Text>

              <View className="flex-row flex-wrap">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, index) => {
                    const selected = selectedDay === index;

                    return (
                      <Pressable
                        key={index}
                        onPress={() => toggleDay(index)}
                        className={`px-3 py-2 m-1 rounded-lg border
                      ${selected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}
                      >
                        <Text
                          className={`${selected ? "text-white" : "text-gray-700"}`}
                        >
                          {day}
                        </Text>
                      </Pressable>
                    );
                  },
                )}
              </View>
            </View>
          )}

          {/* due date picker only appears for one-time tasks */}
          {!isRecurring && (
            <>
              <Pressable
                onPress={() => {
                  // default to today if no date has been selected yet
                  if (!dueDate) {
                    setDueDate(new Date());
                  }

                  setShowPicker(true);
                }}
                className="border border-gray-200 rounded-lg p-3 mb-4"
              >
                <Text className="text-lg">
                  {dueDate
                    ? `Due: ${dueDate.toDateString()}`
                    : "Select Due Date"}
                </Text>
              </Pressable>

              {showPicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowPicker(false);

                    // keep the selected date, or fall back to the previous/current date
                    setDueDate(selectedDate || dueDate || new Date());
                  }}
                />
              )}
            </>
          )}

          {/* controls whether the parent must approve this task after the child completes it */}
          <View className="flex-row justify-end mb-4 items-center">
            <Text className="mr-3 text-gray-700 text-lg">
              Requires Parent Approval
            </Text>

            <Checkbox
              value={approvalNeeded}
              onValueChange={setApprovalNeeded}
              color={approvalNeeded ? "#4F46E5" : undefined}
            />
          </View>

          {/* modal buttons */}
          <View className="flex-row justify-end">
            <Pressable
              className="px-4 py-2 rounded-full bg-gray-200 mr-2"
              onPress={() => {
                // clear key form values when cancelling
                setDescription("");
                setCoins("");
                setDueDate(null);
                setSelectedDay(null);
                setIsRecurring(false);
                setValidationError("");

                onClose();
              }}
            >
              <Text className="text-lg">Cancel</Text>
            </Pressable>

            <Pressable
              className="px-4 py-2 rounded-full bg-indigo-600"
              onPress={() => {
                // only close the modal if validation passes and task creation starts
                if (handleCreate()) {
                  onClose();
                }
              }}
            >
              <Text className="text-white text-lg">Create Task</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
