import DateTimePicker from "@react-native-community/datetimepicker";
import Checkbox from "expo-checkbox";
import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export default function AddTaskModal({ visible, onClose, onCreate }) {
  const [description, setDescription] = useState("");
  const [approvalNeeded, setApprovalNeeded] = useState(true);
  const [category, setCategory] = useState(null);
  const [coins, setCoins] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const categories = [
    { label: "Exercise", value: "Exercise" },
    { label: "Learning", value: "Learning" },
    { label: "Hygiene", value: "Hygiene" },
    { label: "Food", value: "Food" },
    { label: "Play", value: "Play" },
  ];

  const handleChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setCoins(numericValue);
  };

  const handleCreate = () => {
    if (!description.trim()) return;

    onCreate({
      description: description.trim(),
      approvalNeeded,
      category,
      coins: Number(coins),
      dueDate: dueDate || null,
    });

    setDescription("");
    setApprovalNeeded(true);
    setCategory(null);
    setCoins("");
    setDueDate(null);
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
          <TextInput
            value={coins}
            onChangeText={handleChange}
            placeholder="Coins Reward (Suggested: 10)"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            className="border border-gray-200 rounded-lg p-3 mb-4 text-lg"
          />

          {/* Due Date */}
          <Pressable
            onPress={() => setShowPicker(true)}
            className="border border-gray-200 rounded-lg p-3 mb-4"
          >
            <Text className="text-lg">
              {dueDate
                ? `Due: ${dueDate.toDateString()}`
                : "Select Due Date (Optional)"}
            </Text>
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) setDueDate(selectedDate);
              }}
            />
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
          <View className="flex-row justify-end space-x-3">
            <Pressable
              className="px-4 py-2 rounded-full bg-gray-200 mr-2"
              onPress={() => {
                setDescription("");
                setCoins("");
                setDueDate(null);
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
