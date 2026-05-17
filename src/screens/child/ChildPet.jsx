// child pet screen
// this screen focuses on the pet, rewards, coins, level progress and shop
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../../components/Avatar";
import LevelCoinSection from "../../components/LevelCoinSection";
import Shop from "../../components/Shop";
import { useAppData } from "../../context/AppDataContext";

const ChildPet = () => {
  // get the current child data from app context
  // this gives access to the child's level, xp, coins and loading state
  const { child, loading } = useAppData();

  return (
    <SafeAreaView className="flex-1 px-4 pt-4" edges={["top"]}>
      {/* main pet display section */}
      <View className="mt-10 mb-10 items-center w-full">
        {/* show a larger version of the pet on this screen
            speech bubble is turned off because this page is mainly for customisation */}
        <Avatar width={400} height={400} showSpeechBubble={false} />

        {/* small spacing view under the avatar */}
        <View className="flex-1 ml-4"></View>
      </View>

      {/* shows the child's current level, xp progress and coins */}
      <LevelCoinSection
        level={child?.level}
        progress={child?.xp}
        coins={child?.coins}
      />

      {/* fallback message in case no child profile is found after loading */}
      {!child && !loading ? (
        <Text className="text-center text-gray-600 mt-2">
          No child profile found.
        </Text>
      ) : null}

      {/* shop lets the child buy/equip pet colours and accessories */}
      <Shop />
    </SafeAreaView>
  );
};

export default ChildPet;
