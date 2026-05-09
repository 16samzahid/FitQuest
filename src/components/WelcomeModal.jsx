import { Modal, Pressable, Text, View } from "react-native";

export default function WelcomeModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full max-w-sm items-center rounded-3xl bg-white px-7 py-9 shadow-lg">
          <Text className="mb-5 text-center text-3xl font-bold text-indigo-700">
            Welcome to FitQuest
          </Text>

          {/* Show the default parent PIN for new users. */}
          <Text className="mb-3 text-center text-lg leading-8 text-gray-700">
            Your default parent PIN is
          </Text>

          <Text className="mb-5 text-center text-4xl font-extrabold text-indigo-600">
            1234
          </Text>

          {/* Explain what can be customized in settings. */}
          <Text className="mb-2 text-center text-base leading-7 text-gray-700">
            You can change{" "}
            <Text className="font-bold text-lg">the Child Name</Text>,
          </Text>

          <Text className="mb-2 text-center text-base leading-7 text-gray-700">
            <Text className="font-bold text-lg">Parent PIN</Text>
          </Text>

          <Text className="mb-7 text-center text-base leading-7 text-gray-700">
            and <Text className="font-bold text-lg">Daily Tasks</Text> in
            Settings.
          </Text>

          {/* Close the modal when OK is pressed, allowing the user to proceed. */}
          <Pressable
            onPress={onClose}
            className="w-full rounded-2xl bg-indigo-600 py-4 active:bg-indigo-700"
          >
            <Text className="text-center text-lg font-semibold text-white">
              OK
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
