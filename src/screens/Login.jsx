import { useNavigation } from "@react-navigation/native";
import { Text, TouchableOpacity, View } from "react-native";

export default function Login() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

      <Text className="text-blue text-2xl font-bold">Login Screen</Text>

      <View className = "mt-8 flex-row">
        <TouchableOpacity className = "p-4 m-2 rounded bg-opacity-75 bg-lightBlue"
            onPress={() => navigation.navigate("Details")}
        >
            <Text>I am a Parent</Text>
        </TouchableOpacity>
        </View>


    </View>
  );
}
