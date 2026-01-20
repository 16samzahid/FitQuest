import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../../components/Avatar";
import LevelCoinSection from "../../components/LevelCoinSection";

const ChildPet = () => {
  return (
    <SafeAreaView className="flex-1 px-4 pt-4">
      {/* Avatar */}
      <View className="flex-row justify-center mt-10 mb-10 justify-evenly width-full">
        <Avatar width={450} height={450} />
        {/* Stats */}
        {/*insert stats card here with health, happiness, hunger*/}
      </View>

      {/* Level */}
      <LevelCoinSection level={10} progress={45} coins={120} />

      {/* Colours and Accessories */}
    </SafeAreaView>
  );
};

export default ChildPet;
