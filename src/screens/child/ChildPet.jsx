import { View } from "react-native";
import Avatar from "../../components/Avatar";
import LevelCoinSection from "../../components/LevelCoinSection";

const ChildPet = () => {
  const childName = "Sam";
  return (
    <View className="flex-1 px-4 pt-4 mt-8">
      {/* Avatar */}
      <View className="flex-row justify-center mt-4 justify-evenly width-full">
        <Avatar width={450} height={450} />
        {/* Stats */}
        {/*insert stats card here with health, happiness, hunger*/}
      </View>

      {/* Level */}
      <LevelCoinSection />

      {/* Tasks / Cards */}
    </View>
  );
};

export default ChildPet;
