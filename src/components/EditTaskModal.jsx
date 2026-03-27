import DateTimePicker from "@react-native-community/datetimepicker";
import Checkbox from "expo-checkbox";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export default function EditTaskModal({ visible, onClose, onEdit, task }) {
  const [description, setDescription] = useState(task?.description || "");
  const [approvalNeeded, setApprovalNeeded] = useState(
    task?.approvalNeeded || true,
  );
  const [category, setCategory] = useState(task?.category || null);
  const [coins, setCoins] = useState(task?.coins ? task.coins.toString() : "");

  // due date
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.toDate() : null,
  );
  const [showPicker, setShowPicker] = useState(true);

  // recurring
  const [isRecurring, setIsRecurring] = useState(!!task?.recurrence);

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

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const [selectedDay, setSelectedDay] = useState(
    task?.recurrence ? weekdays.indexOf(task.recurrence) : null,
  );
  useEffect(() => {
    if (!task) return;

    setDescription(task.description || "");

    setApprovalNeeded(task.approvalNeeded ?? true);

    setCategory(task.category || null);

    setCoins(task.coins ? task.coins.toString() : "");

    setDueDate(task.dueDate ? task.dueDate.toDate() : null);

    setIsRecurring(!!task.recurrence);

    setSelectedDay(task.recurrence ? weekdays.indexOf(task.recurrence) : null);
  }, [task]);

  const toggleDay = (index) => {
    if (selectedDay === index) {
      setSelectedDay(null);
    } else {
      setSelectedDay(index);
    }
  };

  const handleEdit = () => {
    if (!description.trim()) return;

    onEdit({
      description: description.trim(),

      approvalNeeded,

      category,

      coins: Number(coins),

      dueDate: isRecurring ? null : (dueDate ?? task?.dueDate?.toDate()),

      recurrence:
        isRecurring && selectedDay !== null ? weekdays[selectedDay] : null,
    });

    // reset form
    // setDescription("");
    // setApprovalNeeded(true);
    // setCategory(null);
    // setCoins("");
    // setDueDate(null);
    // setSelectedDay(null);
    // setIsRecurring(false);
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 bg-black/40 justify-center items-center px-6">
        <View className="w-full bg-white rounded-2xl p-4 shadow-md">
          <Text className="text-xl font-bold text-[#150F59] mb-2">
            Create Task
          </Text>

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

                    // only update if user actually picked a date
                    if (selectedDate) {
                      setDueDate(selectedDate);
                    }
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
                handleEdit();

                onClose();
              }}
            >
              <Text className="text-white text-lg">Edit Task</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
