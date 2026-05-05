import { Modal, Pressable, Text, View } from "react-native";
// Simple celebratory modal for when the child levels up

export default function LevelUpModal({ visible, level, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full max-w-sm rounded-3xl bg-white px-7 py-9 shadow-lg items-center">
          <Text className="mb-3 text-center text-4xl font-extrabold text-orange-500">
            🎉
          </Text>
          <Text className="mb-3 text-center text-3xl font-bold text-indigo-700">
            Level Up!
          </Text>
          <Text className="mb-6 text-center text-lg leading-8 text-gray-700">
            You reached level {level}!
          </Text>
          <Pressable
            onPress={onClose}
            className="w-full rounded-2xl bg-indigo-600 py-4 active:bg-indigo-700"
          >
            <Text className="text-center text-lg font-semibold text-white">
              Awesome!
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
