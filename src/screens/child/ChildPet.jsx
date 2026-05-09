import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../../components/Avatar";
import LevelCoinSection from "../../components/LevelCoinSection";
import Shop from "../../components/Shop";
import { useAppData } from "../../context/AppDataContext";

const ChildPet = () => {
  const { child, loading } = useAppData();
  return (
    <SafeAreaView className="flex-1 px-4 pt-4" edges={["top"]}>
      {/* Child pet screen shows the avatar and pet progression info. */}
      <View className="mt-10 mb-10 items-center w-full">
        <Avatar width={400} height={400} showSpeechBubble={false} />
        {/* Placeholder view for spacing beneath the avatar. */}
        <View className="flex-1 ml-4"></View>
      </View>

      {/* Level and coin progress for the child's pet. */}
      <LevelCoinSection
        level={child?.level}
        progress={child?.xp}
        coins={child?.coins}
      />

      {!child && !loading ? (
        <Text className="text-center text-gray-600 mt-2">
          No child profile found.
        </Text>
      ) : null}

      {/* Colours and Accessories */}
      <Shop />
    </SafeAreaView>
  );
};

export default ChildPet;
