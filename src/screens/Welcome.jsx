import { useNavigation } from "@react-navigation/native";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Welcome() {
    const navigation = useNavigation();
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

        <Image
            source={require("../../assets/images/FitQuest.png")}
            style={{ width: 300, height: 300 }}
        />
        <Text className="text-blue text-2xl font-bold">Hi! Welcome to FitQuest</Text>
            


        <View className = "mt-8 flex-row">
            <TouchableOpacity className = "p-4 m-2 rounded bg-opacity-75 bg-lightBlue"
                onPress={() => navigation.navigate("Login")}
            >
                <Text>Login</Text>
            </TouchableOpacity>
            </View>


        </View>
    );
}
