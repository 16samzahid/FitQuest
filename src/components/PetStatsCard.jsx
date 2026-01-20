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
    <MaterialCommunityIcons name="emoticon-happy" size={28} color="#E69420" />
  );
  return (
    <View className="mt-5 shadow-md bg-white rounded-3xl p-4">
      {/* Health Bar */}
      <StatBar label="Health" color="red" value={health} icon={heart} />

      {/* Hunger Bar */}
      <StatBar label="Hunger" color="green" value={hunger} icon={cookie} />

      {/* Happiness Bar */}
      <StatBar label="Happiness" color="blue" value={happiness} icon={smile} />
    </View>
  );
}
