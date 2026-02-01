import { doc, getDoc } from "firebase/firestore";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../config/FirebaseConfig";

const Login = () => {
  const colour = async () => {
    getDoc(doc(db, "Colours", "red_id"));
  };
  let imageURL = colour.data().imageURL;
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 px-4">
        <Image
          source={{ uri: imageURL }}
          style={{ width: 100, height: 100 }}
          className="w-10 h-10 rounded-full mt-8"
          resizeMode="contain"
        />
        <Text>Login</Text>
      </View>
    </SafeAreaView>
  );
};

export default Login;
