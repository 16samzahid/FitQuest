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
    <View className="mt-5 shadow-md bg-white rounded-3xl p-4">
      <View className="flex-row">
        {/* Health Bar */}
        <View className="flex-1 mr-3">
          <StatBar label="Health" color="red" value={health} icon={heart} />
        </View>

        {/* Hunger Bar */}
        <View className="flex-1 mr-3">
          <StatBar label="Hunger" color="green" value={hunger} icon={cookie} />
        </View>

        {/* Happiness Bar */}
        <View className="flex-1">
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
