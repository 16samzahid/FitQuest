import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";
import StatBar from "./StatBar";

export default function PetStatsCard({
  health = 15,
  hunger = 82,
  happiness = 60,
}) {
  const cookie = <FontAwesome5 name="cookie-bite" size={28} color="#80420B" />;
  const heart = <AntDesign name="heart" size={28} color="#FD4545" />;
  const smile = (
    <MaterialCommunityIcons name="emoticon-happy" size={28} color="#f1cc11" />
  );
  return (
    <View className="mt-5 bg-white rounded-3xl px-5 py-4 border border-gray-200 shadow-sm relative">
      {/* Bubble shine */}
      <View className="absolute top-2 left-4 h-2 w-16 bg-white/60 rounded-full" />

      <View className="flex-row items-center">
        <View className="flex-1 mx-1">
          <StatBar label="Health" color="red" value={health} icon={heart} />
        </View>

        <View className="flex-1 mx-1">
          <StatBar label="Hunger" color="green" value={hunger} icon={cookie} />
        </View>

        <View className="flex-1 mx-1">
          <StatBar
            label="Happiness"
            color="blue"
            value={happiness}
            icon={smile}
          />
        </View>
      </View>
    </View>
  );
}
