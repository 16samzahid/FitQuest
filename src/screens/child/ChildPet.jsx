import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../../components/Avatar";
import LevelCoinSection from "../../components/LevelCoinSection";
import Shop from "../../components/Shop";
import { useAppData } from "../../context/AppDataContext";

const ChildPet = () => {
  const { child, loading } = useAppData();
  return (
    <SafeAreaView className="flex-1 px-4 pt-4">
      {/* Avatar */}
      <View className="mt-10 mb-10 items-center w-full">
        <Avatar width={450} height={450} />
        {/* Stats */}
        <View className="flex-1 ml-4"></View>
      </View>

      {/* Level */}
      <LevelCoinSection
        level={child?.level ?? 1}
        progress={child?.progress ?? 0}
        coins={child?.coins ?? 0}
      />

      {!child && !loading ? (
        <Text className="text-center text-gray-600 mt-2">
          No child profile found.
        </Text>
      ) : null}

      {/* Colours and Accessories */}
      <Shop
        colours={["#FF4351", "#FF43EC", "#65FF43", "#6E43FF"]}
        accessories={[
          { name: "Hat" },
          { name: "Glasses" },
          { name: "Shoes" },
          { name: "Backpack" },
        ]}
      />
    </SafeAreaView>
  );
};

export default ChildPet;
