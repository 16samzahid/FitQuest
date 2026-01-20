import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMode } from "../../context/ModeContext";

const Settings = () => {
  const { setMode } = useMode();
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 px-4">
        <Text>Settings</Text>
        {/* Switch mode button */}
        <Pressable
          onPress={() => setMode("child")}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 10,
          }}
        >
          <Ionicons name="swap-horizontal" size={30} color="#374151" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
