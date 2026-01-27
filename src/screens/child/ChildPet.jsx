import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../../components/Avatar";
import LevelCoinSection from "../../components/LevelCoinSection";
import PetStatsCard from "../../components/PetStatsCard";
import { useAppData } from "../../context/AppDataContext";

const ChildPet = () => {
  const { child, loading } = useAppData();
  return (
    <SafeAreaView className="flex-1 px-4 pt-4">
      {/* Avatar */}
      <View className="flex-row justify-center mt-10 mb-10 justify-evenly width-full">
        <Avatar width={450} height={450} />
        {/* Stats */}
        <View className="flex-1 ml-4">
          <PetStatsCard
            health={child?.health ?? 0}
            hunger={child?.hunger ?? 0}
            happiness={child?.happiness ?? 0}
            loading={loading}
          />
        </View>
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
    </SafeAreaView>
  );
};

export default ChildPet;
