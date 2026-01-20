import { Image, View } from "react-native";

export default function Avatar({ width = 300, height = 300 }) {
  return (
    <View className="w-44 h-44 items-center justify-center self-center mt-8">
      {/* <View className="w-44 h-44 items-center justify-center"> */}
      <Image
        source={require("../../assets/images/FitQuest.png")}
        style={{ width: width, height: height }}
        className="w-10 h-10 rounded-full mt-8"
      />
      {/* </View> */}
    </View>
  );
}
