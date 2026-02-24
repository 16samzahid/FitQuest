import Checkbox from "expo-checkbox";
import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export default function AddTaskModal({ visible, onClose, onCreate }) {
  const [description, setDescription] = useState("");
  const [approvalNeeded, setApprovalNeeded] = useState(true);
  const [category, setCategory] = useState(null);
  const categories = [
    { label: "Exercise", value: "Exercise" },
    { label: "Learning", value: "Learning" },
    { label: "Hygiene", value: "Hygiene" },
    { label: "Food", value: "Food" },
    { label: "Play", value: "Play" },
  ];

  const handleCreate = () => {
    if (!description.trim()) return;
    onCreate({ description: description.trim(), approvalNeeded });
    setDescription("");
    setApprovalNeeded(true);
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 bg-black/40 justify-center items-center px-6">
        <View className="w-full bg-white rounded-2xl p-4 shadow-md">
          <Text className="text-lg font-bold text-[#150F59] mb-2">
            Create Task
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Task description"
            className="border border-gray-200 rounded-lg p-3 mb-4"
          />
          {/* Approval Checkbox */}
          <View className="flex-row items-center mb-6">
            <Checkbox
              value={approvalNeeded}
              onValueChange={setApprovalNeeded}
              color={approvalNeeded ? "#4F46E5" : undefined}
            />
            <Text className="ml-3 text-gray-700">Requires Parent Approval</Text>
          </View>
          {/* Category Dropdown */}
          <Dropdown
            data={categories}
            labelField="label"
            valueField="value"
            placeholder="Select Category"
            value={category}
            onChange={(item) => {
              setCategory(item.value);
            }}
            className="mb-6"
            containerStyle={{
              borderColor: "#E5E7EB",
              borderWidth: 1,
              borderRadius: 8,
            }}
            placeholderStyle={{ color: "#9CA3AF" }}
            selectedTextStyle={{ color: "#111827" }}
            inputSearchStyle={{ color: "#111827" }}
          />

          <View className="flex-row justify-end space-x-3">
            <Pressable
              className="px-4 py-2 rounded-full bg-gray-200"
              onPress={() => {
                setDescription("");
                onClose();
              }}
            >
              <Text>Cancel</Text>
            </Pressable>

            <Pressable
              className="px-4 py-2 rounded-full bg-indigo-600"
              onPress={() => {
                handleCreate();
                onClose();
              }}
            >
              <Text className="text-white">Create Task</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
