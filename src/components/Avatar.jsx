import { ActivityIndicator, Image, View } from "react-native";
import { useAppData } from "../context/AppDataContext";

export default function Avatar({ width = 300, height = 300 }) {
  const { pet, loading } = useAppData();

  // loading symbol for loading the image to show progress to user
  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!pet?.imageURL) {
    return null;
  }

  return (
    <View className="w-44 h-44 items-center justify-center self-center mt-8">
      <Image
        source={{ uri: pet.imageURL }}
        style={{ width: width, height: height }}
        className="w-10 h-10 rounded-full mt-8"
        resizeMode="contain"
      />
    </View>
  );
}
