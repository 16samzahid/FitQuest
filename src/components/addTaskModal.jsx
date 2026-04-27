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
  const { child } = useAppData();
  const [description, setDescription] = useState("");
  const [approvalNeeded, setApprovalNeeded] = useState(true);
  const [category, setCategory] = useState(null);
  const [coins, setCoins] = useState("");

  // due date
  const [dueDate, setDueDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  // recurring
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // completed tasks history
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // AI loading state
  const [aiLoading, setAiLoading] = useState(false);

  const categories = [
    { label: "Exercise", value: "Exercise" },
    { label: "Learning", value: "Learning" },
    { label: "Hygiene", value: "Hygiene" },
    { label: "Food", value: "Food" },
    { label: "Play", value: "Play" },
    { label: "Water", value: "Water" },
  ];

  const coinOptions = [
    { label: "5", value: "5" },
    { label: "10", value: "10" },
    { label: "15", value: "15" },
    { label: "20", value: "20" },
  ];

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
    if (visible && childID) {
      const fetchCompletedTasks = async () => {
        const tasks = await getCompletedTasks(childID);
        setCompletedTasks(tasks);
      };
      fetchCompletedTasks();
    }
  }, [visible, childID]);

  const selectFromHistory = (task) => {
    setDescription(task.description);
    setApprovalNeeded(task.approvalNeeded);
    setCategory(task.category);
    setCoins(task.coins.toString());
    // setDueDate(task.dueDate ? task.dueDate.toDate() : null);
    setIsRecurring(!!task.recurrence);
    if (task.recurrence) {
      setSelectedDay(weekdays.indexOf(task.recurrence));
    }
    setShowHistory(false);
  };

  const toggleDay = (index) => {
    if (selectedDay === index) {
      setSelectedDay(null);
    } else {
      setSelectedDay(index);
    }
  };

  const getAISuggestion = async () => {
    try {
      if (!child) {
        Alert.alert("Error", "No child selected");
        return;
      }

      setAiLoading(true);
      const suggestion = await generateTaskSuggestion(child);
      console.log("AI suggestion:", suggestion);

      if (suggestion) {
        setDescription(suggestion.description || "");
        setCategory(suggestion.category || null);
        setCoins(suggestion.coins?.toString() || "");
      }
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      Alert.alert(
        "Error",
        error.message || "Could not get AI suggestion. Please try again.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreate = () => {
    if (!description.trim()) return;

    onCreate({
      description: description.trim(),
      approvalNeeded,
      category,
      coins: Number(coins),
      // only one of these will be filled
      dueDate: isRecurring ? null : dueDate,
      recurrence:
        isRecurring && selectedDay !== null ? weekdays[selectedDay] : null,
    });

    // reset form
    setDescription("");
    setApprovalNeeded(true);
    setCategory(null);
    setCoins("");
    setDueDate(null);
    setSelectedDay(null);
    setIsRecurring(false);
    setShowHistory(false);
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 bg-black/40 justify-center items-center px-6">
        <View className="w-full bg-white rounded-2xl p-4 shadow-md">
          <Text className="text-xl font-bold text-[#150F59] mb-2">
            Create Task
          </Text>

          <View className="flex-row items-center justify-between mb-4">
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

          {showHistory && (
            <View className="mb-4 max-h-48">
              <Text className="text-lg font-semibold mb-2">
                Completed Tasks:
              </Text>
              <ScrollView>
                {completedTasks
                  .reduce((uniqueTasks, task) => {
                    // Only include if we haven't seen this description before
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

          {/* Description */}
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Task description"
            autoCapitalize="words"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-lg p-3 mb-4 text-lg"
          />

          {/* Category */}
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

          {/* Coins */}
          {/* <TextInput
            value={coins}
            onChangeText={handleCoinsChange}
            placeholder="Coins Reward (Suggested: 10)"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            className="border border-gray-200 rounded-lg p-3 mb-4 text-lg"
          /> */}
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

          {/* Repeat Task Checkbox */}
          <View className="flex-row justify-end mb-4 items-center">
            <Text className="mr-3 text-gray-700 text-lg">Repeating Task</Text>

            <Checkbox
              value={isRecurring}
              onValueChange={(value) => {
                setIsRecurring(value);

                // remove due date if switching to recurring
                if (value) setDueDate(null);
              }}
              color={isRecurring ? "#4F46E5" : undefined}
            />
          </View>

          {/* Weekday selector */}
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

          {/* Due Date (only for one-time tasks) */}
          {!isRecurring && (
            <>
              <Pressable
                onPress={() => {
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

                    setDueDate(selectedDate || dueDate || new Date());
                  }}
                />
              )}
            </>
          )}

          {/* Approval Checkbox */}
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

          {/* Buttons */}
          <View className="flex-row justify-end">
            <Pressable
              className="px-4 py-2 rounded-full bg-gray-200 mr-2"
              onPress={() => {
                setDescription("");
                setCoins("");
                setDueDate(null);
                setSelectedDay(null);
                setIsRecurring(false);

                onClose();
              }}
            >
              <Text className="text-lg">Cancel</Text>
            </Pressable>

            <Pressable
              className="px-4 py-2 rounded-full bg-indigo-600"
              onPress={() => {
                handleCreate();

                onClose();
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
