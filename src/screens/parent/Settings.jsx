import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from 'react-native';
import { useMode } from "../../context/ModeContext";

const Settings = () => {
  const { setMode } = useMode();
  return (
    <View>
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
        <Ionicons name="swap-horizontal" size={28} color="#374151" />
      </Pressable>
    </View>
  )
}

export default Settings