import { ActivityIndicator, Image, View } from "react-native";
import { useAppData } from "../context/AppDataContext";

export default function Avatar({ width = 300, height = 300 }) {
  const { pet, loading } = useAppData();

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!pet?.imageURL || !pet?.moodImageURL) {
    return null;
  }

  return (
    <View className="w-44 h-44 items-center justify-center self-center mt-10 relative">
      {/* Base pet */}
      <Image
        source={{ uri: pet.imageURL }}
        style={{ width, height }}
        resizeMode="contain"
      />

      {/* Smile overlay */}
      <Image
        source={{ uri: pet.moodImageURL }}
        style={{
          position: "absolute",
          width,
          height,
        }}
        resizeMode="contain"
      />
    </View>
  );
}
